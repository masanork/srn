/**
 * Guest DID with Passkey Authentication
 * 
 * This module provides seamless Guest DID creation for users without permanent DIDs.
 * UX: Single checkbox "Receive replies" - no extra dialogs except OS Passkey prompt.
 */

const REMOTE_URL = "http://127.0.0.1:5001/demo-weba/us-central1/api"; // TODO: Production URL

/**
 * Create a Guest DID using Passkey authentication
 * @returns {Promise<string>} Guest DID (e.g., "did:web:srn.example:guest:abc123")
 */
async function createGuestDidWithPasskey() {
    // Check Passkey support
    if (!window.PublicKeyCredential) {
        throw new Error("Passkey not supported on this device");
    }

    try {
        // 1. Generate challenge
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        // 2. Create Passkey credential
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {
                    name: "SRN Guest Service",
                    id: window.location.hostname
                },
                user: {
                    id: crypto.randomUUID(),
                    name: "guest",
                    displayName: "Guest User"
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }  // ES256
                ],
                authenticatorSelection: {
                    userVerification: "required",
                    residentKey: "preferred"
                },
                timeout: 60000
            }
        });

        if (!credential) {
            throw new Error("Passkey creation cancelled");
        }

        // 3. Export public key as JWK
        const publicKeyJwk = await exportPublicKeyAsJWK(credential.response);

        // 4. Call createGuestDid mutation
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

        // Store credential ID for later authentication
        localStorage.setItem(`guest-did:${did}`, credential.id);

        console.log(`Guest DID created: ${did} (expires: ${expiresAt})`);
        return did;

    } catch (error) {
        console.error("Failed to create Guest DID:", error);
        throw error;
    }
}

/**
 * Export Passkey public key as JWK format
 */
async function exportPublicKeyAsJWK(response) {
    const publicKey = response.getPublicKey();
    const publicKeyBuffer = new Uint8Array(publicKey);

    // Parse COSE key (simplified for ES256)
    // In production, use a proper COSE library
    const x = publicKeyBuffer.slice(-64, -32);
    const y = publicKeyBuffer.slice(-32);

    return {
        kty: "EC",
        crv: "P-256",
        x: arrayBufferToBase64Url(x),
        y: arrayBufferToBase64Url(y)
    };
}

/**
 * Convert ArrayBuffer to Base64URL
 */
function arrayBufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Form submission handler with Guest DID support
 * 
 * Usage in Maker:
 * ```html
 * <input type="checkbox" id="wantsReplies" />
 * <label for="wantsReplies">Receive replies</label>
 * ```
 */
async function submitFormWithGuestDid(formData, wantsReplies) {
    let senderDid;

    if (wantsReplies) {
        // Create Guest DID with Passkey
        try {
            senderDid = await createGuestDidWithPasskey();
        } catch (error) {
            alert("Failed to create Guest DID. Submitting anonymously instead.");
            senderDid = "did:web:srn.example:forms:contact";
        }
    } else {
        // Anonymous submission with form DID
        senderDid = "did:web:srn.example:forms:contact";
    }

    // TODO: Integrate with existing form submission logic
    console.log("Submitting with senderDid:", senderDid);

    return { senderDid, formData };
}

// Export for use in Maker
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGuestDidWithPasskey,
        submitFormWithGuestDid
    };
}
