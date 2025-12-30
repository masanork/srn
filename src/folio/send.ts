
import { resolveTransport } from "./transport";
import { encryptLayer2, signLayer2, toBase64Url, fromBase64Url } from "../core/l2crypto";
import { initWasm } from "../core/wasm_core";

interface SendOptions {
    did: string;        // Recipient DID
    message: string;    // Message content (plain text)
    senderDid: string;  // Sender DID
    privateKeyHex: string; // Ed25519 private key hex (64 chars = 32 bytes)
    remote?: string;    // Override API URL (optional)
}

function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
    const array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        array[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return array;
}

export async function sendMessage(options: SendOptions) {
    if (!options.did || !options.message || !options.senderDid || !options.privateKeyHex) {
        throw new Error("Missing required options: did, message, senderDid, privateKeyHex");
    }

    console.log(`Resolving DID: ${options.did}...`);
    await initWasm();

    // 1. Resolve Recipient
    const resolution = await resolveTransport(options.did);
    const doc = resolution.document;
    if (!doc) throw new Error(`Could not resolve DID: ${options.did}`);

    // 2. Find Encryption Key
    const keyAgreementId = doc.keyAgreement ? (typeof doc.keyAgreement[0] === 'string' ? doc.keyAgreement[0] : doc.keyAgreement[0].id) : null;
    let encryptionKey: Uint8Array | undefined;
    let recipientKid: string = keyAgreementId || "unknown";

    if (keyAgreementId) {
        // Resolve reference if needed
        let method = null;
        if (doc.verificationMethod) {
            method = doc.verificationMethod.find((m: any) =>
                m.id === keyAgreementId ||
                m.id === `${options.did}${keyAgreementId}` ||
                (keyAgreementId.startsWith("#") && m.id.endsWith(keyAgreementId)) ||
                m.id === keyAgreementId
            );
        }

        // Also check if keyAgreement entry itself is the method
        if (!method && typeof doc.keyAgreement[0] !== 'string') {
            method = doc.keyAgreement[0];
        }

        if (method && method.publicKeyJwk && method.publicKeyJwk.crv === "X25519") {
            encryptionKey = fromBase64Url(method.publicKeyJwk.x);
            recipientKid = method.id;
        }
    }

    if (!encryptionKey) {
        throw new Error(`No X25519 encryption key found for ${options.did}`);
    }
    console.log(`Found encryption key: ${recipientKid}`);

    // 3. Prepare Payload & Encrypt
    const senderKey = hexToBytes(options.privateKeyHex);

    // Create inner signature
    const plainContent = {
        type: "https://schema.org/Message",
        text: options.message,
        timestamp: new Date().toISOString()
    };

    const signature = await signLayer2(plainContent, senderKey, `${options.senderDid}#key-1`);

    const payload = {
        layer2_plain: plainContent,
        layer2_sig: signature
    };

    console.log("Encrypting message...");
    const encrypted = await encryptLayer2(
        payload,
        encryptionKey,
        `ref:${Date.now()}`, // Temporary layer1_ref
        recipientKid,
        {
            userSk: senderKey // Use sender key for auth (HPKE auth mode if implemented, else just ephemeral)
        }
    );

    // 4. Send
    // Find endpoint
    const inboxService = doc.service?.find((s: any) => s.type === "FolioInbox");
    let endpoint = options.remote;

    // If Guest DID, the serviceEndpoint might be the full URL to the messages resource, 
    // but our GraphQL API endpoint is likely common.
    // The serviceEndpoint in Guest DID is `https://srn.example/api/guest-inbox/${guestId}` which is likely just an identifier or REST endpoint.
    // But we want to use GraphQL.

    // If not provided, try to infer from service endpoint or default
    if (!endpoint) {
        if (inboxService) {
            // Hack: If service endpoint contains "guest-inbox", it might be a resource URL.
            // We assume the standard GraphQL endpoint for this prototype.
            // In production, we should probably put the GraphQL endpoint in the DID doc 
            // OR support posting to the REST endpoint.
            // For now, let's default to localhost if not specified, or parse from endpoint if possible.
            if (inboxService.serviceEndpoint.includes("localhost") || inboxService.serviceEndpoint.includes("127.0.0.1")) {
                endpoint = "http://127.0.0.1:5001/demo-weba/us-central1/api";
            }
        }
    }

    if (!endpoint) {
        // Fallback default
        endpoint = "http://127.0.0.1:5001/demo-weba/us-central1/api";
        console.warn(`No endpoint found in DID, defaulting to ${endpoint}`);
    }

    console.log(`Sending to ${endpoint}...`);

    const mutation = `
        mutation PostMessage($did: ID!, $nonce: String!, $signature: String!, $message: String!) {
            postMessage(did: $did, nonce: $nonce, signature: $signature, message: $message) {
                id
            }
        }
    `;

    // For postMessage, we need sender authentication.
    // The current GraphQL postMessage requires Sender DID auth (nonce + signature).

    // Get Nonce
    const nonceQuery = `query GetChallenge($did: ID!) { getChallenge(did: $did) { nonce } }`;
    const nonceResp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nonceQuery, variables: { did: options.senderDid } })
    });

    const nonceResult = await nonceResp.json();
    if (nonceResult.errors) throw new Error(nonceResult.errors[0].message);
    const nonce = nonceResult.data.getChallenge.nonce;

    // Sign Nonce (for API auth)
    // We reuse encryption key (senderKey) as Ed25519 signing key here? 
    // Yes, for simple setup, we assume senderKey is Ed25519.
    const { ed25519Sign } = await import("../core/wasm_core"); // dynamic import to avoid load issues if initWasm not fully done
    const sigBytes = ed25519Sign(senderKey, new TextEncoder().encode(nonce));
    const authSig = toBase64Url(sigBytes);

    // Send
    // Note: The GraphQL 'message' argument expects the ENCRYPTED envelope as string.
    const messageStr = JSON.stringify(encrypted);

    const postResp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: mutation,
            variables: {
                did: options.senderDid,
                nonce: nonce,
                signature: authSig,
                message: messageStr
            }
        })
    });

    const postResult = await postResp.json();
    if (postResult.errors) throw new Error(postResult.errors[0].message);

    console.log(`Message sent! ID: ${postResult.data.postMessage.id}`);
}
