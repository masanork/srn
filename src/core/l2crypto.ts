import { randomBytes } from "node:crypto";
import { createCipheriv, createDecipheriv } from "node:crypto";
import canonicalize from "canonicalize";
import * as fs from "node:fs";
import {
  initWasm,
  constantTimeEqual,
  aesGcmEncrypt,
  aesGcmDecrypt,
  x25519GenerateKeyPair,
  x25519GetSharedSecret,
  x25519GetPublicKey,
  ed25519GenerateKeyPair,
  ed25519Sign,
  ed25519Verify,
  sha256Hash,
  hkdfSha256,
  getPaddingTargetSize as wasmGetPadding,
  buildL2Envelope as wasmBuildL2,
  decryptL2Envelope as wasmDecryptL2,
} from "./wasm_core";


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
  encapsulate: (recipientPublicKey: Uint8Array) =>
    | { sharedSecret: Uint8Array; encapsulation: Uint8Array }
    | Promise<{ sharedSecret: Uint8Array; encapsulation: Uint8Array }>;
  decapsulate: (recipientPrivateKey: Uint8Array, encapsulation: Uint8Array) => Uint8Array | Promise<Uint8Array>;
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
  return wasmGetPadding(currentSize);
}

export async function deriveOrgRootKey(params: { srnInstanceKey: Uint8Array; orgId: string }) {
  await initWasm();
  const context = canonicalJson({
    domain: "weba-l2/org-root",
    org_id: params.orgId,
  });
  const info = Buffer.from(context, "utf-8");
  const rootKey = hkdfSha256(params.srnInstanceKey, undefined, info, 32);
  return rootKey;
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export async function deriveOrgX25519KeyPair(params: {
  orgRootKey: Uint8Array;
  campaignId: string;
  layer1Ref?: string;
  keyPolicy?: OrgKeyPolicy;
}) {
  await initWasm();
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
  const seed = hkdfSha256(params.orgRootKey, undefined, info, 32);
  const publicKey = x25519GetPublicKey(seed);
  return { publicKey, privateKey: seed, keyPolicy: policy };
}

/**
 * Generate a recipient keypair for encryption (X25519).
 */
export async function generateRecipientKeyPair(): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  await initWasm();
  return x25519GenerateKeyPair();
}

/**
 * Generate a user keypair for signing (Ed25519).
 */
export async function generateUserKeyPair(): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  await initWasm();
  return ed25519GenerateKeyPair();
}

/**
 * Sign Layer 2 plaintext.
 */
export async function signLayer2(payload: any, privateKey: Uint8Array, userId: string): Promise<Layer2Signature> {
  const canon = canonicalize(payload);
  if (!canon) throw new Error("Failed to canonicalize payload");
  const msg = new TextEncoder().encode(canon);

  await initWasm();
  const sigBytes = ed25519Sign(privateKey, msg);

  return {
    alg: "Ed25519",
    kid: userId,
    sig: toBase64Url(sigBytes),
    created_at: new Date().toISOString(),
  };
}

/**
 * Verify Layer 2 signature.
 */
export async function verifyLayer2Signature(payload: Layer2Payload, publicKey: Uint8Array): Promise<boolean> {
  const canon = canonicalize(payload.layer2_plain);
  if (!canon) return false;
  const msg = new TextEncoder().encode(canon);
  const sigBytes = fromBase64Url(payload.layer2_sig.sig);

  await initWasm();
  return ed25519Verify(publicKey, msg, sigBytes);
}

/**
 * Encrypt Layer 2 payload.
 */
export async function encryptLayer2(
  payload: Layer2Payload,
  recipientPublicKey: Uint8Array,
  layer1Ref: string,
  recipientKid: string,
  options?: {
    userSk?: Uint8Array;
    pqc?: PqcEncryptOptions;
    meta?: {
      campaign_id?: string;
      key_policy?: OrgKeyPolicy;
      created_at?: string;
    }
  }
): Promise<Layer2Encrypted> {
  await initWasm();
  const userSk = options?.userSk || (await generateUserKeyPair()).privateKey;
  const createdAt = options?.meta?.created_at || new Date().toISOString();

  const config = {
    enabled: true,
    recipient_kid: recipientKid,
    recipient_x25519: toBase64Url(recipientPublicKey),
    recipient_pqc: options?.pqc ? toBase64Url(options.pqc.recipientPublicKey) : undefined,
    layer1_ref: layer1Ref,
    campaign_id: options?.meta?.campaign_id,
  };

  const userKid = options?.userSk ? "user#sig-custom" : "user#sig-1"; // Simplified for now

  const envelopeJson = wasmBuildL2(
    canonicalJson(payload.layer2_plain),
    userSk,
    userKid,
    JSON.stringify(config),
    createdAt
  );


  return JSON.parse(envelopeJson);
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
  await initWasm();
  const envelopeJson = JSON.stringify(envelope);
  const pqcSk = options?.pqc?.recipientPrivateKey;

  try {
    const plainJson = wasmDecryptL2(envelopeJson, recipientPrivateKey, pqcSk);
    return JSON.parse(plainJson);
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : String(e);
    // Re-throw specific errors to match existing behavior
    if (msg.includes("Missing PQC KEM") || msg.includes("AAD mismatch")) {
      throw new Error(msg);
    }
    throw new Error("Decryption failed");
  }
}
