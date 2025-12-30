import { generateRecipientKeyPair, decryptLayer2 } from "../../core/l2crypto";
import { initWasm } from "../../core/wasm_core";

// ... (existing imports)

/**
 * Guest DID with Passkey Authentication
 * 
 * Features:
 * - Reuses existing Passkeys when possible
 * - Uses discoverable credentials (resident keys)
 * - Prevents duplicate Passkey creation
 * - Supports L2 Encryption via X25519
 */

const isLocal = typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const REMOTE_URL = isLocal ? "http://127.0.0.1:5002/api" : "/api";
const RP_NAME = "SRN Guest Service";

export interface GuestDidResult {
    did: string;
    isReused: boolean;
}

/**
 * Check if user has existing Guest DID Passkey
 */
async function checkExistingGuestDid(): Promise<string | null> {
    const count = localStorage.length;
    for (let i = 0; i < count; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith("guest-did:")) continue;

        // Skip sub-keys (privateKey)
        if (key.endsWith(":privateKey")) continue;

        const did = key.replace("guest-did:", "");
        return did;
    }
    return null;
}

/**
 * Create or reuse Guest DID with improved UX
 */
export async function getOrCreateGuestDid(forceNew = false): Promise<GuestDidResult> {
    if (!(window as any).PublicKeyCredential) {
        throw new Error("Passkey not supported on this device");
    }

    // Check for existing Guest DID
    if (!forceNew) {
        const existingDid = await checkExistingGuestDid();
        if (existingDid) {
            console.log("Reusing existing Guest DID");
            return { did: existingDid, isReused: true };
        }
    }

    // Create new Guest DID
    const did = await createGuestDidWithPasskey();
    return { did, isReused: false };
}

/**
 * Create a Guest DID using Passkey authentication
 * Uses discoverable credentials for better UX
 */
async function createGuestDidWithPasskey(): Promise<string> {
    try {
        await initWasm(fetch("weba_crypto_wasm_bg.wasm")); // Ensure WASM is loaded for crypto

        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {
                    name: RP_NAME,
                    id: window.location.hostname
                },
                user: {
                    id: userId,
                    name: "guest@srn.example",
                    displayName: "SRN Guest User"
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }  // ES256
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "required",
                    requireResidentKey: true
                },
                timeout: 60000,
                attestation: "none"
            }
        }) as PublicKeyCredential;

        if (!credential) {
            throw new Error("Passkey creation cancelled");
        }

        // Helper for standard Base64
        function arrayBufferToBase64(buffer: ArrayBuffer): string {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.length;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]!);
            }
            return btoa(binary);
        }

        // ...

        // const publicKeyJwk = await exportPublicKeyAsJWK(credential.response as AuthenticatorAttestationResponse);

        // Generate Encryption Key (X25519)
        const encKeyPair = await generateRecipientKeyPair();
        const encryptionPublicKeyJwk = {
            kty: "OKP",
            crv: "X25519",
            x: arrayBufferToBase64Url(encKeyPair.publicKey)
        };

        const mutation = `
      mutation CreateGuestDid($credentialId: String!, $attestationObject: String!, $clientDataJSON: String!, $encryptionPublicKeyJwk: String!) {
        createGuestDid(credentialId: $credentialId, attestationObject: $attestationObject, clientDataJSON: $clientDataJSON, encryptionPublicKeyJwk: $encryptionPublicKeyJwk) {
          did
          expiresAt
        }
      }
    `;

        const response = await fetch(REMOTE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: mutation,
                variables: {
                    credentialId: credential.id,
                    attestationObject: arrayBufferToBase64((credential.response as AuthenticatorAttestationResponse).attestationObject),
                    clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
                    encryptionPublicKeyJwk: JSON.stringify(encryptionPublicKeyJwk)
                }
            })
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(`GraphQL Error: ${result.errors[0].message}`);
        }

        const { did, expiresAt } = result.data.createGuestDid;

        localStorage.setItem(`guest-did:${did}`, credential.id);
        localStorage.setItem(`guest-did:${did}:privateKey`, arrayBufferToBase64Url(encKeyPair.privateKey));

        console.log(`Guest DID created: ${did} (expires: ${expiresAt})`);
        return did;

    } catch (error) {
        console.error("Failed to create Guest DID:", error);
        throw error;
    }
}

async function exportPublicKeyAsJWK(response: AuthenticatorAttestationResponse): Promise<any> {
    const publicKey = response.getPublicKey();
    if (!publicKey) throw new Error("No public key in response");

    const publicKeyBuffer = new Uint8Array(publicKey);

    // Parse COSE key (simplified for ES256)
    // In production, use a proper COSE library
    // ES256 public key is 64 bytes (32 bytes X + 32 bytes Y) + headers
    const x = publicKeyBuffer.slice(-64, -32);
    const y = publicKeyBuffer.slice(-32);

    return {
        kty: "EC",
        crv: "P-256",
        x: arrayBufferToBase64Url(x),
        y: arrayBufferToBase64Url(y)
    };
}

export async function fetchGuestInbox(did: string): Promise<any[]> {
    await initWasm(fetch("weba_crypto_wasm_bg.wasm"));
    const credentialId = localStorage.getItem(`guest-did:${did}`);
    if (!credentialId) throw new Error("Credential ID not found for DID");

    // Get Challenge (Nonce)
    const challengeResp = await fetch(REMOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query GetChallenge($did: ID!) { getChallenge(did: $did) { nonce } }`,
            variables: { did }
        })
    });
    const challengeResult = await challengeResp.json();
    if (challengeResult.errors) throw new Error(challengeResult.errors[0].message);
    const nonce = challengeResult.data.getChallenge.nonce;

    const challengeBuffer = base64UrlToArrayBuffer(nonce);

    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: challengeBuffer,
            allowCredentials: [{
                id: base64UrlToArrayBuffer(credentialId),
                type: "public-key"
            }],
            userVerification: "required"
        }
    }) as PublicKeyCredential;

    if (!assertion) throw new Error("Authentication failed");

    const response = assertion.response as AuthenticatorAssertionResponse;

    // Call guestInbox
    const query = `
        query GuestInbox($did: ID!, $credentialId: String!, $signature: String!, $authenticatorData: String!, $clientDataJSON: String!) {
            guestInbox(did: $did, credentialId: $credentialId, signature: $signature, authenticatorData: $authenticatorData, clientDataJSON: $clientDataJSON) {
                id
                senderDid
                recipientDid
                envelope
                createdAt
            }
        }
    `;

    const apiResp = await fetch(REMOTE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query,
            variables: {
                did,
                credentialId,
                signature: arrayBufferToBase64(response.signature),
                authenticatorData: arrayBufferToBase64(response.authenticatorData),
                clientDataJSON: arrayBufferToBase64(response.clientDataJSON)
            }
        })
    });

    const apiResult = await apiResp.json();
    if (apiResult.errors) throw new Error(apiResult.errors[0].message);

    const messages = apiResult.data.guestInbox;

    // Decrypt messages if private key is available
    const privateKeyB64 = localStorage.getItem(`guest-did:${did}:privateKey`);
    if (privateKeyB64) {
        const privateKey = new Uint8Array(base64UrlToArrayBuffer(privateKeyB64));
        for (const msg of messages) {
            if (msg.envelope) {
                try {
                    const encrypted = JSON.parse(msg.envelope);
                    // Decrypt using L2 Encryption
                    const decryptedPayload = await decryptLayer2(encrypted, privateKey);

                    // Extract plain content if struct matches
                    if (decryptedPayload.layer2_plain) {
                        msg.content = decryptedPayload.layer2_plain;
                    } else {
                        msg.content = decryptedPayload;
                    }
                    delete msg.envelope; // Clear encrypted data on success
                } catch (e) {
                    console.error("Failed to decrypt:", e);
                    msg.content = { text: "[Decryption Failed: " + (e as Error).message + "]" };
                }
            }
        }
    }

    return messages;
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]!);
    }
    return window.btoa(binary);
}

function arrayBufferToBase64Url(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]!);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Expose to window for browser usage
if (typeof window !== 'undefined') {
    (window as any).getOrCreateGuestDid = getOrCreateGuestDid;
    (window as any).fetchGuestInbox = fetchGuestInbox;

    (window as any).submitFormWithGuestDid = async (formData: any, wantsReplies: boolean) => {
        const { did, isReused } = await getOrCreateGuestDid(false);
        return { senderDid: did };
    };

    (window as any).clearAllGuestDids = () => {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith("guest-did:")) {
                localStorage.removeItem(key);
            }
        }
    };
}
