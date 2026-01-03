
export function b64urlEncode(bytes: Uint8Array): string {
    let binary = "";
    bytes.forEach((b) => {
        binary += String.fromCharCode(b);
    });
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function deriveKeyPairFromPrf(prfKey: Uint8Array) {
    const crypto = (window as any).WebACrypto;
    if (!crypto) throw new Error("WebACrypto not initialized. Please wait for the preview runtime to load.");

    const info = new TextEncoder().encode("weba-l2/user-x25519");
    const seed = crypto.hkdfSha256(prfKey, undefined, info, 32);
    const publicKey = crypto.x25519GetPublicKey(seed);
    return { publicKey, privateKey: seed };
}
