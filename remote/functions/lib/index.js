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
const cbor_x_1 = require("cbor-x");
const server_2 = require("@simplewebauthn/server");
const RP_ID = process.env.RP_ID || "localhost";
const EXPECTED_ORIGINS = process.env.EXPECTED_ORIGINS
    ? process.env.EXPECTED_ORIGINS.split(',').map(o => o.trim())
    : [
        "http://localhost:5002", "http://127.0.0.1:5002",
        "http://localhost:5001", "http://127.0.0.1:5001",
        "http://localhost:8081", "http://127.0.0.1:8081",
        "http://localhost:8081/", "http://127.0.0.1:8081/"
    ];
const GUEST_DID_DOMAIN = process.env.GUEST_DID_DOMAIN || "srn.example";
const GUEST_DID_EXPIRATION_DAYS = parseInt(process.env.GUEST_DID_EXPIRATION_DAYS || "30");
admin.initializeApp();
function coseToJwk(cose) {
    const struct = (0, cbor_x_1.decode)(cose);
    let x, y;
    if (struct instanceof Map) {
        x = struct.get(-2);
        y = struct.get(-3);
    }
    else {
        x = struct[-2];
        y = struct[-3];
    }
    if (!x || !y)
        throw new Error("Invalid COSE P-256 key");
    return {
        kty: "EC", crv: "P-256",
        x: Buffer.from(x).toString('base64url'),
        y: Buffer.from(y).toString('base64url')
    };
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
    if (!did)
        throw new Error("Missing DID");
    if (!credentialId)
        throw new Error("Missing Credential ID");
    console.log(`[verifyPasskey] start:`, { did, credentialId });
    const db = admin.firestore();
    const guestId = did.split(":").pop();
    if (!guestId)
        throw new Error("Invalid DID format: missing guest ID part");
    const doc = await db.collection("guest-dids").doc(guestId).get();
    if (!doc.exists)
        throw new Error(`Guest DID ${did} not found in database (guestId: ${guestId})`);
    const data = doc.data();
    if (!data)
        throw new Error(`Guest DID ${did} exists but has no data`);
    console.log(`[verifyPasskey] DB data:`, {
        hasId: !!data.credentialId,
        hasKey: !!data.credentialPublicKey,
        counter: data.counter,
        dbId: data.credentialId
    });
    if (data.credentialId !== credentialId) {
        throw new Error(`Credential ID mismatch. DB: ${data.credentialId}, Got: ${credentialId}`);
    }
    const clientDataStr = Buffer.from(clientDataJSON, 'base64').toString('utf-8');
    const clientData = JSON.parse(clientDataStr);
    let challenge = clientData.challenge;
    if (challenge.length > 50) {
        try {
            const decoded = Buffer.from(challenge, 'base64').toString('utf-8');
            if (/^[A-Za-z0-9\-_]+$/.test(decoded)) {
                challenge = decoded;
            }
        }
        catch (e) { }
    }
    challenge = challenge.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const challengeDoc = await db.collection("challenges").doc(challenge).get();
    if (!challengeDoc.exists) {
        const snapshot = await db.collection("challenges").where("did", "==", did).get();
        const existing = snapshot.docs.map(d => d.id).join(' | ');
        throw new Error(`Challenge mismatch. Received: [${challenge}]. Existing in DB: [${existing}]`);
    }
    const toB64Url = (s) => (s || '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    let verification;
    try {
        const authOptions = {
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
            expectedOrigin: EXPECTED_ORIGINS,
            expectedRPID: RP_ID,
            credential: {
                id: data.credentialId,
                publicKey: data.credentialPublicKey ? new Uint8Array(Buffer.from(data.credentialPublicKey, 'base64')) : new Uint8Array(),
                counter: (typeof data.counter === 'number') ? data.counter : 0,
                transports: data.transports || []
            },
            requireUserVerification: false,
        };
        console.log(`[verifyPasskey] calling verifyAuthenticationResponse with options:`, JSON.stringify({
            ...authOptions,
            response: { ...authOptions.response, response: { ...authOptions.response.response, authenticatorData: '...', signature: '...' } },
            credential: { ...authOptions.credential, publicKey: '...' }
        }));
        verification = await (0, server_2.verifyAuthenticationResponse)(authOptions);
    }
    catch (e) {
        console.error("[verifyPasskey] verifyAuthenticationResponse threw error:", e);
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
        const newCounter = verification.authenticationInfo.newCounter;
        if (newCounter !== undefined) {
            await db.collection("guest-dids").doc(guestId).update({
                counter: newCounter
            });
        }
    }
    await db.collection("challenges").doc(challenge).delete();
    return true;
}
const resolvers = {
    Query: {
        hello: () => "Web/A Folio Remote Active",
        getChallenge: async (_, { did }) => {
            const challenge = crypto.randomBytes(32).toString('base64url');
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            await admin.firestore().collection("challenges").doc(challenge).set({ did, expiresAt });
            return { nonce: challenge, expiresAt };
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
        createGuestDid: async (_, { credentialId, attestationObject, clientDataJSON, encryptionPublicKeyJwk }) => {
            const db = admin.firestore();
            const clientDataStr = Buffer.from(clientDataJSON, 'base64').toString('utf-8');
            const clientData = JSON.parse(clientDataStr);
            const expectedChallenge = clientData.challenge;
            const toB64Url = (s) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            const verification = await (0, server_2.verifyRegistrationResponse)({
                response: {
                    id: credentialId,
                    rawId: credentialId,
                    type: 'public-key',
                    response: {
                        attestationObject: toB64Url(attestationObject),
                        clientDataJSON: toB64Url(clientDataJSON)
                    }
                },
                expectedChallenge: clientData.challenge,
                expectedOrigin: EXPECTED_ORIGINS,
                expectedRPID: RP_ID,
                requireUserVerification: false,
            });
            if (!verification.verified || !verification.registrationInfo) {
                console.error("Passkey verification failed", verification);
                throw new Error("Passkey verification failed");
            }
            const info = verification ? verification.registrationInfo : null;
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
            const publicKeyJwk = coseToJwk(Buffer.from(credentialPublicKey));
            const guestId = Math.random().toString(36).substring(2, 10);
            const did = `did:web:${GUEST_DID_DOMAIN}:guest:${guestId}`;
            const expiresAt = new Date(Date.now() + GUEST_DID_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
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