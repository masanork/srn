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
    hello: String 
  }
  
  type Mutation { 
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
        }
    },
    Mutation: {
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
