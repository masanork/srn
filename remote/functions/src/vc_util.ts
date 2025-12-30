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
    issuer?: string;
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

export async function verifyGenericVC(vc: any): Promise<VerificationResult> {
    await initWasm();
    try {
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
            } else {
                throw new Error(`Could not resolve public key for ${edProof.verificationMethod}`);
            }
        }

        return {
            isValid: checks.ed25519,
            checks,
            credentialSubject: vc.credentialSubject,
            issuer: vc.issuer
        };
    } catch (e: any) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false },
            error: e.message
        };
    }
}

export async function verifyFolioVC(vc: any, options: { trustedIssuerDids: string[] }): Promise<VerificationResult> {
    if (!vc.issuer || !options.trustedIssuerDids.includes(vc.issuer)) {
        return {
            isValid: false,
            checks: { ed25519: false, pqc: false },
            error: `Unauthorized issuer: ${vc.issuer}`
        };
    }
    return verifyGenericVC(vc);
}

export async function verifyDelegationChain(vcs: any[], requestorDid: string, trustedRoots: string[]): Promise<{ authorizedAs: string | null; error?: string }> {
    // 1. Check for direct Access Pass
    for (const vc of vcs) {
        const res = await verifyFolioVC(vc, { trustedIssuerDids: trustedRoots });
        if (res.isValid && res.credentialSubject?.id === requestorDid && res.credentialSubject?.["folio:access"]) {
            return { authorizedAs: requestorDid };
        }
    }

    // 2. Check for Delegation Chain
    for (const vc of vcs) {
        const res = await verifyGenericVC(vc);
        if (res.isValid && res.issuer && res.credentialSubject?.id === requestorDid && res.credentialSubject?.["folio:delegate"]) {
            const delegatorDid = res.issuer;
            // Now find the delegator's own Access Pass from a trusted root
            for (const pass of vcs) {
                const passRes = await verifyFolioVC(pass, { trustedIssuerDids: trustedRoots });
                if (passRes.isValid && passRes.credentialSubject?.id === delegatorDid && passRes.credentialSubject?.["folio:access"]) {
                    console.log(`✅ Valid Delegation Chain: ${passRes.issuer} -> ${delegatorDid} -> ${requestorDid}`);
                    return { authorizedAs: delegatorDid };
                }
            }
        }
    }

    return { authorizedAs: null };
}
