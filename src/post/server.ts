import { serve } from "bun";
import { PostalHub } from "./hub.js";
import { PostalEnvelope, PostRole } from "./types.js";

/**
 * Web/A Post Server Entrypoint
 * Exposes the PostalHub via HTTP.
 */

// Initialize Hub
const hub = new PostalHub();

// --- Configuration (Mock) ---
// In a real app, this would load from a config file or database.
const MY_DOMAIN = process.env.DOMAIN || "localhost:3000";
const ADMIN_DID = process.env.ADMIN_DID || "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";

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
    condition: async () => true, // Open to public for now (testing)
    action: { type: 'store', folder: 'inbox/public' }
});

// --- Server Logic ---

const port = process.env.PORT || 3000;

console.log(`[Web/A Post] Starting server on port ${port}...`);
console.log(`[Web/A Post] Domain: ${MY_DOMAIN}`);
console.log(`[Web/A Post] Admin DID: ${ADMIN_DID}`);

serve({
    port: Number(port),
    async fetch(req) {
        const url = new URL(req.url);

        // 1. Health Check
        if (req.method === "GET" && url.pathname === "/health") {
            return new Response("OK", { status: 200 });
        }

        // 2. DID Document (Public Identity)
        if (req.method === "GET" && url.pathname === "/.well-known/did.json") {
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
            return new Response(JSON.stringify(didDoc, null, 2), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. Inbox (POST) - Receive Envelopes
        if (req.method === "POST" && url.pathname === "/inbox") {
            try {
                const body = await req.json();

                // Basic Validation
                if (!body.senderDid || !body.payload) {
                    return new Response(JSON.stringify({ error: "Invalid envelope structure" }), { status: 400 });
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

                return new Response(JSON.stringify(result), {
                    status: result.accepted ? 202 : 403,
                    headers: { "Content-Type": "application/json" }
                });

            } catch (e: any) {
                console.error("Inbox processing error:", e);
                return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    }
});
