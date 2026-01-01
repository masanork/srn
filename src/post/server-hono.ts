import { Hono } from "hono";
import { PostalHub } from "./hub.js";
import { LocalFileStorage } from "./storage/local.js";
import type { PostalEnvelope } from "./types.js";

/**
 * Web/A Post Server Entrypoint (Hono Version)
 * Exposes the PostalHub via HTTP, compatible with Bun and Cloudflare Workers.
 */

const app = new Hono();

// --- Configuration (Mock) ---
const MY_DOMAIN = process.env.DOMAIN || "localhost:3000";
const ADMIN_DID = process.env.ADMIN_DID || "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";

// Initialize Hub with Local Storage (for now)
// In Cloudflare Worker environment, we would inject D1Storage here.
const storage = new LocalFileStorage("./shared/data/post");
const hub = new PostalHub(storage);

hub.registerDid(ADMIN_DID, 'admin');

// Default Rules
hub.addRule({
    id: 'admin-access',
    priority: 0,
    condition: async (env) => (await hub.resolveRole(env.senderDid)) === 'admin',
    action: { type: 'store', folder: 'inbox/admin' }
});

hub.addRule({
    id: 'public-inbox',
    priority: 50,
    condition: async () => true, // Open to public for now
    action: { type: 'store', folder: 'inbox/public' }
});

console.log(`[Web/A Post] Initialized Hub for ${MY_DOMAIN}`);

// --- Routes ---

app.get("/health", (c) => c.text("OK"));

app.get("/.well-known/did.json", (c) => {
    const didDoc = {
        "@context": [
            "https://www.w3.org/ns/did/v1"
        ],
        "id": `did:web:${MY_DOMAIN}`,
        "service": [
            {
                "id": "#weba-post",
                "type": "WebAPostInbox",
                "serviceEndpoint": `http://${MY_DOMAIN}/inbox`
            }
        ]
    };
    return c.json(didDoc);
});

app.post("/inbox", async (c) => {
    try {
        const body = await c.req.json();

        // Basic Validation
        if (!body.senderDid || !body.payload) {
            return c.json({ error: "Invalid envelope structure" }, 400);
        }

        const envelope: PostalEnvelope = {
            id: body.id || crypto.randomUUID(),
            senderDid: body.senderDid,
            recipientDid: body.recipientDid || `did:web:${MY_DOMAIN}`,
            receivedAt: new Date().toISOString(),
            headers: body.headers || {},
            payload: body.payload,
            signature: body.signature
        };

        const result = await hub.receive(envelope);

        return c.json(result, result.accepted ? 202 : 403);

    } catch (e: any) {
        console.error("Inbox processing error:", e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default app;
