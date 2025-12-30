import {
    base64UrlToBytes,
    bytesToBase58,
    bytesToBase64Url,
    decodeMultibaseBase58btc,
    hexToBytes
} from './encoding';

const MULTICODEC_ED25519_PUB = 0xed;
const MULTICODEC_P256_PUB = 0x1200;

export type PqcPublicKeyJwk = {
    kty: 'PQC';
    crv: 'ML-DSA-44';
    x: string;
};

export type VerificationMethodEntry = {
    id: string;
    type?: string;
    controller?: string;
    publicKeyHex?: string;
    publicKeyMultibase?: string;
    publicKeyJwk?: unknown;
    publicKeyPqcJwk?: unknown;
};

export type DidDocument = {
    id: string;
    verificationMethod?: VerificationMethodEntry[];
    assertionMethod?: Array<string | VerificationMethodEntry>;
    keyAgreement?: Array<string | VerificationMethodEntry>;
};

export type DidResolver = (did: string) => Promise<DidDocument | null>;

type MulticodecDecodeResult = {
    code: number;
    data: Uint8Array;
};

function decodeUvarint(bytes: Uint8Array): { value: number; length: number } {
    let value = 0;
    let shift = 0;
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        if (byte === undefined) break;
        value |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) {
            return { value, length: i + 1 };
        }
        shift += 7;
    }
    throw new Error('Invalid varint encoding');
}

function encodeUvarint(value: number): Uint8Array {
    const output: number[] = [];
    let remaining = value;
    while (remaining >= 0x80) {
        output.push((remaining & 0x7f) | 0x80);
        remaining >>= 7;
    }
    output.push(remaining);
    return new Uint8Array(output);
}

export function decodeMulticodec(bytes: Uint8Array): MulticodecDecodeResult {
    const { value, length } = decodeUvarint(bytes);
    return {
        code: value,
        data: bytes.slice(length)
    };
}

function encodeMulticodec(code: number, data: Uint8Array): Uint8Array {
    const prefix = encodeUvarint(code);
    const output = new Uint8Array(prefix.length + data.length);
    output.set(prefix, 0);
    output.set(data, prefix.length);
    return output;
}

function jwkToBytes(jwk: unknown): Uint8Array | null {
    if (!jwk || typeof jwk !== 'object') return null;
    const record = jwk as Record<string, unknown>;
    const kty = record.kty;
    const crv = record.crv;
    const x = record.x;
    if (typeof kty !== 'string' || typeof x !== 'string') return null;
    if (kty === 'PQC' && crv === 'ML-DSA-44') {
        return base64UrlToBytes(x);
    }
    if (kty === 'OKP' && crv === 'Ed25519') {
        return base64UrlToBytes(x);
    }
    if (kty === 'EC' && crv === 'P-256') {
        const y = record.y;
        if (typeof y !== 'string') return null;
        const xBytes = base64UrlToBytes(x);
        const yBytes = base64UrlToBytes(y);
        const pubKey = new Uint8Array(1 + xBytes.length + yBytes.length);
        pubKey[0] = 0x04;
        pubKey.set(xBytes, 1);
        pubKey.set(yBytes, 1 + xBytes.length);
        return pubKey;
    }
    return null;
}

export function extractPublicKeyBytes(method: VerificationMethodEntry): Uint8Array | null {
    if (method.publicKeyMultibase) {
        const multicodec = decodeMulticodec(decodeMultibaseBase58btc(method.publicKeyMultibase));
        return multicodec.data;
    }
    if (method.publicKeyHex) {
        return hexToBytes(method.publicKeyHex);
    }
    const jwk = method.publicKeyJwk ?? method.publicKeyPqcJwk;
    if (jwk) {
        return jwkToBytes(jwk);
    }
    return null;
}

export function collectVerificationMethods(doc: DidDocument): Map<string, VerificationMethodEntry> {
    const methods = new Map<string, VerificationMethodEntry>();
    if (Array.isArray(doc.verificationMethod)) {
        doc.verificationMethod.forEach((method) => {
            if (method?.id) {
                methods.set(method.id, method);
            }
        });
    }
    if (Array.isArray(doc.assertionMethod)) {
        doc.assertionMethod.forEach((entry) => {
            if (entry && typeof entry === 'object' && 'id' in entry) {
                const method = entry as VerificationMethodEntry;
                if (method.id) {
                    methods.set(method.id, method);
                }
            }
        });
    }
    return methods;
}

export function decodeDidKey(did: string): { code: number; publicKey: Uint8Array } {
    const parts = did.split('#');
    const didKey = parts[0] || '';
    if (!didKey.startsWith('did:key:')) {
        throw new Error(`Unsupported DID method for did:key decoding: ${did}`);
    }
    const multibase = didKey.slice('did:key:'.length);
    const multicodec = decodeMulticodec(decodeMultibaseBase58btc(multibase));
    return { code: multicodec.code, publicKey: multicodec.data };
}

export function encodeDidKey(publicKey: Uint8Array, keyType: 'ed25519' | 'p256'): string {
    const codec = keyType === 'p256' ? MULTICODEC_P256_PUB : MULTICODEC_ED25519_PUB;
    const multicodec = encodeMulticodec(codec, publicKey);
    return `did:key:z${bytesToBase58(multicodec)}`;
}

export function encodePqcPublicKeyJwk(publicKey: Uint8Array): PqcPublicKeyJwk {
    return {
        kty: 'PQC',
        crv: 'ML-DSA-44',
        x: bytesToBase64Url(publicKey)
    };
}

export async function resolveDidDocument(did: string, fetcher: typeof fetch = fetch): Promise<DidDocument | null> {
    if (did.startsWith('did:key:')) {
        const multibase = did.slice('did:key:'.length);
        return {
            id: did,
            verificationMethod: [
                {
                    id: `${did}#${multibase}`,
                    type: 'Multikey',
                    controller: did,
                    publicKeyMultibase: multibase
                }
            ],
            assertionMethod: [`${did}#${multibase}`]
        };
    }
    if (!did.startsWith('did:web:')) {
        return null;
    }
    const domain = did.split(':')[2];
    if (!domain) return null;
    const pathParts = did.split(':').slice(3);
    const didPath = pathParts.length > 0 ? pathParts.join('/') : '.well-known';
    const url = `https://${domain}/${didPath}/did.json`;
    try {
        const resp = await fetcher(url);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (e) {
        console.warn(`Failed to resolve DID ${did}:`, e);
        return null;
    }
}
