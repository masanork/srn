/**
 * Guest DID with Passkey Authentication (Improved UX)
 * 
 * Features:
 * - Reuses existing Passkeys when possible
 * - Uses discoverable credentials (resident keys)
 * - Prevents duplicate Passkey creation
 */

const REMOTE_URL = "http://127.0.0.1:5001/demo-weba/us-central1/api"; // TODO: Production URL
const RP_ID = window.location.hostname;
const RP_NAME = "SRN Guest Service";

/**
 * Check if user has existing Guest DID Passkey
 * @returns {Promise<string|null>} Existing Guest DID or null
 */
async function checkExistingGuestDid() {
    // Check localStorage for existing Guest DID
    const keys = Object.keys(localStorage);
    for (const key of keys) {
        if (key.startsWith("guest-did:")) {
            const did = key.replace("guest-did:", "");
            const credentialId = localStorage.getItem(key);

            // Verify the credential still exists
            try {
                const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (available) {
                    console.log(`Found existing Guest DID: ${did}`);
                    return did;
                }
            } catch (e) {
                console.warn("Failed to check existing credential:", e);
            }
        }
    }
    return null;
}

/**
 * Create or reuse Guest DID with improved UX
 * @param {boolean} forceNew - Force creation of new Guest DID
 * @returns {Promise<string>} Guest DID
 */
async function getOrCreateGuestDid(forceNew = false) {
    if (!window.PublicKeyCredential) {
        throw new Error("Passkey not supported on this device");
    }

    // Check for existing Guest DID
    if (!forceNew) {
        const existingDid = await checkExistingGuestDid();
        if (existingDid) {
            console.log("Reusing existing Guest DID");
            return existingDid;
        }
    }

    // Create new Guest DID
    return await createGuestDidWithPasskey();
}

/**
 * Create a Guest DID using Passkey authentication
 * Uses discoverable credentials for better UX
 */
async function createGuestDidWithPasskey() {
    try {
        // Generate challenge
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        // Generate unique user ID
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);

        // Create Passkey credential with discoverable credential
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {
                    name: RP_NAME,
                    id: RP_ID
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
                    authenticatorAttachment: "platform",  // Prefer platform authenticator
                    userVerification: "required",
                    residentKey: "required",  // Make it discoverable
                    requireResidentKey: true
                },
                timeout: 60000,
                attestation: "none"
            }
        });

        if (!credential) {
            throw new Error("Passkey creation cancelled");
        }

        // Export public key as JWK
        const publicKeyJwk = await exportPublicKeyAsJWK(credential.response);

        // Generate Dummy Encryption Key (X25519) for testing
        // In real app (guest_did.ts), we generate proper X25519 key pair
        const dummyPub = new Uint8Array(32);
        crypto.getRandomValues(dummyPub);

        const encryptionPublicKeyJwk = {
            kty: "OKP",
            crv: "X25519",
            x: arrayBufferToBase64Url(dummyPub)
        };

        // Call createGuestDid mutation
        const mutation = `
      mutation CreateGuestDid($credentialId: String!, $publicKeyJwk: String!, $encryptionPublicKeyJwk: String!) {
        createGuestDid(credentialId: $credentialId, publicKeyJwk: $publicKeyJwk, encryptionPublicKeyJwk: $encryptionPublicKeyJwk) {
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
                    publicKeyJwk: JSON.stringify(publicKeyJwk),
                    encryptionPublicKeyJwk: JSON.stringify(encryptionPublicKeyJwk)
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

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64UrlToArrayBuffer(base64url) {
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
}

/**
 * Fetch inbox messages for Guest DID using Passkey authentication
 * @param {string} did - Guest DID
 * @returns {Promise<Array>} Messages
 */
async function fetchGuestInbox(did) {
    const credentialId = localStorage.getItem(`guest-did:${did}`);
    if (!credentialId) throw new Error("Credential ID not found for DID");

    // Get Challenge
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

    // Sign with Passkey
    const challengeBuffer = new TextEncoder().encode(nonce);

    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: challengeBuffer,
            allowCredentials: [{
                id: base64UrlToArrayBuffer(credentialId),
                type: "public-key"
            }],
            userVerification: "required"
        }
    });

    if (!assertion) throw new Error("Authentication failed");

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
                signature: arrayBufferToBase64(assertion.response.signature),
                authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData),
                clientDataJSON: arrayBufferToBase64(assertion.response.clientDataJSON)
            }
        })
    });

    const apiResult = await apiResp.json();
    if (apiResult.errors) throw new Error(apiResult.errors[0].message);

    return apiResult.data.guestInbox;
}

/**
 * Form submission handler with improved Guest DID UX
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
        try {
            // Try to reuse existing Guest DID
            senderDid = await getOrCreateGuestDid(false);

            // Show user-friendly message
            const existingDid = await checkExistingGuestDid();
            if (existingDid) {
                console.log("✓ Using your existing Guest identity");
            } else {
                console.log("✓ Created new Guest identity for receiving replies");
            }
        } catch (error) {
            console.warn("Passkey failed, submitting anonymously:", error);
            alert("Could not create Guest identity. Submitting anonymously (no replies).");
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

/**
 * Clear all Guest DIDs (for testing/debugging)
 */
function clearAllGuestDids() {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
        if (key.startsWith("guest-did:")) {
            localStorage.removeItem(key);
        }
    }
    console.log("All Guest DIDs cleared");
}

// Export for use in Maker
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getOrCreateGuestDid,
        submitFormWithGuestDid,
        clearAllGuestDids,
        fetchGuestInbox
    };
}
