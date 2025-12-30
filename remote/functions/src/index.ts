import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { initWasm, ed25519Verify } from "./wasm_util";
import { decode } from "cbor-x";
import { verifyRegistrationResponse, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { verifyFolioVC } from "./vc_util";

import { CONFIG } from "./config";


admin.initializeApp();

// Helper to extract Public Key from Attestation Object
// Helper to convert COSE Key to JWK
function coseToJwk(cose: Buffer): any {
    const struct = decode(cose);
    let x, y;
    // Handle Map (standard) or Object (config dependent)
    if (struct instanceof Map) {
        x = struct.get(-2);
        y = struct.get(-3);
    } else {
        x = (struct as any)[-2];
        y = (struct as any)[-3];
    }

    if (!x || !y) throw new Error("Invalid COSE P-256 key");

    return {
        kty: "EC", crv: "P-256",
        x: Buffer.from(x).toString('base64url'),
        y: Buffer.from(y).toString('base64url')
    };
}


// Initialize WASM at startup
let wasmReady = false;
initWasm().then(() => {
    wasmReady = true;
    console.log("WASM initialized for Firebase Functions");
}).catch(err => {
    console.error("Failed to initialize WASM:", err);
});

import { decodeDidKey } from "./did_key";

// --- DID Utils ---
function didToUrl(did: string): string {
    const parts = did.split(":");
    const domain = parts[2];
    const pathParts = parts.slice(3);
    return pathParts.length === 0
        ? `https://${domain}/.well-known/did.json`
        : `https://${domain}/${pathParts.join("/")}/did.json`;
}

async function resolvePublicKey(did: string): Promise<Uint8Array> {
    if (did.startsWith("did:key:")) {
        try {
            return decodeDidKey(did);
        } catch (e: any) {
            throw new Error(`Failed to decode did:key: ${e.message}`);
        }
    }

    if (did === "did:web:example.com:user123") {
        return Buffer.from("416a3212dc5421d1a77217aa4831fe7097c23ac716e7f985166d9b155c2c9143", "hex");
    }
    const url = didToUrl(did);
    const resp = await fetch(url);
    const doc = await resp.json();
    const vm = doc.verificationMethod.find((m: any) => m.type === "Ed25519VerificationKey2020" || m.type === "Ed25519VerificationKey2018");
    if (!vm) throw new Error("No Ed25519 key found in DID document");
    return Buffer.from(vm.publicKeyHex, "hex");
}

async function verifyAuth(did: string, nonce: string, signature: string) {
    if (!wasmReady) throw new Error("WASM not ready");

    const db = admin.firestore();
    const challengeDoc = await db.collection("challenges").doc(nonce).get();
    if (!challengeDoc.exists) throw new Error("Invalid or expired nonce");
    const data = challengeDoc.data();
    if (data?.did !== did) throw new Error("Nonce mismatch");

    // Auto-extend expiry for active usage? No, one-time use usually.
    // For now simple verify.

    const publicKey = await resolvePublicKey(did);
    const isValid = ed25519Verify(publicKey, Buffer.from(nonce, "utf-8"), Buffer.from(signature, "hex"));

    // Always delete challenge to prevent replay
    await db.collection("challenges").doc(nonce).delete();

    if (!isValid) throw new Error("Invalid signature");
}

const typeDefs = `
  type Message { 
    id: ID!
    threadId: ID
    inReplyTo: ID
    action: String
    envelope: String!
    createdAt: String!
    senderDid: String
    recipientDid: String
    hostDid: String
  }
  
  type Thread {
    threadId: ID!
    messages: [Message!]!
  }
  
  type Challenge { nonce: String!, expiresAt: String! }
  
  type Query { 
    getChallenge(did: ID!): Challenge!
    inbox(did: ID!, nonce: String!, signature: String!): [Message!]!
    outbox(did: ID!, nonce: String!, signature: String!): [Message!]!
    threads(did: ID!, nonce: String!, signature: String!): [Thread!]!
    guestInbox(did: ID!, credentialId: String!, signature: String!, authenticatorData: String!, clientDataJSON: String!): [Message!]!
    hello: String 
  }
  
  type GuestDid {
    did: ID!
    expiresAt: String!
  }
  
  type Mutation {
    createGuestDid(credentialId: String!, attestationObject: String!, clientDataJSON: String!, encryptionPublicKeyJwk: String!): GuestDid! 
    addUser(did: ID!, nonce: String!, signature: String!, newDid: String!, role: String): Boolean!
    guestPostMessage(
      did: ID!
      credentialId: String!
      signature: String!
      authenticatorData: String!
      clientDataJSON: String!
      recipientDid: String!
      envelope: String!
      threadId: ID
      inReplyTo: ID
      action: String
    ): Message!
    postMessage(
      did: ID!
      nonce: String!
      signature: String!
      vc: String
      senderDid: String!
      recipientDid: String!
      hostDid: String!
      envelope: String!
      threadId: ID
      inReplyTo: ID
      action: String
    ): Message!
    acknowledgeMessage(did: ID!, nonce: String!, signature: String!, id: ID!): Boolean! 
  }
`;

import * as crypto from "crypto";

// Helper to verify Passkey signature
async function verifyPasskey(did: string, credentialId: string, signature: string, authenticatorData: string, clientDataJSON: string) {
    if (!did) throw new Error("Missing DID");
    if (!credentialId) throw new Error("Missing Credential ID");

    console.log(`[verifyPasskey] start:`, { did, credentialId });

    const db = admin.firestore();
    const guestId = did.split(":").pop();
    if (!guestId) throw new Error("Invalid DID format: missing guest ID part");

    const doc = await db.collection("guest-dids").doc(guestId).get();
    if (!doc.exists) throw new Error(`Guest DID ${did} not found in database (guestId: ${guestId})`);

    const data = doc.data();
    if (!data) throw new Error(`Guest DID ${did} exists but has no data`);

    console.log(`[verifyPasskey] DB data:`, {
        hasId: !!data.credentialId,
        hasKey: !!data.credentialPublicKey,
        counter: data.counter,
        dbId: data.credentialId
    });

    if (data.credentialId !== credentialId) {
        throw new Error(`Credential ID mismatch. DB: ${data.credentialId}, Got: ${credentialId}`);
    }

    // Extract challenge from clientDataJSON
    const clientDataStr = Buffer.from(clientDataJSON, 'base64').toString('utf-8');
    const clientData = JSON.parse(clientDataStr);
    let challenge = clientData.challenge;

    // Handle double-encoding (Base64 string of the challenge string)
    if (challenge.length > 50) {
        try {
            const decoded = Buffer.from(challenge, 'base64').toString('utf-8');
            if (/^[A-Za-z0-9\-_]+$/.test(decoded)) {
                challenge = decoded;
            }
        } catch (e) { }
    }

    // Normalize to Base64URL
    challenge = challenge.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // Verify challenge existence
    const challengeDoc = await db.collection("challenges").doc(challenge).get();
    if (!challengeDoc.exists) {
        // Debug: List existing challenges for this DID
        const snapshot = await db.collection("challenges").where("did", "==", did).get();
        const existing = snapshot.docs.map(d => d.id).join(' | ');
        throw new Error(`Challenge mismatch. Received: [${challenge}]. Existing in DB: [${existing}]`);
    }

    const toB64Url = (s: string) => (s || '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    let verification;
    try {
        const authOptions: any = {
            response: {
                id: credentialId,
                rawId: credentialId,
                type: 'public-key',
                response: {
                    clientDataJSON: toB64Url(clientDataJSON),
                    authenticatorData: toB64Url(authenticatorData),
                    signature: toB64Url(signature),
                    userHandle: null
                },
                clientExtensionResults: {}
            },
            expectedChallenge: challenge,
            expectedOrigin: CONFIG.EXPECTED_ORIGINS,
            expectedRPID: CONFIG.RP_ID,
            credential: {
                id: data.credentialId,
                publicKey: data.credentialPublicKey ? new Uint8Array(Buffer.from(data.credentialPublicKey, 'base64')) : new Uint8Array(),
                counter: (typeof data.counter === 'number') ? data.counter : 0,
                transports: data.transports || []
            },
            requireUserVerification: CONFIG.REQUIRE_USER_VERIFICATION,
        };

        console.log(`[verifyPasskey] calling verifyAuthenticationResponse with options:`, JSON.stringify({
            ...authOptions,
            response: { ...authOptions.response, response: { ...authOptions.response.response, authenticatorData: '...', signature: '...' } },
            credential: { ...authOptions.credential, publicKey: '...' }
        }));

        verification = await verifyAuthenticationResponse(authOptions);
    } catch (e: any) {
        console.error("[verifyPasskey] verifyAuthenticationResponse threw error:", e);
        // Special check for the "reading 'counter'" error to see if we can locate it
        if (e.message && e.message.includes('counter')) {
            console.error("[verifyPasskey] CRITICAL: The 'counter' error occurred. Options state:", {
                hasAuthenticator: !!(data && data.counter !== undefined),
                counterValue: data.counter,
                counterType: typeof data.counter
            });
        }
        throw new Error(`Auth internal error: ${e.message}`);
    }

    console.log(`[verifyPasskey] verification:`, JSON.stringify(verification));

    if (!verification.verified) {
        console.error("Passkey verification failed:", verification);
        throw new Error("Passkey verification failed");
    }

    if (verification && verification.authenticationInfo) {
        const newCounter = (verification.authenticationInfo as any).newCounter;
        if (newCounter !== undefined) {
            await db.collection("guest-dids").doc(guestId).update({
                counter: newCounter
            });
        }
    }

    // Consume challenge
    await db.collection("challenges").doc(challenge).delete();

    return true;
}


const resolvers = {
    Query: {
        hello: () => "Web/A Folio Remote Active",
        getChallenge: async (_: any, { did }: { did: string }) => {
            const challenge = crypto.randomBytes(32).toString('base64url');
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            await admin.firestore().collection("challenges").doc(challenge).set({ did, expiresAt });
            return { nonce: challenge, expiresAt };
        },
        inbox: async (_: any, { did, nonce, signature }: any) => {
            await verifyAuth(did, nonce, signature);
            const snapshot = await admin.firestore().collection("inbox").where("recipientDid", "==", did).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        outbox: async (_: any, { did, nonce, signature }: any) => {
            await verifyAuth(did, nonce, signature);
            const snapshot = await admin.firestore().collection("inbox").where("senderDid", "==", did).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        threads: async (_: any, { did, nonce, signature }: any) => {
            await verifyAuth(did, nonce, signature);
            const db = admin.firestore();
            const [asSender, asRecipient] = await Promise.all([
                db.collection("inbox").where("senderDid", "==", did).get(),
                db.collection("inbox").where("recipientDid", "==", did).get()
            ]);
            const allMessages = [
                ...asSender.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...asRecipient.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];
            const threadMap = new Map<string, any[]>();
            for (const msg of allMessages) {
                const tid = (msg as any).threadId || msg.id;
                if (!threadMap.has(tid)) threadMap.set(tid, []);
                threadMap.get(tid)!.push(msg);
            }
            return Array.from(threadMap.entries()).map(([threadId, messages]) => ({
                threadId,
                messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            }));
        },

        guestInbox: async (_: any, { did, credentialId, signature, authenticatorData, clientDataJSON }: any) => {
            await verifyPasskey(did, credentialId, signature, authenticatorData, clientDataJSON);
            // Fetch messages for Guest DID
            const snapshot = await admin.firestore().collection("inbox").where("recipientDid", "==", did).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    },
    Mutation: {
        // ... (other mutations)

        addUser: async (_: any, { did, nonce, signature, newDid, role }: any) => {
            // 1. Verify Requestor
            await verifyAuth(did, nonce, signature);

            // 2. Authorization Check (Is Requestor an Admin?)
            if (!CONFIG.ADMIN_DIDS.includes(did)) {
                // Check if it's a "grant" chain? For now, strict config-based admin only.
                throw new Error("Unauthorized: Only admins can add users");
            }

            const db = admin.firestore();
            await db.collection("allowed-users").doc(newDid).set({
                did: newDid,
                role: role || "user",
                addedBy: did,
                createdAt: new Date().toISOString()
            });

            return true;
        },

        createGuestDid: async (_: any, { credentialId, attestationObject, clientDataJSON, encryptionPublicKeyJwk }: any) => {
            // NOTE: Guest DIDs are currently "ephemeral" and self-registered via WebAuthn.
            // If we want to restrict this, we would need an "invite code" or similar mechanism
            // embedded in the clientData or attestation.
            // For now, we leave Guest DID creation OPEN (as it's for guests),
            // but persistent "User" account creation via `addUser` is restricted.

            const db = admin.firestore();

            // Decode clientDataJSON to extract challenge
            const clientDataStr = Buffer.from(clientDataJSON, 'base64').toString('utf-8');
            const clientData = JSON.parse(clientDataStr);
            const expectedChallenge = clientData.challenge;

            // Helper for Base64 -> Base64URL
            const toB64Url = (s: string) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

            // Verify using SimpleWebAuthn
            const verification = await verifyRegistrationResponse({
                response: {
                    id: credentialId,
                    rawId: credentialId,
                    type: 'public-key',
                    response: {
                        attestationObject: toB64Url(attestationObject),
                        clientDataJSON: toB64Url(clientDataJSON)
                    }
                } as any,
                expectedChallenge: clientData.challenge,
                expectedOrigin: CONFIG.EXPECTED_ORIGINS,
                expectedRPID: CONFIG.RP_ID,
                requireUserVerification: CONFIG.REQUIRE_USER_VERIFICATION,
            } as any);

            if (!verification.verified || !verification.registrationInfo) {
                console.error("Passkey verification failed", verification);
                throw new Error("Passkey verification failed");
            }

            const info: any = verification ? verification.registrationInfo : null;
            if (!info || !info.credential) {
                console.error("[createGuestDid] registrationInfo.credential is missing", JSON.stringify(verification));
                throw new Error("Registration info missing from verification response");
            }

            console.log(`[createGuestDid] registrationInfo credential keys:`, Object.keys(info.credential));

            const credentialPublicKey = info.credential.publicKey;
            const counter = (typeof info.credential.counter === 'number') ? info.credential.counter : 0;

            if (!credentialPublicKey) {
                throw new Error("Credential public key not found in verification response");
            }

            // Extract Public Key as JWK
            const publicKeyJwk = coseToJwk(Buffer.from(credentialPublicKey));

            const guestId = Math.random().toString(36).substring(2, 10);
            const did = `did:web:${CONFIG.GUEST_DID_DOMAIN}:guest:${guestId}`;
            const expiresAt = new Date(Date.now() + CONFIG.GUEST_DID_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

            await db.collection("guest-dids").doc(guestId).set({
                did,
                credentialId,
                publicKeyJwk: JSON.stringify(publicKeyJwk),
                credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
                encryptionPublicKeyJwk,
                createdAt: new Date().toISOString(),
                expiresAt,
                counter
            });

            return { did, expiresAt };
        },
        guestPostMessage: async (_: any, args: any) => {
            const { did, credentialId, signature, authenticatorData, clientDataJSON, recipientDid, envelope, threadId, inReplyTo, action } = args;

            // 1. Verify Passkey Auth
            await verifyPasskey(did, credentialId, signature, authenticatorData, clientDataJSON);

            // 2. Validate Origin/Host (Implicit host is Recipient or Sender, usually Recipient for Guest)
            // Guest -> Host (Inbox)
            const senderDid = did;
            const hostDid = recipientDid; // Guest posts to Host's Inbox

            const db = admin.firestore();
            const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const createdAt = new Date().toISOString();

            const message: any = {
                senderDid,
                recipientDid,
                hostDid,
                envelope,
                threadId: threadId || messageId,
                createdAt
            };

            if (action) message.action = action;
            if (inReplyTo) message.inReplyTo = inReplyTo;

            await db.collection("inbox").doc(messageId).set(message);

            return { id: messageId, ...message };
        },
        postMessage: async (_: any, args: any) => {
            const { did, nonce, signature, senderDid, recipientDid, hostDid, envelope, threadId, inReplyTo, action } = args;

            await verifyAuth(did, nonce, signature);

            // Access Control: Strict Mode
            // 1. Check if DID is allowed (if we are restricting usage)
            const isGuest = did.includes(":guest:");
            if (!isGuest) {
                const userDoc = await admin.firestore().collection("allowed-users").doc(did).get();
                const isStaticAdmin = CONFIG.ADMIN_DIDS.includes(did);

                if (!userDoc.exists && !isStaticAdmin) {
                    // Try VC-based auth
                    if (args.vc) {
                        try {
                            const vcData = JSON.parse(args.vc);
                            const result = await verifyFolioVC(vcData, { trustedIssuerDids: CONFIG.ADMIN_DIDS });
                            if (result.isValid && result.credentialSubject?.id === did && result.credentialSubject?.["folio:access"]) {
                                console.log(`✅ Authorized via VC for ${did}`);
                            } else {
                                throw new Error("Access Denied: Invalid or unauthorized VC.");
                            }
                        } catch (ve: any) {
                            throw new Error(`Access Denied: VC verification failed: ${ve.message}`);
                        }
                    } else {
                        throw new Error("Access Denied: DID not registered and no valid VC provided.");
                    }
                }
            }

            // Relaxed Validation for Public Inbox usage
            if (did !== senderDid && did !== recipientDid) {
                throw new Error("Authenticated DID must be Sender or Recipient");
            }

            // Allow Sender to post with hostDid = Recipient (Inbox) or Sender (Outbox)
            // For now, we just ensure hostDid is consistent
            if (hostDid !== senderDid && hostDid !== recipientDid) {
                throw new Error("hostDid must match senderDid or recipientDid");
            }

            const db = admin.firestore();
            const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const createdAt = new Date().toISOString();

            const message: any = {
                senderDid,
                recipientDid,
                hostDid,
                envelope,
                threadId: threadId || messageId,
                createdAt
            };

            if (action) message.action = action;
            if (inReplyTo) message.inReplyTo = inReplyTo;

            await db.collection("inbox").doc(messageId).set(message);

            return { id: messageId, ...message };
        },
        acknowledgeMessage: async (_: any, { did, nonce, signature, id }: any) => {
            await verifyAuth(did, nonce, signature);
            await admin.firestore().collection("inbox").doc(id).delete();
            return true;
        }
    }
};

const app = express();

// Manual CORS to debug/fix preflight issues
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === 'OPTIONS') {
        res.status(204).send();
        return;
    }
    next();
});
const server = new ApolloServer({ typeDefs, resolvers });

// Async initialization wrapper for Firebase
let apolloHandler: any;

export const api = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
    // Ensure WASM is initialized
    if (!wasmReady) {
        try {
            await initWasm();
            wasmReady = true;
        } catch (e) {
            console.error("WASM init failed:", e);
        }
    }

    if (!apolloHandler) {
        await server.start();
        apolloHandler = expressMiddleware(server);
        // Remove cors() from here as it is applied globally
        app.use("/", json(), apolloHandler);
    }
    return app(req, res);
});

/**
 * Serve DID Documents for Guest DIDs
 * URL: /.well-known/did/guest/<id>/did.json
 */
export const didDocument = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
    // ... (rest of function remains unchanged)
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    // Parse guest ID from path: /guest/<id>/did.json or /.well-known/did/guest/<id>/did.json
    const pathMatch = req.path.match(/\/(?:\.well-known\/did\/)?guest\/([^\/]+)\/did\.json/);
    if (!pathMatch) {
        res.status(404).json({ error: "Invalid DID Document path" });
        return;
    }

    const guestId = pathMatch[1];
    const db = admin.firestore();

    try {
        const doc = await db.collection("guest-dids").doc(guestId).get();
        if (!doc.exists) {
            res.status(404).json({ error: "Guest DID not found" });
            return;
        }

        const data = doc.data();
        const did = data?.did;
        const publicKeyJwk = JSON.parse(data?.publicKeyJwk || "{}");
        const expiresAt = data?.expiresAt;

        // Check expiration
        if (new Date(expiresAt) < new Date()) {
            res.status(410).json({ error: "Guest DID expired" });
            return;
        }

        const encryptionPublicKeyJwkRaw = data?.encryptionPublicKeyJwk;

        const verificationMethod: any[] = [{
            "id": `${did}#passkey`,
            "type": "JsonWebKey2020",
            "controller": did,
            "publicKeyJwk": publicKeyJwk
        }];

        const keyAgreement: string[] = [];

        if (encryptionPublicKeyJwkRaw) {
            try {
                const encryptionKey = JSON.parse(encryptionPublicKeyJwkRaw);
                const limitId = `${did}#x25519`;
                verificationMethod.push({
                    "id": limitId,
                    "type": "JsonWebKey2020",
                    "controller": did,
                    "publicKeyJwk": encryptionKey
                });
                keyAgreement.push(limitId);
            } catch (e) {
                console.warn("Failed to parse encryption key", e);
            }
        }

        // Generate DID Document
        const didDocument = {
            "@context": "https://www.w3.org/ns/did/v1",
            "id": did,
            "verificationMethod": verificationMethod,
            "authentication": [`${did}#passkey`],
            "keyAgreement": keyAgreement.length > 0 ? keyAgreement : undefined,
            "service": [{
                "type": "FolioInbox",
                "serviceEndpoint": `https://srn.example/api/guest-inbox/${guestId}`
            }],
            "expiresAt": expiresAt
        };

        res.set("Content-Type", "application/did+json");
        res.status(200).json(didDocument);
    } catch (error: any) {
        console.error("Error serving DID Document:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export const cleanupGuestDids = functions.region('asia-northeast1').pubsub.schedule('every 24 hours').onRun(async (context) => {
    // ... (rest of function remains unchanged)
    const db = admin.firestore();
    const now = new Date();
    const snapshot = await db.collection('guest-dids').where('expiresAt', '<', now.toISOString()).get();

    if (snapshot.empty) {
        console.log('No expired Guest DIDs found.');
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} expired Guest DIDs`);
});

/**
 * Web/A Pre-key Vending Machine (PFS Support)
 * Provides Tier 3 True PFS by serving one-time use public keys.
 */
export const getPreKey = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
    // ... (rest of function remains unchanged)
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    const db = admin.firestore();

    try {
        const result = await db.runTransaction(async (transaction) => {
            // 1. Find the oldest available pre-key
            const prekeysRef = db.collection("prekeys");
            const q = prekeysRef.where("status", "==", "available").orderBy("created_at", "asc").limit(1);
            const snapshot = await transaction.get(q);

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            const data = doc.data();

            // 2. Mark as consumed atomically
            transaction.update(doc.ref, {
                status: "consumed",
                consumed_at: admin.firestore.FieldValue.serverTimestamp()
            });

            return {
                kid: doc.id,
                recipient_x25519: data.pub_key,
                recipient_pqc: data.pqc_pub_key
            };
        });

        if (!result) {
            res.status(503).json({ error: "No pre-keys available in vault" });
            return;
        }

        res.status(200).json(result);
    } catch (e: any) {
        console.error("PFS Error:", e);

        // Fallback if index is not ready yet
        if (e.code === 9 && e.details && e.details.includes("index")) {
            res.status(503).json({ error: "Index building, try again later" });
            return;
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});
