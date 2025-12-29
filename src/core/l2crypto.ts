import { ed25519, x25519 } from "../vendor/curves/ed25519.js";
import { sha256 } from "../vendor/hashes/sha2.js";
import { hkdf } from "../vendor/hashes/hkdf.js";
import { randomBytes } from "node:crypto";
import { createCipheriv, createDecipheriv } from "node:crypto";
import canonicalize from "canonicalize";
import * as fs from "node:fs";
import { initWasm, aesGcmEncrypt, aesGcmDecrypt } from "./wasm_core";

export interface ReplayStore {
  has(nonce: string): Promise<boolean>;
  add(nonce: string): Promise<void>;
  reset(): Promise<void>;
}

export class JsonFileReplayStore implements ReplayStore {
  private file: string;
  private nonces: Set<string>;

  constructor(filePath: string) {
    this.file = filePath;
    this.nonces = new Set();
    this.load();
  }

  private load() {
    if (fs.existsSync(this.file)) {
      try {
        const data = fs.readFileSync(this.file, "utf-8");
        const list = JSON.parse(data);
        if (Array.isArray(list)) {
          this.nonces = new Set(list);
        }
      } catch (e) {
        console.error("Failed to load replay store:", e);
      }
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.file, JSON.stringify(Array.from(this.nonces)), "utf-8");
    } catch (e) {
      console.error("Failed to save replay store:", e);
    }
  }

  async has(nonce: string): Promise<boolean> {
    return this.nonces.has(nonce);
  }

  async add(nonce: string): Promise<void> {
    this.nonces.add(nonce);
    this.save();
  }

  async reset(): Promise<void> {
    this.nonces.clear();
    this.save();
  }
}

export type Layer2Signature = {
  alg: "Ed25519";
  kid: string;
  sig: string; // base64url
  created_at: string;
};

export type Layer2Plain = any;

export type Layer2Payload = {
  layer2_plain: Layer2Plain;
  layer2_sig: Layer2Signature;
  _padding?: string;
};

export type Layer2Encrypted = {
  weba_version: string;
  layer1_ref: string;
  layer2: {
    enc: "HPKE-v1";
    suite: {
      kem: string;
      kdf: "HKDF-SHA256";
      aead: "AES-256-GCM";
    };
    recipient: string;
    encapsulated: {
      classical: string; // base64url(ephemeral_pk)
      pqc?: string;      // base64url(kem_ct)
    };
    ciphertext: string; // base64url (without tag)
    auth_tag: string;   // base64url (16 bytes)
    aad: string;        // base64url(aad_json)
  };
  meta: {
    created_at: string;
    nonce: string; // base64url
    campaign_id?: string;
    key_policy?: OrgKeyPolicy;
  };
};

// Utilities
export function toBase64Url(buf: Uint8Array): string {
  return Buffer.from(buf).toString("base64url");
}

export function fromBase64Url(str: string): Uint8Array {
  return Buffer.from(str, "base64url");
}

export function canonicalJson(obj: any): string {
  const result = canonicalize(obj);
  if (result === undefined) throw new Error("Failed to canonicalize JSON");
  return result;
}

export type PqcKemProvider = {
  kemId: string;
  encapsulate: (recipientPublicKey: Uint8Array) => {
    sharedSecret: Uint8Array;
    encapsulation: Uint8Array;
  };
  decapsulate: (recipientPrivateKey: Uint8Array, encapsulation: Uint8Array) => Uint8Array;
};

export type PqcEncryptOptions = {
  kem: PqcKemProvider;
  recipientPublicKey: Uint8Array;
};

export type PqcDecryptOptions = {
  kem: PqcKemProvider;
  recipientPrivateKey: Uint8Array;
};

export type OrgKeyPolicy = "campaign" | "campaign+layer1";

/**
 * Calculate target size for padding based on a bucket strategy to mitigate traffic analysis.
 * Uses jumps (1KB, 4KB, 16KB, 64KB, 256KB, 1MB) to hide exact payload size for larger data.
 */
export function getPaddingTargetSize(currentSize: number): number {
  const buckets = [1024, 4096, 16384, 65536, 262144, 1048576];
  for (const b of buckets) {
    if (currentSize <= b) return b;
  }
  return Math.ceil(currentSize / 1048576) * 1048576;
}

export function deriveOrgRootKey(params: { srnInstanceKey: Uint8Array; orgId: string }) {
  const context = canonicalJson({
    domain: "weba-l2/org-root",
    org_id: params.orgId,
  });
  const info = Buffer.from(context, "utf-8");
  const rootKey = hkdf(sha256, params.srnInstanceKey, undefined, info, 32);
  return rootKey;
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export function deriveOrgX25519KeyPair(params: {
  orgRootKey: Uint8Array;
  campaignId: string;
  layer1Ref?: string;
  keyPolicy?: OrgKeyPolicy;
}) {
  const policy = params.keyPolicy ?? "campaign+layer1";
  if (policy === "campaign+layer1" && !params.layer1Ref) {
    throw new Error("layer1_ref is required for campaign+layer1 policy");
  }
  const context = canonicalJson({
    domain: "weba-l2/org-x25519",
    campaign_id: params.campaignId,
    key_policy: policy,
    layer1_ref: policy === "campaign+layer1" ? params.layer1Ref : undefined,
  });
  const info = Buffer.from(context, "utf-8");
  const seed = hkdf(sha256, params.orgRootKey, undefined, info, 32);
  const publicKey = x25519.getPublicKey(seed);
  return { publicKey, privateKey: seed, keyPolicy: policy };
}

/**
 * Generate a recipient keypair for encryption (X25519).
 */
export function generateRecipientKeyPair() {
  const priv = randomBytes(32);
  const pub = x25519.getPublicKey(priv);
  return { publicKey: pub, privateKey: priv };
}

/**
 * Generate a user keypair for signing (Ed25519).
 */
export function generateUserKeyPair() {
  const priv = randomBytes(32);
  const pub = ed25519.getPublicKey(priv);
  return { publicKey: pub, privateKey: priv };
}

/**
 * Sign Layer 2 plaintext.
 */
export async function signLayer2(
  plain: Layer2Plain,
  privateKey: Uint8Array,
  kid: string
): Promise<Layer2Signature> {
  const createdAt = new Date().toISOString();
  const msg = canonicalJson(plain);
  const sig = ed25519.sign(Buffer.from(msg, "utf-8"), privateKey);

  return {
    alg: "Ed25519",
    kid,
    sig: toBase64Url(sig),
    created_at: createdAt,
  };
}

/**
 * Verify Layer 2 signature.
 */
export function verifyLayer2Signature(
  payload: Layer2Payload,
  publicKey: Uint8Array
): boolean {
  const msg = canonicalJson(payload.layer2_plain);
  const sig = fromBase64Url(payload.layer2_sig.sig);
  return ed25519.verify(sig, Buffer.from(msg, "utf-8"), publicKey);
}

/**
 * Encrypt Layer 2 payload.
 */
export async function encryptLayer2(
  payload: Layer2Payload,
  recipientPublicKey: Uint8Array,
  layer1Ref: string,
  recipientKid: string,
  options?: { pqc?: PqcEncryptOptions; meta?: { campaign_id?: string; key_policy?: OrgKeyPolicy } }
): Promise<Layer2Encrypted> {
  const webaVersion = "0.1";
  const createdAt = new Date().toISOString();
  const nonce = randomBytes(16);

  // 1. Prepare AAD
  const aadObj = {
    layer1_ref: layer1Ref,
    recipient: recipientKid,
    weba_version: webaVersion,
  };
  const aadStr = canonicalJson(aadObj);
  const aadBytes = Buffer.from(aadStr, "utf-8");

  // 2. KEM: X25519
  const ephemeralPriv = randomBytes(32);
  const ephemeralPub = x25519.getPublicKey(ephemeralPriv);
  const ss1 = x25519.getSharedSecret(ephemeralPriv, recipientPublicKey);

  let ikm = ss1;
  let pqcEncapsulation: Uint8Array | undefined;
  let kemId = "X25519";
  if (options?.pqc) {
    const pqc = options.pqc;
    const kemResult = pqc.kem.encapsulate(pqc.recipientPublicKey);
    pqcEncapsulation = kemResult.encapsulation;
    ikm = concatBytes(ss1, kemResult.sharedSecret);
    kemId = `X25519+${pqc.kem.kemId}`;
  }

  // 3. KDF: HKDF-SHA256
  // Use aadBytes as salt to bind the key to the context
  const prk = hkdf(sha256, ikm, aadBytes, Buffer.from("weba-l2/prk", "utf-8"), 32);
  const key = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/key", "utf-8"), 32);
  const iv = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/iv", "utf-8"), 12);

  // 4. AEAD: AES-256-GCM
  // Pad using bucket method to mitigate traffic analysis
  const currentBytes = Buffer.from(canonicalJson(payload), "utf-8");
  const overhead = 32; // approximate overhead for JSON structure {"_padding":"..."}
  const targetSize = getPaddingTargetSize(currentBytes.length + overhead);
  const paddingLen = Math.max(0, targetSize - currentBytes.length - overhead);

  const padding = randomBytes(paddingLen).toString("hex");
  const payloadWithPadding = { ...payload, _padding: padding };

  const plaintext = Buffer.from(canonicalJson(payloadWithPadding), "utf-8");

  // Use WASM for encryption
  await initWasm();
  const ciphertextWithTag = aesGcmEncrypt(key, iv, plaintext, aadBytes);
  const authTag = ciphertextWithTag.slice(-16);
  const actualCiphertext = ciphertextWithTag.slice(0, -16);

  return {
    weba_version: webaVersion,
    layer1_ref: layer1Ref,
    layer2: {
      enc: "HPKE-v1",
      suite: {
        kem: kemId,
        kdf: "HKDF-SHA256",
        aead: "AES-256-GCM",
      },
      recipient: recipientKid,
      encapsulated: {
        classical: toBase64Url(ephemeralPub),
        ...(pqcEncapsulation ? { pqc: toBase64Url(pqcEncapsulation) } : {}),
      },
      ciphertext: toBase64Url(actualCiphertext),
      auth_tag: toBase64Url(authTag),
      aad: toBase64Url(aadBytes),
    },
    meta: {
      created_at: createdAt,
      nonce: toBase64Url(nonce),
      ...(options?.meta?.campaign_id ? { campaign_id: options.meta.campaign_id } : {}),
      ...(options?.meta?.key_policy ? { key_policy: options.meta.key_policy } : {}),
    },
  };
}

/**
 * Decrypt Layer 2 envelope.
 */
/**
 * ReplayGuard provides a simple mechanism to track nonces and prevent replay attacks.
 * In a production environment, this should be backed by a persistent store (e.g., Redis).
 */
export class ReplayGuard {
  private seenNonces = new Set<string>();
  private store: ReplayStore | undefined;

  constructor(store?: ReplayStore) {
    this.store = store;
  }

  /**
   * Check if a nonce has been seen before. If not, mark it as seen.
   * @param nonce The nonce to check (base64url)
   * @returns true if the nonce is new, false if it's a replay
   */
  async checkAndMark(nonce: string): Promise<boolean> {
    if (this.store) {
      if (await this.store.has(nonce)) {
        return false;
      }
      await this.store.add(nonce);
      return true;
    }

    if (this.seenNonces.has(nonce)) {
      return false;
    }
    this.seenNonces.add(nonce);
    return true;
  }

  /**
   * Clear the seen nonces.
   */
  async reset(): Promise<void> {
    if (this.store) {
      await this.store.reset();
    }
    this.seenNonces.clear();
  }
}

export async function decryptLayer2(
  envelope: Layer2Encrypted,
  recipientPrivateKey: Uint8Array,
  options?: { pqc?: PqcDecryptOptions }
): Promise<Layer2Payload> {
  try {
    if (envelope.layer2.suite.aead !== "AES-256-GCM") {
      throw new Error("Unsupported AEAD");
    }

    const aadBytes = fromBase64Url(envelope.layer2.aad);

    // Verify AAD consistency with envelope
    const aadObj = JSON.parse(Buffer.from(aadBytes).toString("utf-8"));
    if (aadObj.layer1_ref !== envelope.layer1_ref || aadObj.recipient !== envelope.layer2.recipient) {
      throw new Error("AAD mismatch");
    }

    // 1. KEM: X25519
    const ephemeralPub = fromBase64Url(envelope.layer2.encapsulated.classical);
    const ss1 = x25519.getSharedSecret(recipientPrivateKey, ephemeralPub);
    let ikm = ss1;
    if (envelope.layer2.encapsulated.pqc) {
      const pqc = options?.pqc;
      if (!pqc) {
        throw new Error("Missing PQC KEM for envelope");
      }
      const pqcEnc = fromBase64Url(envelope.layer2.encapsulated.pqc);
      const ss2 = pqc.kem.decapsulate(pqc.recipientPrivateKey, pqcEnc);
      ikm = concatBytes(ss1, ss2);
    }

    // 2. KDF: HKDF-SHA256
    const salt = aadBytes; // Use aadBytes as salt to bind the key to the context
    const prk = hkdf(sha256, ikm, salt, Buffer.from("weba-l2/prk", "utf-8"), 32);
    const key = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/key", "utf-8"), 32);
    const iv = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/iv", "utf-8"), 12);

    // 3. AEAD: AES-256-GCM
    const ciphertext = fromBase64Url(envelope.layer2.ciphertext);
    const authTag = fromBase64Url(envelope.layer2.auth_tag);
    const ciphertextWithTag = new Uint8Array(ciphertext.length + authTag.length);
    ciphertextWithTag.set(ciphertext);
    ciphertextWithTag.set(authTag, ciphertext.length);

    // Use WASM for decryption
    await initWasm();
    const plaintext = aesGcmDecrypt(key, iv, ciphertextWithTag, aadBytes);

    return JSON.parse(Buffer.from(plaintext).toString("utf-8"));
  } catch (e) {
    throw new Error("Decryption failed");
  }
}
