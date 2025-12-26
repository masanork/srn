import { ed25519 } from '@noble/curves/ed25519.js';
// @ts-ignore
import canonicalize from 'canonicalize';
import { decode } from 'cbor-x';
import { registerPasskey, signWithPasskey } from './webauthn';

// Hex Helpers
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
    private usePasskey: boolean = true;
    private credentialId: string | null = null;
    private publicKey: Uint8Array | null = null;
    private publicKeyType: 'ed25519' | 'p256' = 'ed25519';

    private edPrivateKey: Uint8Array | null = null;

    constructor() {
        this.loadKey();
    }

    private loadKey() {
        const pkId = localStorage.getItem('weba_passkey_id');
        const pkPub = localStorage.getItem('weba_passkey_pub');

        if (pkId && pkPub) {
            this.credentialId = pkId;
            this.publicKey = hexToBytes(pkPub);
            this.publicKeyType = 'p256';
            this.usePasskey = true;
            return;
        }

        const edPriv = localStorage.getItem('weba_private_key');
        if (edPriv) {
            this.edPrivateKey = hexToBytes(edPriv);
            this.publicKey = ed25519.getPublicKey(this.edPrivateKey);
            this.publicKeyType = 'ed25519';
            this.usePasskey = false;
        }
    }

    public resetKey() {
        localStorage.removeItem('weba_passkey_id');
        localStorage.removeItem('weba_passkey_pub');
        localStorage.removeItem('weba_private_key');
        this.credentialId = null;
        this.publicKey = null;
        this.edPrivateKey = null;
    }

    public async register() {
        try {
            console.log("Registering Passkey...");
            const result = await registerPasskey("User");
            const attestationObj = new Uint8Array((result.response as AuthenticatorAttestationResponse).attestationObject);
            const attStmt = decode(attestationObj);
            const authData = attStmt.authData;

            // Parse AuthData to extract COSE Key
            const dataView = new DataView(authData.buffer, authData.byteOffset, authData.byteLength);
            let offset = 32 + 1 + 4 + 16; // rpIdHash + flags + signCount + aaguid
            const credIdLen = dataView.getUint16(offset);
            offset += 2;
            // const credId = authData.slice(offset, offset + credIdLen);
            offset += credIdLen;

            const coseKeyBuffer = authData.slice(offset);
            const coseKey = decode(coseKeyBuffer);

            // COSE Key to Raw P-256 (kty=2, crv=1, x=-2, y=-3)
            const x = coseKey.get(-2);
            const y = coseKey.get(-3);

            if (!x || !y) throw new Error("Invalid COSE Key: x or y missing");

            const pubKey = new Uint8Array(1 + 32 + 32);
            pubKey[0] = 0x04; // Uncompressed
            pubKey.set(x, 1);
            pubKey.set(y, 33);

            this.credentialId = result.rawId;
            this.publicKey = pubKey;
            this.publicKeyType = 'p256';
            this.usePasskey = true;

            localStorage.setItem('weba_passkey_id', this.credentialId!);
            localStorage.setItem('weba_passkey_pub', bytesToHex(this.publicKey));

            console.log("Passkey Registered:", this.credentialId);
            return true;

        } catch (e) {
            console.warn("Passkey registration failed, falling back to Ed25519", e);
            this.generateEdKey();
            return false;
        }
    }

    private generateEdKey() {
        this.edPrivateKey = ed25519.utils.randomSecretKey();
        this.publicKey = ed25519.getPublicKey(this.edPrivateKey);
        this.publicKeyType = 'ed25519';
        this.usePasskey = false;
        localStorage.setItem('weba_private_key', bytesToHex(this.edPrivateKey));
    }

    public getIssuerDid(): string {
        if (!this.publicKey) return '';
        return `did:key:z${bytesToHex(this.publicKey)}`;
    }

    public getPublicKey(): string {
         return this.publicKey ? bytesToHex(this.publicKey) : '';
    }

    public async sign(payload: any, purpose: string = "authentication"): Promise<any> {
        if (!this.publicKey) {
            await this.register();
        }

        const jsonString = canonicalize(payload);
        const dataBytes = new TextEncoder().encode(jsonString);

        if (this.usePasskey && this.credentialId) {
            // SHA-256 for Challenge
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
            
            const sigRes = await signWithPasskey(this.credentialId, hashBuffer);

            return {
                ...payload,
                proof: {
                    type: "PasskeySignature2025",
                    created: new Date().toISOString(),
                    verificationMethod: this.getIssuerDid(),
                    proofPurpose: purpose,
                    proofValue: sigRes.signature,
                    "srn:authenticatorData": sigRes.authenticatorData,
                    "srn:clientDataJSON": sigRes.clientDataJSON,
                    "srn:credentialId": sigRes.id
                }
            };
        } else {
            if (!this.edPrivateKey) this.generateEdKey();
            const signature = ed25519.sign(dataBytes, this.edPrivateKey!);
            return {
                ...payload,
                proof: {
                    type: "Ed25519Signature2020",
                    created: new Date().toISOString(),
                    verificationMethod: this.getIssuerDid(),
                    proofPurpose: purpose,
                    proofValue: bytesToHex(signature)
                }
            };
        }
    }
}

export const globalSigner = new Signer();
