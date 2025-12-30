/**
 * Guest DID with Passkey Authentication
 * 
 * Features:
 * - Reuses existing Passkeys when possible
 * - Uses discoverable credentials (resident keys)
 * - Prevents duplicate Passkey creation
 */

const REMOTE_URL = "http://127.0.0.1:5001/demo-weba/us-central1/api"; // TODO: Production URL
const RP_NAME = "SRN Guest Service";

export interface GuestDidResult {
    did: string;
    isReused: boolean;
}

/**
 * Check if user has existing Guest DID Passkey
 */
async function checkExistingGuestDid(): Promise<string | null> {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
        if (key.startsWith("guest-did:")) {
            const did = key.replace("guest-did:", "");
            // Simply return the first found DID for now.
            // Ideally we should check if the credential is still valid/available, 
            // but isUserVerifyingPlatformAuthenticatorAvailable only checks platform capability, not specific credential.
            return did;
        }
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

        const publicKeyJwk = await exportPublicKeyAsJWK(credential.response as AuthenticatorAttestationResponse);

        const mutation = `
      mutation CreateGuestDid($credentialId: String!, $publicKeyJwk: String!) {
        createGuestDid(credentialId: $credentialId, publicKeyJwk: $publicKeyJwk) {
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
                    publicKeyJwk: JSON.stringify(publicKeyJwk)
                }
            })
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(`GraphQL Error: ${result.errors[0].message}`);
        }

        const { did, expiresAt } = result.data.createGuestDid;

        localStorage.setItem(`guest-did:${did}`, credential.id);

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

function arrayBufferToBase64Url(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
