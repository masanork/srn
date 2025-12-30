
// Minimal Base58 implementation for DID Key decoding
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const MULTIBASE_BASE58BTC_PREFIX = 'z';
const MULTICODEC_ED25519_PUB = 0xed;

export function base58ToBytes(input: string): Uint8Array {
    if (input.length === 0) return new Uint8Array();
    const bytes: number[] = [0];
    for (const char of input) {
        const value = BASE58_ALPHABET.indexOf(char);
        if (value < 0) {
            throw new Error(`Invalid base58 character: ${char}`);
        }
        let carry = value;
        for (let i = 0; i < bytes.length; i++) {
            const acc = bytes[i] * 58 + carry;
            bytes[i] = acc & 0xff;
            carry = acc >> 8;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    let zeros = 0;
    for (const char of input) {
        if (char !== BASE58_ALPHABET[0]) break;
        zeros += 1;
    }

    const result = new Uint8Array(zeros + bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        result[result.length - 1 - i] = bytes[i];
    }
    return result;
}

export function decodeDidKey(did: string): Uint8Array {
    if (!did.startsWith('did:key:')) {
        throw new Error(`Unsupported DID method: ${did}`);
    }
    const multibase = did.slice('did:key:'.length);
    if (!multibase.startsWith(MULTIBASE_BASE58BTC_PREFIX)) {
        throw new Error('Unsupported multibase prefix');
    }

    const bytes = base58ToBytes(multibase.slice(1));

    // Decode Multicodec (varint)
    // Ed25519 (0xed) is 2 bytes in varint (11101101 00000001 -> ed 01) ?
    // Actually 0xed is > 127, so it's 2 bytes: 0xed 0x01
    // Let's implement simple varint decoder or just check prefix for Ed25519

    // 0xed = 237. 237 = 0x6D | 0x80 (Lo) -> 0xED. Li = 1. -> 0x01.
    // So prefix is [0xed, 0x01]

    if (bytes[0] === 0xed && bytes[1] === 0x01) {
        return bytes.slice(2);
    }

    throw new Error('Unsupported key type (only Ed25519 supported)');
}
