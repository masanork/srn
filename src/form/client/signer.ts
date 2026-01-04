// @ts-ignore
import canonicalize from 'canonicalize';
import { decode } from 'cbor-x';
import { registerPasskey, signWithPasskey, derivePasskeyPrf } from './webauthn';

// Import from specific modules to avoid bundling server-side code
import { encodeDidKey } from "@srn/core/did";
import { bytesToHex, hexToBytes, bytesToMultibaseBase58btc } from "@srn/core/encoding";

const EDDSA_JCS_2022 = 'eddsa-jcs-2022';

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
        if (typeof localStorage === 'undefined') return;
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
            // Public key will be derived when needed (WASM requires async init)
            this.publicKeyType = 'ed25519';
            this.usePasskey = false;
            // Derive public key synchronously from stored private key
            // For Ed25519, we'll need to call WASM, but store the key for now
        }
    }

    public resetKey() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('weba_passkey_id');
            localStorage.removeItem('weba_passkey_pub');
            localStorage.removeItem('weba_private_key');
        }
        this.credentialId = null;
        this.publicKey = null;
        this.edPrivateKey = null;
    }

    public async register() {
        try {
            const username = prompt("Enter a name for this Passkey:", "demo-user") || "User";
            console.log(`Registering Passkey for ${username}...`);
            const result = await registerPasskey(username);

            // Extract Public Key from Attestation
            const attestationObj = new Uint8Array((result.response as AuthenticatorAttestationResponse).attestationObject);
            const attStmt = decode(attestationObj);
            const authData = attStmt.authData;

            const dataView = new DataView(authData.buffer, authData.byteOffset, authData.byteLength);
            let offset = 32 + 1 + 4 + 16; // rpIdHash + flags + signCount + aaguid
            const credIdLen = dataView.getUint16(offset);
            offset += 2;
            offset += credIdLen;

            const coseKeyBuffer = authData.slice(offset);
            const coseKey = decode(coseKeyBuffer);

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

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('weba_passkey_id', this.credentialId!);
                localStorage.setItem('weba_passkey_pub', bytesToHex(this.publicKey));
            }

            console.log("Passkey Registered:", this.credentialId);
            return true;

        } catch (e) {
            console.warn("Passkey registration failed, falling back to Ed25519", e);
            this.generateEdKey();
            return false;
        }
    }

    private async generateEdKey() {
        const { initWasm, ed25519GenerateKeyPair } = await import("@srn/core");
        await initWasm(fetch('/assets/weba_crypto_wasm_bg.wasm'));
        const { privateKey, publicKey } = ed25519GenerateKeyPair();
        this.edPrivateKey = privateKey;
        this.publicKey = publicKey;
        this.publicKeyType = 'ed25519';
        this.usePasskey = false;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('weba_private_key', bytesToHex(this.edPrivateKey));
        }
    }

    public getIssuerDid(): string {
        if (!this.publicKey) return '';
        return encodeDidKey(this.publicKey, this.publicKeyType);
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
            if (!this.edPrivateKey) await this.generateEdKey();
            const { initWasm, ed25519Sign } = await import("@srn/core");
            await initWasm(fetch('/assets/weba_crypto_wasm_bg.wasm'));
            const signature = ed25519Sign(this.edPrivateKey!, dataBytes);
            return {
                ...payload,
                proof: {
                    type: "DataIntegrityProof",
                    cryptosuite: EDDSA_JCS_2022,
                    created: new Date().toISOString(),
                    verificationMethod: this.getIssuerDid(),
                    proofPurpose: purpose,
                    proofValue: bytesToMultibaseBase58btc(signature)
                }
            };
        }
    }

    public async derivePrf(salt: Uint8Array): Promise<Uint8Array | null> {
        if (!this.credentialId) return null;
        try {
            return await derivePasskeyPrf(this.credentialId, salt);
        } catch (e) {
            console.error("PRF derivation failed", e);
            return null;
        }
    }
}

export const globalSigner = new Signer();
