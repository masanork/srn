import canonicalize from "canonicalize";
import {
  initWasmFromB64,
  buildL2Envelope as wasmBuildL2,
  decryptL2Envelope as wasmDecryptL2,
  getPaddingTargetSize as wasmGetPaddingTargetSize,
  hkdfSha256,
  x25519GetPublicKey
} from "../../core/wasm_core";



export interface ReplayStore {
  has(nonce: string): Promise<boolean>;
  add(nonce: string): Promise<void>;
  reset(): Promise<void>;
}

export class LocalStorageReplayStore implements ReplayStore {
  private key: string;
  private nonces: Set<string>;

  constructor(storageKey: string = "weba_l2_nonces") {
    this.key = storageKey;
    this.nonces = new Set();
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.key);
    if (data) {
      try {
        const list = JSON.parse(data);
        if (Array.isArray(list)) {
          this.nonces = new Set(list);
        }
      } catch (e) {
        console.error("Failed to load replay store from localStorage", e);
      }
    }
  }

  private save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(Array.from(this.nonces)));
    } catch (e) {
      console.error("Failed to save replay store to localStorage", e);
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

export type L2Config = {
  enabled: boolean;
  recipient_kid: string;
  recipient_x25519: string;
  recipient_pqc?: string;
  layer1_ref: string;
  weba_version?: string;
  default_enabled?: boolean;
  user_kid?: string;
  campaign_id?: string;
  key_policy?: OrgKeyPolicy;
  epoch_registry_url?: string; // URL to fetch the epoch public key registry
  prekey_url?: string; // Legacy/Reserved
};

export type L2KeyFile = {
  recipient_kid?: string;
  recipient_x25519_private?: string;
  org_root_key?: string;
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
      classical: string;
      pqc?: string;
    };
    ciphertext: string;
    auth_tag: string;
    aad: string;
  };
  meta: {
    created_at: string;
    nonce: string;
    campaign_id?: string;
    key_policy?: OrgKeyPolicy;
  };
};

export type L2Keywrap = {
  alg: "WebAuthn-PRF-AESGCM-v1";
  kid: string;
  wrapped_key: string;
  prf_salt: string;
  credential_id: string;
  aad?: string;
  rp_id?: string;
};

export type PqcKemProvider = {
  kemId: string;
  encapsulate: (recipientPublicKey: Uint8Array) => {
    sharedSecret: Uint8Array;
    encapsulation: Uint8Array;
  };
  decapsulate: (recipientPrivateKey: Uint8Array, encapsulation: Uint8Array) => Uint8Array;
};

export type OrgKeyPolicy = "campaign" | "campaign+layer1";

/**
 * Calculate target size for padding based on a bucket strategy to mitigate traffic analysis.
 * Now using WASM.
 */
export async function getPaddingTargetSize(currentSize: number): Promise<number> {
  await ensureWasm();
  return wasmGetPaddingTargetSize(currentSize);
}



const L2_SIG_KEY_STORAGE = "weba_l2_ed25519_sk";

function getOrCreateL2SigKey(): Uint8Array {
  const stored = localStorage.getItem(L2_SIG_KEY_STORAGE);
  if (stored) {
    return b64urlDecode(stored);
  }
  // Fallback to random if not in WASM yet, but we should use WASM gen if possible
  // For now, simple random is fine for seed
  const sk = new Uint8Array(32);
  crypto.getRandomValues(sk);
  localStorage.setItem(L2_SIG_KEY_STORAGE, b64urlEncode(sk));
  return sk;
}


export function b64urlEncode(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function b64urlDecode(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
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

// Utility mapping for WASM/JS compatibility
async function ensureWasm() {
  await initWasmFromB64();
}

export async function deriveOrgX25519KeyPair(params: {
  orgRootKey: Uint8Array;
  campaignId: string;
  layer1Ref?: string;
  keyPolicy?: OrgKeyPolicy;
}) {
  await ensureWasm();
  const policy = params.keyPolicy ?? "campaign+layer1";
  if (policy === "campaign+layer1" && !params.layer1Ref) {
    throw new Error("layer1_ref is required for campaign+layer1 policy");
  }
  const context = JSON.stringify({
    domain: "weba-l2/org-x25519",
    campaign_id: params.campaignId,
    key_policy: policy,
    layer1_ref: policy === "campaign+layer1" ? params.layer1Ref : undefined,
  });
  const info = new TextEncoder().encode(context);
  const seed = hkdfSha256(params.orgRootKey, undefined, info, 32);
  const publicKey = x25519GetPublicKey(seed);
  return { publicKey, privateKey: seed, keyPolicy: policy };
}

export async function deriveKeyPairFromPrf(prfKey: Uint8Array) {
  await ensureWasm();
  const info = new TextEncoder().encode("weba-l2/user-x25519");
  const seed = hkdfSha256(prfKey, undefined, info, 32);
  const publicKey = x25519GetPublicKey(seed);
  return { publicKey, privateKey: seed };
}



async function aesGcmEncrypt(
  plaintext: Uint8Array,
  keyBytes: Uint8Array,
  iv: Uint8Array,
  aad: Uint8Array,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", keyBytes as any, "AES-GCM", false, ["encrypt"]);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any, additionalData: aad as any },
    key,
    plaintext as any,
  );
  return new Uint8Array(ct);
}

export async function wrapRecipientPrivateKey(params: {
  recipientSk: Uint8Array;
  prfKey: Uint8Array;
  aad?: Uint8Array;
}): Promise<Uint8Array> {
  await ensureWasm();
  const prk = hkdfSha256(params.prfKey, undefined, new TextEncoder().encode("weba-l2/prk"), 32);
  const key = hkdfSha256(prk, undefined, new TextEncoder().encode("weba-l2/kw"), 32);
  const iv = hkdfSha256(prk, undefined, new TextEncoder().encode("weba-l2/kw-iv"), 12);
  const aad = params.aad ?? new Uint8Array();
  return aesGcmEncrypt(params.recipientSk, key, iv, aad);
}


async function aesGcmDecrypt(
  ciphertext: Uint8Array,
  keyBytes: Uint8Array,
  iv: Uint8Array,
  aad: Uint8Array,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", keyBytes as any, "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as any, additionalData: aad as any },
    key,
    ciphertext as any,
  );
  return new Uint8Array(pt);
}

export async function buildLayer2Envelope(params: {
  layer2_plain: unknown;
  config: L2Config;
  user_kid?: string;
  pqcProvider?: PqcKemProvider | null;
  user_sk?: Uint8Array;
}): Promise<Layer2Encrypted> {
  await ensureWasm();
  const userSk = params.user_sk || getOrCreateL2SigKey();
  const createdAt = new Date().toISOString();
  const userKid = params.user_kid || "user#sig-1";



  const config = {
    ...params.config,
    recipient_pqc: params.config.recipient_pqc || undefined, // handled in WASM
  };

  const envelopeJson = wasmBuildL2(
    canonicalJson(params.layer2_plain),
    userSk,
    userKid,
    JSON.stringify(config),
    createdAt
  );

  return JSON.parse(envelopeJson);
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

/**
 * ReplayGuard provides a simple mechanism to track nonces and prevent replay attacks.
 */
export class ReplayGuard {
  private seenNonces = new Set<string>();
  private store: ReplayStore | undefined;

  constructor(store?: ReplayStore) {
    this.store = store;
  }

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

  async reset(): Promise<void> {
    if (this.store) {
      await this.store.reset();
    }
    this.seenNonces.clear();
  }
}

export async function decryptLayer2Envelope(
  envelope: Layer2Encrypted,
  recipientSk: Uint8Array,
  options?: {
    pqcProvider?: PqcKemProvider | null;
    pqcRecipientSk?: Uint8Array;
    replayGuard?: ReplayGuard;
    skipReplayCheck?: boolean;
  },
): Promise<Layer2Payload> {
  await ensureWasm();

  if (envelope.layer2.enc !== "HPKE-v1") {
    throw new Error(`Unsupported layer2.enc: ${envelope.layer2.enc}`);
  }

  if (!options?.skipReplayCheck) {
    let guard = options?.replayGuard;
    if (!guard) {
      console.warn(
        "SECURITY WARNING: No ReplayGuard provided to decryptLayer2Envelope. Using in-memory ephemeral store. Replays will only be detected within this page session."
      );
      guard = new ReplayGuard();
    }
    const isFresh = await guard.checkAndMark(envelope.meta.nonce);
    if (!isFresh) {
      throw new Error("Security Error: Replay detected (nonce used).");
    }
  }

  const envelopeJson = JSON.stringify(envelope);
  const pqcSk = options?.pqcRecipientSk;

  try {
    const plainJson = wasmDecryptL2(envelopeJson, recipientSk, pqcSk);
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

export async function fetchPreKey(url: string): Promise<{ recipient_x25519: string; recipient_pqc?: string; kid: string } | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Pre-key fetch failed: ${resp.status}`);
    return await resp.json();
  } catch (e) {
    console.error("Failed to fetch pre-key", e);
    return null;
  }
}

export type EpochPublicKey = {
  kid: string;
  publicKey: string; // base64url
  validFrom: string; // ISO
  validUntil: string; // ISO
};

export type EpochRegistry = {
  updated_at: string;
  keys: EpochPublicKey[];
};

export async function fetchEpochRegistry(url: string): Promise<EpochRegistry | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn("Failed to fetch epoch registry:", e);
    return null;
  }
}

export function selectEpochKey(registry: EpochRegistry): EpochPublicKey | null {
  const now = new Date();
  // Find key where now is between validFrom and validUntil
  const candidate = registry.keys.find(k => {
    const start = new Date(k.validFrom);
    const end = new Date(k.validUntil);
    return now >= start && now <= end;
  });
  return candidate || null;
}

export async function unwrapRecipientPrivateKey(params: {
  keywrap: L2Keywrap;
  prfKey: Uint8Array;
}): Promise<Uint8Array> {
  await ensureWasm();
  const prk = hkdfSha256(params.prfKey, undefined, new TextEncoder().encode("weba-l2/prk"), 32);
  const key = hkdfSha256(prk, undefined, new TextEncoder().encode("weba-l2/kw"), 32);
  const iv = hkdfSha256(prk, undefined, new TextEncoder().encode("weba-l2/kw-iv"), 12);
  const aad = params.keywrap.aad ? b64urlDecode(params.keywrap.aad) : new Uint8Array();
  const wrapped = b64urlDecode(params.keywrap.wrapped_key);
  return aesGcmDecrypt(wrapped, key, iv, aad);
}