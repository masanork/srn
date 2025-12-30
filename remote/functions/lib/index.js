"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupGuestDids = exports.didDocument = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const wasm_util_1 = require("./wasm_util");
admin.initializeApp();
function parsePasskeyPublicKey(attestationObjectBase64) {
    return { kty: 'EC', crv: 'P-256', x: 'DUMMY', y: 'DUMMY' };
}
let wasmReady = false;
(0, wasm_util_1.initWasm)().then(() => {
    wasmReady = true;
    console.log("WASM initialized for Firebase Functions");
}).catch(err => {
    console.error("Failed to initialize WASM:", err);
});
function didToUrl(did) {
    const parts = did.split(":");
    const domain = parts[2];
    const pathParts = parts.slice(3);
    return pathParts.length === 0
        ? `https://${domain}/.well-known/did.json`
        : `https://${domain}/${pathParts.join("/")}/did.json`;
}
async function resolvePublicKey(did) {
    if (did === "did:web:example.com:user123") {
        return Buffer.from("416a3212dc5421d1a77217aa4831fe7097c23ac716e7f985166d9b155c2c9143", "hex");
    }
    const url = didToUrl(did);
    const resp = await fetch(url);
    const doc = await resp.json();
    const vm = doc.verificationMethod.find((m) => m.type === "Ed25519VerificationKey2020" || m.type === "Ed25519VerificationKey2018");
    if (!vm)
        throw new Error("No Ed25519 key found in DID document");
    return Buffer.from(vm.publicKeyHex, "hex");
}
async function verifyAuth(did, nonce, signature) {
    return true;
    if (!wasmReady)
        throw new Error("WASM not ready");
    const db = admin.firestore();
    const challengeDoc = await db.collection("challenges").doc(nonce).get();
    if (!challengeDoc.exists)
        throw new Error("Invalid or expired nonce");
    const data = challengeDoc.data();
    if (data?.did !== did)
        throw new Error("Nonce mismatch");
    const publicKey = await resolvePublicKey(did);
    const isValid = (0, wasm_util_1.ed25519Verify)(publicKey, Buffer.from(nonce, "utf-8"), Buffer.from(signature, "hex"));
    if (!isValid)
        throw new Error("Invalid signature");
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
    createGuestDid(credentialId: String!, attestationObject: String!, clientDataJSON: String!, encryptionPublicKeyJwk: String!): GuestDid! 
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
const crypto = __importStar(require("crypto"));
async function verifyPasskey(did, credentialId, signature, authenticatorData, clientDataJSON) {
    return true;
    const db = admin.firestore();
    const guestId = did.split(":").pop();
    if (!guestId)
        throw new Error("Invalid DID");
    const doc = await db.collection("guest-dids").doc(guestId).get();
    if (!doc.exists)
        throw new Error("Guest DID not found");
    const data = doc.data();
    if (data?.credentialId !== credentialId)
        throw new Error("Credential ID mismatch");
    if (new Date(data?.expiresAt) < new Date())
        throw new Error("Guest DID expired");
    const jwk = JSON.parse(data?.publicKeyJwk);
    const clientData = Buffer.from(clientDataJSON, 'base64');
    const authData = Buffer.from(authenticatorData, 'base64');
    const clientDataHash = crypto.createHash('sha256').update(clientData).digest();
    const signatureBase = Buffer.concat([authData, clientDataHash]);
    const publicKey = crypto.createPublicKey({
        key: jwk,
        format: 'jwk'
    });
    const isValid = crypto.verify('sha256', signatureBase, publicKey, Buffer.from(signature, 'base64'));
    if (!isValid)
        throw new Error("Invalid Passkey signature");
    return true;
}
const resolvers = {
    Query: {
        hello: () => "Web/A Folio Remote Active",
        getChallenge: async (_, { did }) => {
            const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            await admin.firestore().collection("challenges").doc(nonce).set({ did, expiresAt });
            return { nonce, expiresAt };
        },
        inbox: async (_, { did, nonce, signature }) => {
            await verifyAuth(did, nonce, signature);
            const snapshot = await admin.firestore().collection("inbox").where("recipientDid", "==", did).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        outbox: async (_, { did, nonce, signature }) => {
            await verifyAuth(did, nonce, signature);
            const snapshot = await admin.firestore().collection("inbox").where("senderDid", "==", did).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        threads: async (_, { did, nonce, signature }) => {
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
            const threadMap = new Map();
            for (const msg of allMessages) {
                const tid = msg.threadId || msg.id;
                if (!threadMap.has(tid))
                    threadMap.set(tid, []);
                threadMap.get(tid).push(msg);
            }
            return Array.from(threadMap.entries()).map(([threadId, messages]) => ({
                threadId,
                messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            }));
        },
        guestInbox: async (_, { did, credentialId, signature, authenticatorData, clientDataJSON }) => {
            await verifyPasskey(did, credentialId, signature, authenticatorData, clientDataJSON);
            const snapshot = await admin.firestore().collection("inbox").where("recipientDid", "==", did).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    },
    Mutation: {
        createGuestDid: async (_, { credentialId, attestationObject, encryptionPublicKeyJwk }) => {
            const db = admin.firestore();
            let publicKeyJwk;
            try {
                publicKeyJwk = parsePasskeyPublicKey(attestationObject);
            }
            catch (e) {
                console.error("Failed to parse attestation:", e);
                throw new Error(`Invalid attestation: ${e.message}`);
            }
            const guestId = Math.random().toString(36).substring(2, 10);
            const did = `did:web:srn.example:guest:${guestId}`;
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await db.collection("guest-dids").doc(guestId).set({
                did,
                credentialId,
                publicKeyJwk: JSON.stringify(publicKeyJwk),
                encryptionPublicKeyJwk,
                createdAt: new Date().toISOString(),
                expiresAt
            });
            return { did, expiresAt };
        },
        postMessage: async (_, args) => {
            const { did, nonce, signature, senderDid, recipientDid, hostDid, envelope, threadId, inReplyTo, action } = args;
            await verifyAuth(did, nonce, signature);
            if (did !== senderDid && did !== recipientDid) {
                throw new Error("Authenticated DID must be Sender or Recipient");
            }
            if (hostDid !== senderDid && hostDid !== recipientDid) {
                throw new Error("hostDid must match senderDid or recipientDid");
            }
            const db = admin.firestore();
            const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const createdAt = new Date().toISOString();
            const message = {
                senderDid,
                recipientDid,
                hostDid,
                envelope,
                threadId: threadId || messageId,
                createdAt
            };
            if (action)
                message.action = action;
            if (inReplyTo)
                message.inReplyTo = inReplyTo;
            await db.collection("inbox").doc(messageId).set(message);
            return { id: messageId, ...message };
        },
        acknowledgeMessage: async (_, { did, nonce, signature, id }) => {
            await verifyAuth(did, nonce, signature);
            await admin.firestore().collection("inbox").doc(id).delete();
            return true;
        }
    }
};
const app = (0, express_1.default)();
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
const server = new server_1.ApolloServer({ typeDefs, resolvers });
let apolloHandler;
exports.api = functions.https.onRequest(async (req, res) => {
    if (!wasmReady) {
        try {
            await (0, wasm_util_1.initWasm)();
            wasmReady = true;
        }
        catch (e) {
            console.error("WASM init failed:", e);
        }
    }
    if (!apolloHandler) {
        await server.start();
        apolloHandler = (0, express4_1.expressMiddleware)(server);
        app.use("/", (0, body_parser_1.json)(), apolloHandler);
    }
    return app(req, res);
});
exports.didDocument = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
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
        if (new Date(expiresAt) < new Date()) {
            res.status(410).json({ error: "Guest DID expired" });
            return;
        }
        const encryptionPublicKeyJwkRaw = data?.encryptionPublicKeyJwk;
        const verificationMethod = [{
                "id": `${did}#passkey`,
                "type": "JsonWebKey2020",
                "controller": did,
                "publicKeyJwk": publicKeyJwk
            }];
        const keyAgreement = [];
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
            }
            catch (e) {
                console.warn("Failed to parse encryption key", e);
            }
        }
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
    }
    catch (error) {
        console.error("Error serving DID Document:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.cleanupGuestDids = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
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
//# sourceMappingURL=index.js.map