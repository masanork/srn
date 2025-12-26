// Helper to convert base64url to ArrayBuffer and vice versa
export const bufferToBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

export const base64UrlToBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

export async function registerPasskey(username: string) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: {
                name: "Sorane Web/A Form",
                // id: window.location.hostname // Optional: defaults to origin
            },
            user: {
                id: userId,
                name: username,
                displayName: username
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
            authenticatorSelection: {
                authenticatorAttachment: "platform", // Prefer built-in (TouchID/Hello)
                userVerification: "required",
                residentKey: "preferred"
            },
            timeout: 60000,
            attestation: "none"
        }
    }) as PublicKeyCredential;

    if (!credential) throw new Error("Credential creation failed");

    // Extract Public Key (COSE) - simplified for storage
    // In a real app, we'd parse the COSE key to JWK or raw bytes here.
    // For now, we store the raw credential ID and rely on the fact that verification
    // often requires the public key to be stored on the server (or in the DID Doc).
    // Web/A context: The public key SHOULD be in the VP or DID.
    // Retrieving the public key from the attestationObject is complex (CBOR parsing).
    
    // For this implementation, we focus on the signing flow.
    // We return the minimal needed to sign later.
    return {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        response: credential.response
    };
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
