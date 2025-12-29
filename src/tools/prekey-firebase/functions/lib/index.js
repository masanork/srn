"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreKey = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
/**
 * Web/A Pre-key Vending Machine (Firebase Edition)
 * Provides Tier 3 True PFS by serving one-time use public keys.
 */
exports.getPreKey = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
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
                consumed_at: firestore_1.FieldValue.serverTimestamp()
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
    }
    catch (e) {
        console.error("PFS Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//# sourceMappingURL=index.js.map