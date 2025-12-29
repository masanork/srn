import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Usage: bun scripts/import_keys.ts path/to/prekeys-firebase.json

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
  process.exit(1);
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: bun import_keys.ts <path-to-prekeys-firebase.json>");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8")))
});

const db = admin.firestore();

async function importKeys() {
  const data = JSON.parse(fs.readFileSync(path.resolve(jsonPath), "utf-8"));
  const keys = data.keys;
  console.log(`Importing ${keys.length} keys to Firestore...`);

  const batchSize = 500;
  for (let i = 0; i < keys.length; i += batchSize) {
    const chunk = keys.slice(i, i + batchSize);
    const batch = db.batch();

    for (const k of chunk) {
      const ref = db.collection("prekeys").doc(k.kid);
      batch.set(ref, {
        pub_key: k.pub_key,
        pqc_pub_key: k.pqc_pub_key,
        status: "available",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    console.log(`- Committed batch ${i / batchSize + 1}`);
  }

  console.log("Done.");
}

importKeys().catch(console.error);
