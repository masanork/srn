const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const MULTIBASE_BASE58BTC_PREFIX = 'z';

const hasBuffer = typeof Buffer !== 'undefined';

export function bytesToHex(bytes: Uint8Array): string {
    if (hasBuffer) {
        return Buffer.from(bytes).toString('hex');
    }
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
    if (hasBuffer) {
        return Uint8Array.from(Buffer.from(hex, 'hex'));
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
    if (hasBuffer) {
        return Buffer.from(bytes).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
    }
    let value = '';
    bytes.forEach((b) => {
        value += String.fromCharCode(b);
    });
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlToBytes(value: string): Uint8Array {
    const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4));
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    if (hasBuffer) {
        return Uint8Array.from(Buffer.from(base64, 'base64'));
    }
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
    }
    return bytes;
}

export function bytesToBase58(bytes: Uint8Array): string {
    if (bytes.length === 0) return '';
    const digits: number[] = [0];
    for (const byte of bytes) {
        let carry = byte;
        for (let i = 0; i < digits.length; i++) {
            const value = digits[i] * 256 + carry;
            digits[i] = value % 58;
            carry = Math.floor(value / 58);
        }
        while (carry > 0) {
            digits.push(carry % 58);
            carry = Math.floor(carry / 58);
        }
    }

    let zeros = 0;
    for (const byte of bytes) {
        if (byte !== 0) break;
        zeros += 1;
    }

    let result = BASE58_ALPHABET[0].repeat(zeros);
    for (let i = digits.length - 1; i >= 0; i--) {
        result += BASE58_ALPHABET[digits[i]];
    }
    return result;
}

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

export function bytesToMultibaseBase58btc(bytes: Uint8Array): string {
    return `${MULTIBASE_BASE58BTC_PREFIX}${bytesToBase58(bytes)}`;
}

export function decodeMultibaseBase58btc(value: string): Uint8Array {
    if (!value.startsWith(MULTIBASE_BASE58BTC_PREFIX)) {
        throw new Error(`Unsupported multibase prefix in ${value}`);
    }
    return base58ToBytes(value.slice(1));
}
