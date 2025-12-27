import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { randomBytes } from "node:crypto";
import { createCipheriv, createDecipheriv } from "node:crypto";
import canonicalize from "canonicalize";

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
    ciphertext: string; // base64url
    aad: string;        // base64url(aad_json)
  };
  meta: {
    created_at: string;
    nonce: string; // base64url
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
  recipientKid: string
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

  // IKM (Input Key Material)
  const ikm = ss1; // PQC (ss2) would be appended here if used

  // 3. KDF: HKDF-SHA256
  // Use aadBytes as salt to bind the key to the context
  const prk = hkdf(sha256, ikm, aadBytes, undefined, 32);
  const key = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/key", "utf-8"), 32);
  const iv = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/iv", "utf-8"), 12);

  // 4. AEAD: AES-256-GCM
  const plaintext = Buffer.from(canonicalJson(payload), "utf-8");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aadBytes);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    weba_version: webaVersion,
    layer1_ref: layer1Ref,
    layer2: {
      enc: "HPKE-v1",
      suite: {
        kem: "X25519",
        kdf: "HKDF-SHA256",
        aead: "AES-256-GCM",
      },
      recipient: recipientKid,
      encapsulated: {
        classical: toBase64Url(ephemeralPub),
      },
      ciphertext: toBase64Url(Buffer.concat([ciphertext, authTag])),
      aad: toBase64Url(aadBytes),
    },
    meta: {
      created_at: createdAt,
      nonce: toBase64Url(nonce),
    },
  };
}

/**
 * Decrypt Layer 2 envelope.
 */
export async function decryptLayer2(
  envelope: Layer2Encrypted,
  recipientPrivateKey: Uint8Array
): Promise<Layer2Payload> {
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
  const ikm = ss1;

  // 2. KDF: HKDF-SHA256
  const prk = hkdf(sha256, ikm, aadBytes, undefined, 32);
  const key = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/key", "utf-8"), 32);
  const iv = hkdf(sha256, prk, undefined, Buffer.from("weba-l2/iv", "utf-8"), 12);

  // 3. AEAD: AES-256-GCM
  const fullCiphertext = fromBase64Url(envelope.layer2.ciphertext);
  const authTag = fullCiphertext.slice(-16);
  const ciphertext = fullCiphertext.slice(0, -16);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(aadBytes);
  decipher.setAuthTag(authTag);
  
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString("utf-8"));
}
