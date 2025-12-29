import crypto from "node:crypto";
import { ml_kem768 } from "@noble/post-quantum/ml-kem";

export const WEBA_VERSION = "0.1";
const HPKE_VERSION_LABEL = "HPKE-v1";
const HPKE_SUITE_ID_LABEL = "HPKE";
const HPKE_KDF_ID_HKDF_SHA256 = 0x0001;
const HPKE_AEAD_ID_AES_256_GCM = 0x0002;
const HPKE_KEM_ID_X25519 = 0x0020;
const HPKE_KEM_ID_X25519_ML_KEM_768 = 0x0030;
const HPKE_INFO_CONTEXT = "weba-l2";

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
    auth_tag: string;
    aad: string;
  };
  meta: {
    created_at: string;
    nonce: string;
  };
};

export type RecipientKeyFile = {
  recipient_kid: string;
  x25519: {
    public_jwk: JsonWebKey;
    private_jwk: JsonWebKey;
  };
  pqc?: {
    alg: "ML-KEM-768";
    available: boolean;
    public_key?: string;
    private_key?: string;
  };
  user_sig: {
    alg: "Ed25519";
    kid: string;
    public_jwk: JsonWebKey;
    private_jwk: JsonWebKey;
  };
};

export function b64urlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function b64urlDecode(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return new Uint8Array(Buffer.from(b64, "base64"));
}

export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  const type = typeof value;
  if (type === "string") return JSON.stringify(value);
  if (type === "boolean") return value ? "true" : "false";
  if (type === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Non-finite numbers are not supported in canonical JSON");
    }
    if (!Number.isInteger(value)) {
      throw new Error("Floats are not supported in canonical JSON");
    }
    if (!Number.isSafeInteger(value)) {
      throw new Error("Unsafe integers are not supported in canonical JSON");
    }
    return value.toString(10);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }
  if (type === "object") {
    const proto = Object.prototype.toString.call(value);
    if (proto !== "[object Object]") {
      throw new Error("Only plain objects are supported in canonical JSON");
    }
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  throw new Error(`Unsupported type in canonical JSON: ${type}`);
}

export function canonicalJsonBytes(value: unknown): Uint8Array {
  return new Uint8Array(Buffer.from(canonicalJson(value), "utf8"));
}

export function generateRecipientKeys(options?: {
  recipientKid?: string;
  usePqc?: boolean;
}): RecipientKeyFile {
  const recipientKid = options?.recipientKid ?? "issuer#kem-2025";
  const x25519 = crypto.generateKeyPairSync("x25519");
  const x25519PublicJwk = x25519.publicKey.export({ format: "jwk" }) as JsonWebKey;
  const x25519PrivateJwk = x25519.privateKey.export({ format: "jwk" }) as JsonWebKey;

  const pqc = options?.usePqc
    ? (() => {
        const { publicKey, secretKey } = ml_kem768.keygen();
        return {
          alg: "ML-KEM-768" as const,
          available: true,
          public_key: b64urlEncode(publicKey),
          private_key: b64urlEncode(secretKey),
        };
      })()
    : {
        alg: "ML-KEM-768" as const,
        available: false,
      };

  const userSig = generateUserSigKeys();

  return {
    recipient_kid: recipientKid,
    x25519: {
      public_jwk: x25519PublicJwk,
      private_jwk: x25519PrivateJwk,
    },
    pqc,
    user_sig: userSig,
  };
}

export function generateUserSigKeys(options?: { kid?: string }): RecipientKeyFile["user_sig"] {
  const keyPair = crypto.generateKeyPairSync("ed25519");
  return {
    alg: "Ed25519",
    kid: options?.kid ?? "user#sig-1",
    public_jwk: keyPair.publicKey.export({ format: "jwk" }) as JsonWebKey,
    private_jwk: keyPair.privateKey.export({ format: "jwk" }) as JsonWebKey,
  };
}

export function signLayer2Plain(
  layer2Plain: unknown,
  userKeys: RecipientKeyFile["user_sig"],
  createdAt = new Date().toISOString(),
): Layer2Signature {
  if (userKeys.alg !== "Ed25519") {
    throw new Error(`Unsupported signature alg: ${userKeys.alg}`);
  }
  const message = Buffer.from(canonicalJson(layer2Plain), "utf8");
  const privateKey = crypto.createPrivateKey({ key: userKeys.private_jwk, format: "jwk" });
  const sigBytes = crypto.sign(null, message, privateKey);
  return {
    alg: "Ed25519",
    kid: userKeys.kid,
    sig: b64urlEncode(sigBytes),
    created_at: createdAt,
  };
}

export function verifyLayer2Signature(
  layer2Plain: unknown,
  sig: Layer2Signature,
  publicJwk: JsonWebKey,
): boolean {
  if (sig.alg !== "Ed25519") return false;
  const message = Buffer.from(canonicalJson(layer2Plain), "utf8");
  const publicKey = crypto.createPublicKey({ key: publicJwk, format: "jwk" });
  return crypto.verify(null, message, publicKey, b64urlDecode(sig.sig));
}

export function buildAad(layer1Ref: string, recipientKid: string, webaVersion = WEBA_VERSION) {
  const aadObj = {
    layer1_ref: layer1Ref,
    recipient: recipientKid,
    weba_version: webaVersion,
  };
  return canonicalJsonBytes(aadObj);
}

function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Uint8Array {
  return new Uint8Array(crypto.createHmac("sha256", salt).update(ikm).digest());
}

function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  const hashLen = 32;
  const blocks = Math.ceil(length / hashLen);
  if (blocks > 255) {
    throw new Error("HKDF expand too large");
  }
  let output = Buffer.alloc(0);
  let prev = Buffer.alloc(0);
  for (let i = 1; i <= blocks; i += 1) {
    const hmac = crypto.createHmac("sha256", prk);
    hmac.update(prev);
    hmac.update(info);
    hmac.update(Buffer.from([i]));
    prev = hmac.digest();
    output = Buffer.concat([output, prev]);
  }
  return new Uint8Array(output.slice(0, length));
}

function toU16BE(value: number): Uint8Array {
  const buf = Buffer.alloc(2);
  buf.writeUInt16BE(value);
  return new Uint8Array(buf);
}

function concatBytes(parts: Uint8Array[]) {
  return new Uint8Array(Buffer.concat(parts.map((part) => Buffer.from(part))));
}

function suiteIdForSuite(suite: { kem: string; kdf: string; aead: string }): Uint8Array {
  const normalizedKem = suite.kem.replace(/\s+/g, "");
  const kemId =
    normalizedKem === "X25519"
      ? HPKE_KEM_ID_X25519
      : normalizedKem === "X25519+ML-KEM-768" || normalizedKem === "X25519(+ML-KEM-768)"
        ? HPKE_KEM_ID_X25519_ML_KEM_768
        : undefined;
  if (!kemId) {
    throw new Error(`Unsupported HPKE KEM ID for suite: ${suite.kem}`);
  }
  if (suite.kdf !== "HKDF-SHA256" || suite.aead !== "AES-256-GCM") {
    throw new Error(`Unsupported HPKE KDF/AEAD for suite: ${suite.kdf}/${suite.aead}`);
  }
  return concatBytes([
    Buffer.from(HPKE_SUITE_ID_LABEL, "utf8"),
    toU16BE(kemId),
    toU16BE(HPKE_KDF_ID_HKDF_SHA256),
    toU16BE(HPKE_AEAD_ID_AES_256_GCM),
  ]);
}

function labeledExtract(salt: Uint8Array, suiteId: Uint8Array, label: string, ikm: Uint8Array): Uint8Array {
  const labeledIkm = concatBytes([
    Buffer.from(HPKE_VERSION_LABEL, "utf8"),
    suiteId,
    Buffer.from(label, "utf8"),
    ikm,
  ]);
  return hkdfExtract(salt, labeledIkm);
}

function labeledExpand(
  prk: Uint8Array,
  suiteId: Uint8Array,
  label: string,
  info: Uint8Array,
  length: number,
): Uint8Array {
  const labeledInfo = concatBytes([
    toU16BE(length),
    Buffer.from(HPKE_VERSION_LABEL, "utf8"),
    suiteId,
    Buffer.from(label, "utf8"),
    info,
  ]);
  return hkdfExpand(prk, labeledInfo, length);
}

function encodeHpkeInfoField(value: string): Uint8Array {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.length > 0xffff) {
    throw new Error("HPKE info field too long");
  }
  return concatBytes([toU16BE(bytes.length), bytes]);
}

function buildHpkeInfo(params: {
  weba_version: string;
  enc: string;
  suite: { kem: string; kdf: string; aead: string };
  layer1_ref: string;
  recipient: string;
}): Uint8Array {
  return concatBytes([
    encodeHpkeInfoField(HPKE_INFO_CONTEXT),
    encodeHpkeInfoField(params.weba_version),
    encodeHpkeInfoField(params.enc),
    encodeHpkeInfoField(params.suite.kem),
    encodeHpkeInfoField(params.suite.kdf),
    encodeHpkeInfoField(params.suite.aead),
    encodeHpkeInfoField(params.layer1_ref),
    encodeHpkeInfoField(params.recipient),
  ]);
}

function deriveKeyMaterial(params: {
  suite: { kem: string; kdf: string; aead: string };
  info: Uint8Array;
  ikm: Uint8Array;
}) {
  const suiteId = suiteIdForSuite(params.suite);
  const prk = labeledExtract(new Uint8Array(), suiteId, "eae_prk", params.ikm);
  const key = labeledExpand(prk, suiteId, "key", params.info, 32);
  const iv = labeledExpand(prk, suiteId, "iv", params.info, 12);
  return { key, iv };
}

function aeadEncrypt(plaintext: Uint8Array, key: Uint8Array, iv: Uint8Array, aad: Uint8Array) {
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad));
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: new Uint8Array(enc),
    authTag: new Uint8Array(tag),
  };
}

function aeadDecrypt(
  ciphertext: Uint8Array,
  authTag: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  aad: Uint8Array,
) {
  if (authTag.length !== 16) {
    throw new Error("Invalid auth tag length for AES-GCM");
  }
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(Buffer.from(authTag));
  const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return new Uint8Array(dec);
}

function getX25519PublicRaw(jwk: JsonWebKey): Uint8Array {
  if (typeof jwk.x !== "string") {
    throw new Error("X25519 JWK missing x coordinate");
  }
  return b64urlDecode(jwk.x);
}

function makeX25519PublicJwk(raw: Uint8Array): JsonWebKey {
  return {
    kty: "OKP",
    crv: "X25519",
    x: b64urlEncode(raw),
    ext: true,
  };
}

function kemEncapsulate(recipientPublicJwk: JsonWebKey, pqcPublicKey?: string) {
  const recipientPublicKey = crypto.createPublicKey({ key: recipientPublicJwk, format: "jwk" });
  const ephemeral = crypto.generateKeyPairSync("x25519");
  const ss1 = crypto.diffieHellman({
    privateKey: ephemeral.privateKey,
    publicKey: recipientPublicKey,
  });
  const ephPublicJwk = ephemeral.publicKey.export({ format: "jwk" }) as JsonWebKey;
  const classicalEnc = getX25519PublicRaw(ephPublicJwk);

  let pqcShared: Uint8Array | undefined;
  let pqcEnc: Uint8Array | undefined;
  if (pqcPublicKey) {
    const publicBytes = b64urlDecode(pqcPublicKey);
    const { cipherText, sharedSecret } = ml_kem768.encapsulate(publicBytes);
    pqcShared = sharedSecret;
    pqcEnc = cipherText;
  }

  return {
    sharedSecrets: pqcShared ? [ss1, pqcShared] : [ss1],
    classicalEnc,
    pqcEnc,
  };
}

function kemDecapsulate(
  recipientPrivateJwk: JsonWebKey,
  classicalEnc: Uint8Array,
  pqcEnc?: string,
  pqcPrivateKey?: string,
) {
  const recipientPrivateKey = crypto.createPrivateKey({ key: recipientPrivateJwk, format: "jwk" });
  const ephPublicKey = crypto.createPublicKey({ key: makeX25519PublicJwk(classicalEnc), format: "jwk" });
  const ss1 = crypto.diffieHellman({ privateKey: recipientPrivateKey, publicKey: ephPublicKey });

  let pqcShared: Uint8Array | undefined;
  if (pqcEnc) {
    if (!pqcPrivateKey) {
      throw new Error("Missing PQC private key for decapsulation");
    }
    pqcShared = ml_kem768.decapsulate(b64urlDecode(pqcEnc), b64urlDecode(pqcPrivateKey));
  }

  return pqcShared ? [ss1, pqcShared] : [ss1];
}

function concatSecrets(secrets: Uint8Array[]) {
  return new Uint8Array(Buffer.concat(secrets.map((secret) => Buffer.from(secret))));
}

export function encryptLayer2Payload(params: {
  layer1_ref: string;
  recipient_kid: string;
  payload: Layer2Payload;
  recipient_public_jwk: JsonWebKey;
  pqc_public_key?: string;
}): Layer2Encrypted {
  const aadBytes = buildAad(params.layer1_ref, params.recipient_kid, WEBA_VERSION);
  const payloadBytes = canonicalJsonBytes(params.payload);
  const kemResult = kemEncapsulate(params.recipient_public_jwk, params.pqc_public_key);
  const ikm = concatSecrets(kemResult.sharedSecrets);
  const suite = {
    kem: params.pqc_public_key ? "X25519+ML-KEM-768" : "X25519",
    kdf: "HKDF-SHA256",
    aead: "AES-256-GCM",
  };
  const infoBytes = buildHpkeInfo({
    weba_version: WEBA_VERSION,
    enc: "HPKE-v1",
    suite,
    layer1_ref: params.layer1_ref,
    recipient: params.recipient_kid,
  });
  const { key, iv } = deriveKeyMaterial({ suite, info: infoBytes, ikm });
  const { ciphertext, authTag } = aeadEncrypt(payloadBytes, key, iv, aadBytes);

  return {
    weba_version: WEBA_VERSION,
    layer1_ref: params.layer1_ref,
    layer2: {
      enc: "HPKE-v1",
      suite,
      recipient: params.recipient_kid,
      encapsulated: {
        classical: b64urlEncode(kemResult.classicalEnc),
        ...(kemResult.pqcEnc ? { pqc: b64urlEncode(kemResult.pqcEnc) } : {}),
      },
      ciphertext: b64urlEncode(ciphertext),
      auth_tag: b64urlEncode(authTag),
      aad: b64urlEncode(aadBytes),
    },
    meta: {
      created_at: new Date().toISOString(),
      nonce: b64urlEncode(crypto.randomBytes(16)),
    },
  };
}

export function decryptLayer2Envelope(params: {
  envelope: Layer2Encrypted;
  recipient_keys: RecipientKeyFile;
}) {
  const { envelope, recipient_keys } = params;
  if (envelope.weba_version !== WEBA_VERSION) {
    throw new Error(`Unsupported weba_version: ${envelope.weba_version}`);
  }
  if (envelope.layer2.enc !== "HPKE-v1") {
    throw new Error(`Unsupported layer2.enc: ${envelope.layer2.enc}`);
  }
  if (envelope.layer2.recipient !== recipient_keys.recipient_kid) {
    throw new Error("Recipient kid mismatch");
  }

  const aadBytes = buildAad(envelope.layer1_ref, envelope.layer2.recipient, envelope.weba_version);
  const aadEncoded = b64urlEncode(aadBytes);
  if (aadEncoded !== envelope.layer2.aad) {
    throw new Error("AAD mismatch");
  }

  const secrets = kemDecapsulate(
    recipient_keys.x25519.private_jwk,
    b64urlDecode(envelope.layer2.encapsulated.classical),
    envelope.layer2.encapsulated.pqc,
    recipient_keys.pqc?.private_key,
  );
  const ikm = concatSecrets(secrets);
  const infoBytes = buildHpkeInfo({
    weba_version: envelope.weba_version,
    enc: envelope.layer2.enc,
    suite: envelope.layer2.suite,
    layer1_ref: envelope.layer1_ref,
    recipient: envelope.layer2.recipient,
  });
  const { key, iv } = deriveKeyMaterial({ suite: envelope.layer2.suite, info: infoBytes, ikm });
  const payloadBytes = aeadDecrypt(
    b64urlDecode(envelope.layer2.ciphertext),
    b64urlDecode(envelope.layer2.auth_tag),
    key,
    iv,
    aadBytes,
  );
  const payload = JSON.parse(Buffer.from(payloadBytes).toString("utf8")) as Layer2Payload;
  return { payload };
}

export function verifyPayloadSignature(
  payload: Layer2Payload,
  userSigPublicJwk: JsonWebKey,
): { ok: boolean; reason?: string } {
  const ok = verifyLayer2Signature(payload.layer2_plain, payload.layer2_sig, userSigPublicJwk);
  if (!ok) {
    return { ok: false, reason: "Layer2 signature verification failed" };
  }
  return { ok: true };
}

export function buildLayer2Payload(layer2Plain: unknown, userSig: Layer2Signature): Layer2Payload {
  return {
    layer2_plain: layer2Plain,
    layer2_sig: userSig,
  };
}
