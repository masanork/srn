import { x25519 } from '@noble/curves/ed25519.js';
import { randomBytes } from 'crypto';

function b64url(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const priv = new Uint8Array(randomBytes(32)); // Ensure Uint8Array
const pub = x25519.getPublicKey(priv);

console.log('Private:', b64url(priv));
console.log('Public: ', b64url(pub));
