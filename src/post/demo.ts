import { PostalHub } from './hub.js';
import { PostalEnvelope } from './types.js';

async function runDemo() {
    console.log("=== Web/A Post Demo: Intelligent Postal Hub ===\n");

    const hub = new PostalHub();

    // 1. Setup Identities
    const MEMBER_DID = "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";
    const GUEST_DID = "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3dHzXvJmnmD3";
    const SPAMMER_DID = "did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2";

    // 2. Register Roles
    hub.registerDid(MEMBER_DID, 'member');
    hub.registerDid(GUEST_DID, 'guest');
    // SPAMMER is unregistered -> 'visitor' by default

    // 3. Define Rules

    // Rule A: VIP access for Members (Store immediately)
    hub.addRule({
        id: 'vip-pass',
        priority: 10,
        condition: async (env) => (await hub.resolveRole(env.senderDid)) === 'member',
        action: { type: 'store', folder: 'inbox/vip' }
    });

    // Rule B: Auto-reply for Guests (Out of Office simulation)
    hub.addRule({
        id: 'guest-auto-reply',
        priority: 20,
        condition: async (env) => (await hub.resolveRole(env.senderDid)) === 'guest',
        action: { type: 'auto-reply', message: "Thanks for reaching out! I'll review your message shortly." }
    });

    // Rule C: Reject Visitors (Strict mode)
    hub.addRule({
        id: 'block-unknowns',
        priority: 100, // Low priority (catch-all)
        condition: async (env) => true, // Catch all remaining
        action: { type: 'reject', reason: "Unknown senders are not allowed." }
    });

    // 4. Simulate Traffic

    console.log("\n--- Scenario 1: Member sending a message ---");
    const env1: PostalEnvelope = {
        id: "msg-001",
        senderDid: MEMBER_DID,
        recipientDid: "did:web:srn.example",
        receivedAt: new Date().toISOString(),
        headers: {},
        payload: { text: "Secret project update" }
    };
    await hub.receive(env1);

    console.log("\n--- Scenario 2: Guest sending an inquiry ---");
    const env2: PostalEnvelope = {
        id: "msg-002",
        senderDid: GUEST_DID,
        recipientDid: "did:web:srn.example",
        receivedAt: new Date().toISOString(),
        headers: {},
        payload: { text: "Hello, I have a question." }
    };
    await hub.receive(env2);

    console.log("\n--- Scenario 3: Spammer (Visitor) sending junk ---");
    const env3: PostalEnvelope = {
        id: "msg-003",
        senderDid: SPAMMER_DID,
        recipientDid: "did:web:srn.example",
        receivedAt: new Date().toISOString(),
        headers: {},
        payload: { text: "Buy cheap crypto!" }
    };
    await hub.receive(env3);
}

runDemo().catch(console.error);
