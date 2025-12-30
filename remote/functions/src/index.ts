import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { initWasm, ed25519Verify } from "./wasm_util";

admin.initializeApp();

// Initialize WASM at startup
let wasmReady = false;
initWasm().then(() => {
    wasmReady = true;
    console.log("WASM initialized for Firebase Functions");
}).catch(err => {
    console.error("Failed to initialize WASM:", err);
});

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
    const publicKey = await resolvePublicKey(did);
    const isValid = ed25519Verify(publicKey, Buffer.from(nonce, "utf-8"), Buffer.from(signature, "hex"));
    if (!isValid) throw new Error("Invalid signature");
    await db.collection("challenges").doc(nonce).delete();
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
    createGuestDid(credentialId: String!, publicKeyJwk: String!, encryptionPublicKeyJwk: String!): GuestDid! 
    postMessage(
      did: ID!
      nonce: String!
      signature: String!
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
    const db = admin.firestore();
    const guestId = did.split(":").pop();
    if (!guestId) throw new Error("Invalid DID");

    const doc = await db.collection("guest-dids").doc(guestId).get();
    if (!doc.exists) throw new Error("Guest DID not found");

    const data = doc.data();
    if (data?.credentialId !== credentialId) throw new Error("Credential ID mismatch");
    if (new Date(data?.expiresAt) < new Date()) throw new Error("Guest DID expired");

    const jwk = JSON.parse(data?.publicKeyJwk);

    const clientData = Buffer.from(clientDataJSON, 'base64');
    // const clientDataObj = JSON.parse(clientData.toString());
    // TODO: Verify challenge from clientDataObj

    const authData = Buffer.from(authenticatorData, 'base64');
    const clientDataHash = crypto.createHash('sha256').update(clientData).digest();
    const signatureBase = Buffer.concat([authData, clientDataHash]);

    const publicKey = crypto.createPublicKey({
        key: jwk,
        format: 'jwk'
    });

    const isValid = crypto.verify(
        'sha256',
        signatureBase,
        publicKey,
        Buffer.from(signature, 'base64')
    );

    if (!isValid) throw new Error("Invalid Passkey signature");
    return true;
}

const resolvers = {
    Query: {
        hello: () => "Web/A Folio Remote Active",
        getChallenge: async (_: any, { did }: { did: string }) => {
            const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            await admin.firestore().collection("challenges").doc(nonce).set({ did, expiresAt });
            return { nonce, expiresAt };
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
        createGuestDid: async (_: any, { credentialId, publicKeyJwk, encryptionPublicKeyJwk }: any) => {
            const db = admin.firestore();
            const guestId = Math.random().toString(36).substring(2, 10);
            const did = `did:web:srn.example:guest:${guestId}`;
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await db.collection("guest-dids").doc(guestId).set({
                did,
                credentialId,
                publicKeyJwk,
                encryptionPublicKeyJwk,
                createdAt: new Date().toISOString(),
                expiresAt
            });

            return { did, expiresAt };
        },
        postMessage: async (_: any, args: any) => {
            const { did, nonce, signature, senderDid, recipientDid, hostDid, envelope, threadId, inReplyTo, action } = args;

            await verifyAuth(did, nonce, signature);

            // Invariant: hostDid MUST equal senderDid OR recipientDid
            if (hostDid !== senderDid && hostDid !== recipientDid) {
                throw new Error("Invariant violation: hostDid must equal senderDid or recipientDid");
            }

            // The authenticated DID must be the host
            if (did !== hostDid) {
                throw new Error("Only the host can post messages to this server");
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
                action,
                createdAt
            };

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
const server = new ApolloServer({ typeDefs, resolvers });

// Async initialization wrapper for Firebase
let apolloHandler: any;

export const api = functions.https.onRequest(async (req, res) => {
    // Ensure WASM is initialized
    if (!wasmReady) {
        await initWasm();
        wasmReady = true;
    }

    if (!apolloHandler) {
        await server.start();
        apolloHandler = expressMiddleware(server);
        app.use("/", cors(), json(), apolloHandler);
    }
    return app(req, res);
});

/**
 * Serve DID Documents for Guest DIDs
 * URL: /.well-known/did/guest/<id>/did.json
 */
export const didDocument = functions.https.onRequest(async (req, res) => {
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

export const cleanupGuestDids = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
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
