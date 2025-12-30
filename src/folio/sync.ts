import path from "node:path";
import * as fs from "fs-extra";
import { initWasm, ed25519Sign } from "../core/wasm_core";

export interface SyncOptions {
    folioDir: string;
    remoteUrl: string;
    did: string;
    privateKey?: string; // Hex string
    mode?: "inbox" | "outbox" | "full"; // Default: inbox
}

async function getAuth(remoteUrl: string, did: string, privateKey: string) {
    // 1. Get Challenge
    const challengeQuery = `
    query GetChallenge($did: ID!) {
      getChallenge(did: $did) {
        nonce
      }
    }
  `;

    const challengeResp = await fetch(remoteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: challengeQuery,
            variables: { did }
        })
    });

    if (!challengeResp.ok) {
        throw new Error(`Failed to get challenge: ${challengeResp.statusText}`);
    }

    const challengeData = await challengeResp.json();
    const nonce = challengeData.data?.getChallenge?.nonce;
    if (!nonce) throw new Error("Challenge nonce not received from server");

    // 2. Sign Challenge
    const sigBytes = ed25519Sign(
        Buffer.from(privateKey, "hex"),
        Buffer.from(nonce, "utf-8")
    );
    const signature = Buffer.from(sigBytes).toString("hex");

    return { nonce, signature };
}

/**
 * Synchronizes the local Folio history with the remote Inbox via GraphQL.
 */
export async function syncFolio(options: SyncOptions) {
    const { folioDir, remoteUrl, did, privateKey } = options;
    const historyDir = path.join(folioDir, "history");
    await fs.ensureDir(historyDir);

    if (!privateKey) {
        throw new Error("Private key is required for signing challenge.");
    }

    await initWasm();

    console.error(`Syncing with remote: ${remoteUrl} as ${did}`);

    const { nonce, signature } = await getAuth(remoteUrl, did, privateKey);

    // 3. Fetch Inbox via GraphQL with signature
    const query = `
    query GetInbox($did: ID!, $nonce: String!, $signature: String!) {
      inbox(did: $did, nonce: $nonce, signature: $signature) {
        id
        threadId
        inReplyTo
        action
        envelope
        createdAt
      }
    }
  `;

    try {
        const response = await fetch(remoteUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query,
                variables: { did, nonce, signature }
            })
        });

        if (!response.ok) {
            throw new Error(`Remote sync failed: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.errors) {
            throw new Error(`GraphQL Error: ${result.errors[0].message}`);
        }
        const messages = result.data?.inbox || [];

        if (messages.length === 0) {
            console.log("Inbox is empty. Nothing to sync.");
            return;
        }

        console.log(`Found ${messages.length} new messages.`);

        for (const msg of messages) {
            const fileName = `${msg.id}.html`;
            const filePath = path.join(historyDir, fileName);
            const metaPath = path.join(historyDir, `${msg.id}.meta.json`);

            const html = `<html><body><script id="weba-l2-envelope" type="application/json">${msg.envelope}</script></body></html>`;
            await fs.writeFile(filePath, html);

            const meta = {
                id: msg.id,
                thread_id: msg.threadId,
                in_reply_to: msg.inReplyTo,
                action: msg.action,
                synced_at: new Date().toISOString(),
                remote_created_at: msg.createdAt
            };
            await fs.writeJson(metaPath, meta, { spaces: 2 });

            console.log(`Saved: ${fileName}`);

            // 3. Acknowledge (Requires a fresh challenge if server deletes nonce)
            await acknowledgeMessage(remoteUrl, msg.id, did, privateKey);
        }

        console.log("✅ Sync completed.");
    } catch (e: any) {
        throw new Error(`Sync error: ${e.message}`);
    }
}

async function acknowledgeMessage(remoteUrl: string, id: string, did: string, privateKey: string) {
    const { nonce, signature } = await getAuth(remoteUrl, did, privateKey);

    const mutation = `
    mutation Ack($did: ID!, $nonce: String!, $signature: String!, $id: ID!) {
      acknowledgeMessage(did: $did, nonce: $nonce, signature: $signature, id: $id)
    }
  `;

    const response = await fetch(remoteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: mutation,
            variables: { did, nonce, signature, id }
        })
    });

    const result = await response.json();
    if (!response.ok || result.errors) {
        console.error(`Warning: Failed to acknowledge message ${id}: ${result.errors?.[0]?.message || response.statusText}`);
    }
}
