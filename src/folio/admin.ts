
import { initWasm, ed25519Sign } from "../core/wasm_core";

interface AdminOptions {
    remoteUrl: string;
    adminDid: string;
    adminKey: string; // Hex
}

async function getAuth(remoteUrl: string, did: string, privateKey: string) {
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

    const sigBytes = ed25519Sign(
        Buffer.from(privateKey, "hex"),
        Buffer.from(nonce, "utf-8")
    );
    const signature = Buffer.from(sigBytes).toString("hex");

    return { nonce, signature };
}

export async function addUser(options: AdminOptions, newDid: string, role: string = "user") {
    const { remoteUrl, adminDid, adminKey } = options;

    await initWasm();

    const auth = await getAuth(remoteUrl, adminDid, adminKey);

    const mutation = `
        mutation AddUser($did: ID!, $nonce: String!, $signature: String!, $newDid: String!, $role: String) {
            addUser(did: $did, nonce: $nonce, signature: $signature, newDid: $newDid, role: $role)
        }
    `;

    const response = await fetch(remoteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: mutation,
            variables: {
                did: adminDid,
                nonce: auth.nonce,
                signature: auth.signature,
                newDid,
                role
            }
        })
    });

    const result = await response.json();
    if (result.errors) {
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
    }

    if (result.data?.addUser) {
        console.log(`✅ User ${newDid} added successfully as ${role}.`);
    } else {
        throw new Error("Failed to add user (unknown error)");
    }
}

import { createHybridVC } from "../core/vc";
import type { HybridKeys } from "../core/vc";

export async function issueAccessPass(adminKeys: HybridKeys, adminDid: string, userDid: string, scope: string = "post"): Promise<object> {
    const subject = {
        id: userDid,
        "folio:access": true,
        "folio:scope": scope
    };

    const vc = await createHybridVC(
        { credentialSubject: subject },
        adminKeys,
        adminDid
    );

    return vc;
}
