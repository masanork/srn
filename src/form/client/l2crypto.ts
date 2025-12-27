import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import canonicalize from "canonicalize";

export type L2Config = {
  enabled: boolean;
  recipient_kid: string;
  recipient_x25519: string;
  layer1_ref: string;
  weba_version?: string;
  default_enabled?: boolean;
  user_kid?: string;
};

export type Layer2Signature = {
  alg: "Ed25519";
  kid: string;
  sig: string;
  created_at: string;
};

export type Layer2Payload = {
  layer2_plain: unknown;
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
      classical: string;
      pqc?: string;
    };
    ciphertext: string;
    aad: string;
  };
  meta: {
    created_at: string;
    nonce: string;
  };
};

const L2_SIG_KEY_STORAGE = "weba_l2_ed25519_sk";

function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function canonicalJson(obj: unknown): string {
  const result = canonicalize(obj);
  if (result === undefined) {
    throw new Error("Failed to canonicalize JSON");
  }
  return result;
}

function randomBytes(len: number): Uint8Array {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return bytes;
}

function getOrCreateL2SigKey(): Uint8Array {
  const stored = localStorage.getItem(L2_SIG_KEY_STORAGE);
  if (stored) {
    return b64urlDecode(stored);
  }
  const sk = ed25519.utils.randomSecretKey();
  localStorage.setItem(L2_SIG_KEY_STORAGE, b64urlEncode(sk));
  return sk;
}

function buildAad(layer1Ref: string, recipientKid: string, webaVersion: string): Uint8Array {
  const aadObj = {
    layer1_ref: layer1Ref,
    recipient: recipientKid,
    weba_version: webaVersion,
  };
  return new TextEncoder().encode(canonicalJson(aadObj));
}

async function aesGcmEncrypt(
  plaintext: Uint8Array,
  keyBytes: Uint8Array,
  iv: Uint8Array,
  aad: Uint8Array,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    plaintext,
  );
  return new Uint8Array(ct);
}

export async function buildLayer2Envelope(params: {
  layer2_plain: unknown;
  config: L2Config;
  user_kid?: string;
}): Promise<Layer2Encrypted> {
  const webaVersion = params.config.weba_version ?? "0.1";
  const recipientKid = params.config.recipient_kid;
  const layer1Ref = params.config.layer1_ref;

  const userKid = params.user_kid ?? "user#sig-1";
  const userSk = getOrCreateL2SigKey();

  const plainJson = canonicalJson(params.layer2_plain);
  const plainBytes = new TextEncoder().encode(plainJson);
  const sig = ed25519.sign(plainBytes, userSk);
  const layer2Sig: Layer2Signature = {
    alg: "Ed25519",
    kid: userKid,
    sig: b64urlEncode(sig),
    created_at: new Date().toISOString(),
  };

  const payload: Layer2Payload = {
    layer2_plain: params.layer2_plain,
    layer2_sig: layer2Sig,
  };

  const aadBytes = buildAad(layer1Ref, recipientKid, webaVersion);
  const payloadBytes = new TextEncoder().encode(canonicalJson(payload));

  const recipientPub = b64urlDecode(params.config.recipient_x25519);
  const ephSk = randomBytes(32);
  const ephPk = x25519.getPublicKey(ephSk);
  const ss1 = x25519.getSharedSecret(ephSk, recipientPub);

  const prk = hkdf(sha256, ss1, aadBytes, undefined, 32);
  const key = hkdf(sha256, prk, undefined, new TextEncoder().encode("weba-l2/key"), 32);
  const iv = hkdf(sha256, prk, undefined, new TextEncoder().encode("weba-l2/iv"), 12);

  const ciphertext = await aesGcmEncrypt(payloadBytes, key, iv, aadBytes);

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
        classical: b64urlEncode(ephPk),
      },
      ciphertext: b64urlEncode(ciphertext),
      aad: b64urlEncode(aadBytes),
    },
    meta: {
      created_at: new Date().toISOString(),
      nonce: b64urlEncode(randomBytes(16)),
    },
  };
}

export function loadL2Config(): L2Config | null {
  const el = document.getElementById("weba-l2-config");
  if (!el || !el.textContent) return null;
  try {
    return JSON.parse(el.textContent) as L2Config;
  } catch {
    return null;
  }
}
