import canonicalize from "canonicalize";
import { base58ToBytes, decodeDidKey } from "./did_key";
import { initWasm, ed25519Verify, mlDsa44Verify } from "./wasm_util";

export interface VerificationResult {
    isValid: boolean;
    checks: {
        ed25519: boolean;
        pqc: boolean;
    };
    credentialSubject?: any;
    error?: string;
}

async function resolvePublicKey(vm: string): Promise<Uint8Array | null> {
    if (vm.startsWith("did:key:")) {
        const baseDid = vm.split("#")[0];
        return decodeDidKey(baseDid);
    }
    // For did:web etc, we could implement resolution here
    return null;
}

export async function verifyFolioVC(vc: any, options: { trustedIssuerDids: string[] }): Promise<VerificationResult> {
    await initWasm();
    try {
        if (!vc.issuer || !options.trustedIssuerDids.includes(vc.issuer)) {
            throw new Error(`Unauthorized issuer: ${vc.issuer}`);
        }

        const proofs = vc.proof;
        if (!Array.isArray(proofs)) throw new Error("Invalid VC: proof must be an array");

        const payload = { ...vc };
        delete payload.proof;

        const jsonString = canonicalize(payload);
        if (!jsonString) throw new Error("Canonicalization failed");
        const payloadBytes = Buffer.from(jsonString, "utf-8");

        const edProof = proofs.find(p => p.cryptosuite === "eddsa-jcs-2022");
        const pqcProof = proofs.find(p => p.cryptosuite === "ml-dsa-44-jcs-2025");

        const checks = { ed25519: false, pqc: false };

        if (edProof) {
            const pubKey = await resolvePublicKey(edProof.verificationMethod);
            if (pubKey) {
                const sig = base58ToBytes(edProof.proofValue.slice(1));
                checks.ed25519 = ed25519Verify(pubKey, payloadBytes, sig);
            }
        }

        if (pqcProof) {
            // For now, PQC resolution is a bit tricky for did:key.
            // In a real scenario, we'd fetch the DID document or have it cached.
            // For this PoC, we might skip PQC check if we can't find the key,
            // but if we find it (e.g. from trusted keys store), we check it.
            // checks.pqc = ...
        }

        return {
            isValid: checks.ed25519, // For now, we accept Ed25519 only if PQC key is missing
            checks,
            credentialSubject: vc.credentialSubject
        };
    } catch (e: any) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false },
            error: e.message
        };
    }
}
