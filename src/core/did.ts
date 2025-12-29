const BASE58_ALPHABET =
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_MAP = new Map(
    BASE58_ALPHABET.split('').map((char, index) => [char, index])
);

export const MULTICODEC_ED25519_PUB = 0xed;
export const MULTICODEC_ML_DSA_44_PUB = 0x1304;

export interface VerificationMethodEntry {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyHex?: string;
}

export interface DidDocument {
    '@context': string[];
    id: string;
    verificationMethod?: VerificationMethodEntry[];
    assertionMethod?: (string | VerificationMethodEntry)[];
}

export type DidResolver = (did: string) => Promise<DidDocument | null>;

export interface ResolvedVerificationKey {
    methodId: string;
    publicKeyBytes: Uint8Array;
    publicKeyHex?: string;
    codec?: number;
    source: 'trusted' | 'fragment' | 'did-document';
}

export interface ResolveVerificationKeyOptions {
    trustedKeys?: Record<string, string>;
    didDocuments?: Record<string, DidDocument>;
    didResolver?: DidResolver;
    expectedCodec?: number;
}

export function decodeMultibaseKey(multibase: string): {
    codec: number;
    publicKeyBytes: Uint8Array;
} {
    const bytes = decodeMultibase(multibase);
    const { value: codec, length } = decodeVarint(bytes);
    return {
        codec,
        publicKeyBytes: bytes.slice(length)
    };
}

export function encodeMultibaseKey(codec: number, publicKeyBytes: Uint8Array): string {
    const prefix = encodeVarint(codec);
    const payload = new Uint8Array(prefix.length + publicKeyBytes.length);
    payload.set(prefix, 0);
    payload.set(publicKeyBytes, prefix.length);
    return encodeMultibase(payload);
}

export function didKeyFromPublicKey(codec: number, publicKeyBytes: Uint8Array): string {
    return `did:key:${encodeMultibaseKey(codec, publicKeyBytes)}`;
}

export function decodeDidKey(did: string): {
    fingerprint: string;
    codec: number;
    publicKeyBytes: Uint8Array;
} | null {
    if (!did.startsWith('did:key:')) return null;
    const fingerprint = did.split(':')[2] ?? '';
    if (!fingerprint.startsWith('z')) return null;
    const { codec, publicKeyBytes } = decodeMultibaseKey(fingerprint);
    return { fingerprint, codec, publicKeyBytes };
}

export function buildDidKeyDocument(did: string): DidDocument | null {
    const decoded = decodeDidKey(did);
    if (!decoded) return null;

    const { fingerprint, codec } = decoded;
    const type = codec === MULTICODEC_ED25519_PUB
        ? 'Ed25519VerificationKey2020'
        : 'PqcMlDsa44VerificationKey2025';
    const alias = codec === MULTICODEC_ED25519_PUB
        ? 'root-ed25519'
        : 'root-pqc';
    const methodId = `${did}#${fingerprint}`;
    const aliasId = `${did}#${alias}`;
    const publicKeyMultibase = fingerprint;

    const verificationMethod = [
        {
            id: methodId,
            type,
            controller: did,
            publicKeyMultibase
        },
        {
            id: aliasId,
            type,
            controller: did,
            publicKeyMultibase
        }
    ];

    return {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: did,
        verificationMethod,
        assertionMethod: [methodId, aliasId]
    };
}

export async function resolveDidDocument(
    did: string,
    resolver?: DidResolver
): Promise<DidDocument | null> {
    if (resolver) {
        const resolved = await resolver(did);
        if (resolved) return resolved;
    }

    if (did.startsWith('did:key:')) {
        return buildDidKeyDocument(did);
    }

    return null;
}

export async function resolveVerificationMethodKey(
    verificationMethodId: string,
    options: ResolveVerificationKeyOptions = {}
): Promise<ResolvedVerificationKey | null> {
    if (!verificationMethodId) return null;

    const trustedKey = resolveTrustedKey(verificationMethodId, options.trustedKeys);
    if (trustedKey) {
        return {
            methodId: verificationMethodId,
            publicKeyBytes: hexToBytes(trustedKey),
            publicKeyHex: trustedKey,
            source: 'trusted'
        };
    }

    const fragment = verificationMethodId.split('#')[1] ?? '';
    const fragmentHex = extractHexFromFragment(fragment);
    if (fragmentHex) {
        return {
            methodId: verificationMethodId,
            publicKeyBytes: hexToBytes(fragmentHex),
            publicKeyHex: fragmentHex,
            source: 'fragment'
        };
    }

    const did = verificationMethodId.split('#')[0] ?? '';
    if (!did) return null;

    const didDoc =
        options.didDocuments?.[did] ??
        await resolveDidDocument(did, options.didResolver);
    const method = didDoc?.verificationMethod
        ?.find((entry) => entry.id === verificationMethodId)
        ?? didDoc?.verificationMethod
            ?.find((entry) => entry.id.endsWith(`#${fragment}`));

    if (!method) return null;

    if (method.publicKeyMultibase) {
        const { codec, publicKeyBytes } = decodeMultibaseKey(method.publicKeyMultibase);
        if (options.expectedCodec !== undefined && options.expectedCodec !== codec) {
            return null;
        }

        return {
            methodId: method.id,
            publicKeyBytes,
            codec,
            source: 'did-document'
        };
    }

    if (method.publicKeyHex) {
        return {
            methodId: method.id,
            publicKeyBytes: hexToBytes(method.publicKeyHex),
            publicKeyHex: method.publicKeyHex,
            source: 'did-document'
        };
    }

    return null;
}

function resolveTrustedKey(
    verificationMethodId: string,
    trustedKeys?: Record<string, string>
): string | null {
    if (!trustedKeys) return null;
    const direct = trustedKeys[verificationMethodId];
    if (direct) return direct;
    const did = verificationMethodId.split('#')[0] ?? '';
    return did ? trustedKeys[did] ?? null : null;
}

function extractHexFromFragment(fragment: string): string | null {
    const cleaned = fragment
        .replace(/-(ed25519|pqc|p256)$/i, '')
        .trim();
    if (!cleaned) return null;
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
    return cleaned.toLowerCase();
}

function decodeVarint(bytes: Uint8Array): { value: number; length: number } {
    let value = 0;
    let shift = 0;

    for (let index = 0; index < bytes.length; index += 1) {
        const byte = bytes[index]!;
        value |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) {
            return { value, length: index + 1 };
        }
        shift += 7;
    }

    throw new Error('Invalid varint encoding');
}

function encodeVarint(value: number): Uint8Array {
    const out: number[] = [];
    let current = value;
    while (current >= 0x80) {
        out.push((current & 0x7f) | 0x80);
        current >>= 7;
    }
    out.push(current);
    return Uint8Array.from(out);
}

function decodeMultibase(value: string): Uint8Array {
    if (!value.startsWith('z')) {
        throw new Error('Only base58btc multibase strings are supported');
    }
    return base58Decode(value.slice(1));
}

function encodeMultibase(bytes: Uint8Array): string {
    return `z${base58Encode(bytes)}`;
}

function base58Decode(input: string): Uint8Array {
    if (input.length === 0) return new Uint8Array();

    const bytes: number[] = [0];

    for (const char of input) {
        const value = BASE58_MAP.get(char);
        if (value === undefined) {
            throw new Error(`Invalid base58 character: ${char}`);
        }

        let carry = value;
        for (let index = 0; index < bytes.length; index += 1) {
            const result = bytes[index]! * 58 + carry;
            bytes[index] = result & 0xff;
            carry = result >> 8;
        }

        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    let leadingZeros = 0;
    for (const char of input) {
        if (char !== '1') break;
        leadingZeros += 1;
    }

    const output = new Uint8Array(leadingZeros + bytes.length);
    output.set(bytes.reverse(), leadingZeros);
    return output;
}

function base58Encode(bytes: Uint8Array): string {
    if (bytes.length === 0) return '';

    const digits = [0];

    for (const byte of bytes) {
        let carry = byte;
        for (let index = 0; index < digits.length; index += 1) {
            const result = (digits[index]! << 8) + carry;
            digits[index] = result % 58;
            carry = Math.floor(result / 58);
        }

        while (carry > 0) {
            digits.push(carry % 58);
            carry = Math.floor(carry / 58);
        }
    }

    let leadingZeros = 0;
    for (const byte of bytes) {
        if (byte !== 0) break;
        leadingZeros += 1;
    }

    const prefix = '1'.repeat(leadingZeros);
    return `${prefix}${digits.reverse().map((digit) => BASE58_ALPHABET[digit]!).join('')}`;
}

function hexToBytes(hex: string): Uint8Array {
    const normalized = hex.length % 2 === 0 ? hex : `0${hex}`;
    return Uint8Array.from(Buffer.from(normalized, 'hex'));
}
