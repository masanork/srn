// Helper to convert base64url to ArrayBuffer and vice versa
export const bufferToBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

export const base64UrlToBuffer = (base64: string): ArrayBuffer => {
    let b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
        b64 += '=';
    }
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

export async function registerPasskey(username: string) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    // Create a stable user ID from the username to help authenticators prevent duplicates.
    // Using a simple SHA-256 hash of the username.
    const encoder = new TextEncoder();
    const userBytes = encoder.encode(username);
    const hashBuffer = await crypto.subtle.digest('SHA-256', userBytes);
    const userId = new Uint8Array(hashBuffer).slice(0, 16);

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: {
                name: "Sorane Web/A Form",
            },
            user: {
                id: userId,
                name: username,
                displayName: username
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
                residentKey: "required" // Ensure we can discover it later
            },
            timeout: 60000,
            attestation: "none",
            extensions: {
                prf: {}
            }
        }
    }) as PublicKeyCredential;

    if (!credential) throw new Error("Credential creation failed");

    return {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        response: credential.response
    };
}

/**
 * Tries to find an existing resident key on the device.
 * This prevents creating duplicate keys for the same user/RP.
 */
export async function discoverPasskey() {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    try {
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge,
                userVerification: "required",
                allowCredentials: [], // Discover resident keys
            }
        }) as PublicKeyCredential;

        if (assertion) {
            return {
                id: assertion.id,
                rawId: bufferToBase64Url(assertion.rawId),
                response: assertion.response
            };
        }
    } catch (e) {
        console.log("No existing passkey found for discovery.");
    }
    return null;
}

export async function signWithPasskey(credentialId: string, challengeBuffer: ArrayBuffer) {
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: challengeBuffer,
            allowCredentials: [{
                id: base64UrlToBuffer(credentialId),
                type: "public-key"
            }],
            userVerification: "required"
        }
    }) as PublicKeyCredential;

    if (!assertion) throw new Error("Assertion failed");

    const response = assertion.response as AuthenticatorAssertionResponse;

    return {
        id: assertion.id,
        signature: bufferToBase64Url(response.signature),
        authenticatorData: bufferToBase64Url(response.authenticatorData),
        clientDataJSON: bufferToBase64Url(response.clientDataJSON)
    };
}

export async function derivePasskeyPrf(credentialId: string, salt: Uint8Array) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge,
            allowCredentials: [{
                id: base64UrlToBuffer(credentialId),
                type: "public-key"
            }],
            userVerification: "required",
            extensions: {
                prf: {
                    eval: {
                        first: salt
                    }
                }
            }
        }
    }) as PublicKeyCredential;

    if (!assertion) throw new Error("Assertion failed");
    const results = assertion.getClientExtensionResults() as any;
    const prfOutput = results?.prf?.results?.first;
    if (!prfOutput) {
        throw new Error("PRF extension not available");
    }
    return new Uint8Array(prfOutput);
}
