import { ed25519 } from '@noble/curves/ed25519';
// @ts-ignore
import canonicalize from 'canonicalize';

// Helper for hex conversion
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

export class Signer {
    private privateKey: Uint8Array | null = null;
    private publicKey: Uint8Array | null = null;

    constructor() {
        this.loadKey();
    }

    private loadKey() {
        const stored = localStorage.getItem('weba_private_key');
        if (stored) {
            this.privateKey = hexToBytes(stored);
            this.publicKey = ed25519.getPublicKey(this.privateKey);
        } else {
            this.generateKey();
        }
    }

    public resetKey() {
        this.generateKey();
    }

    private generateKey() {
        this.privateKey = ed25519.utils.randomSecretKey();
        this.publicKey = ed25519.getPublicKey(this.privateKey);
        localStorage.setItem('weba_private_key', bytesToHex(this.privateKey));
    }

    public getPublicKey(): string {
        return this.publicKey ? bytesToHex(this.publicKey) : '';
    }

    public async sign(payload: any, purpose: string = "authentication"): Promise<any> {
        if (!this.privateKey || !this.publicKey) throw new Error("No key available");

        // Canonicalize
        const jsonString = canonicalize(payload);
        if (!jsonString) throw new Error("Canonicalization failed");

        const dataBytes = new TextEncoder().encode(jsonString);
        const signature = ed25519.sign(dataBytes, this.privateKey);

        // Append Proof
        return {
            ...payload,
            proof: {
                type: "Ed25519Signature2020",
                created: new Date().toISOString(),
                verificationMethod: `did:key:z${bytesToHex(this.publicKey)}`,
                proofPurpose: purpose,
                proofValue: bytesToHex(signature)
            }
        };
    }
}

export const globalSigner = new Signer();
