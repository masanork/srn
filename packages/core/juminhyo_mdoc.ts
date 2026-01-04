import {
    createMDoc,
    p256GenerateKeyPair,
    bytesToHex,
    initWasm
} from './src/index';

import { decode } from 'cbor-x';

// Exported function for external usage (e.g. from demo_cbor_renderer.ts)
export async function createMDocFromJuminhyo(docData: any, issuerKeys: any, issuerDid: string) {
    const fullClaims: Record<string, any> = { ...docData };

    // Remove members from top level to replace with flattened ones
    if (fullClaims.members) {
        delete fullClaims.members;
    }

    // Flatten members
    // Check if docData has members array
    if (docData.members && Array.isArray(docData.members)) {
        docData.members.forEach((m: any, idx: number) => {
            flatten(`member_${idx}_`, m, fullClaims);
        });
    }

    // Sort for determinism
    const sortedKeys = Object.keys(fullClaims).sort();
    const sortedClaims: Record<string, any> = {};
    sortedKeys.forEach(k => sortedClaims[k] = fullClaims[k]);

    // Use a fixed device key for this utility or allow passing one
    // For PoC generation, we just need the mDoc structure.
    // The deviceKeyHex is for MSO.
    const tempDeviceKeyPair = p256GenerateKeyPair();
    const deviceKeyHex = bytesToHex(tempDeviceKeyPair.publicKey);

    // Call internal createMDoc
    // Note: createMDoc returns { mdoc (Uint8Array), b64url (string) }
    // We want the raw CBOR structure (Doc object) to inspect or re-encode?
    // createMDoc in mdoc.ts returns { mdoc: Uint8Array }.
    // BUT we need the JS Object structure of mDoc to encode it using cbor-x in the caller?
    // Actually, createMDoc returns the binary. 
    // If the caller needs the Object, they have to decode it.

    // Wait, mdoc.ts/createMDoc returns the BINARY (Uint8Array).
    // In demo_cbor_renderer.ts, I wrote:
    // const { mDoc } = await createMDocFromJuminhyo(...)
    // const mDocBytes = encode(mDoc);
    //
    // If createMDoc returns Uint8Array, then mDocBytes = encode(Uint8Array) which wraps it in a byte string. Not what we want.
    // We want the 'Documents' array object.

    // Let's check mdoc.ts return type. It calls `encode(mDocStructure)`.
    // So it returns bytes.
    // For demo_cbor_renderer, we can just take the bytes and base64 them.
    // So createMDocFromJuminhyo should return the bytes.

    const { mdoc } = await createMDoc(
        sortedClaims,
        issuerKeys,
        deviceKeyHex,
        "jp.co.tobari.juminhyo", // Use a consistent namespace
        "jp.co.tobari.juminhyo"  // DocType
    );

    // We decode it back to Object to let the caller handle encoding if they want, 
    // OR just return the bytes.
    // The caller (demo_cbor_renderer) does: `const mDocBytes = encode(mDoc);` 
    // which implies it expects an Object.
    // Let's return the Object by decoding the binary we just made.
    const mDocObj = decode(mdoc);
    return { mDoc: mDocObj };
}

// Helper to flatten object
function flatten(prefix: string, obj: any, target: any) {
    for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) {
            // Check if array of primitives (like honseki) or objects
            if (v.length > 0 && typeof v[0] === 'string') {
                target[`${prefix}${k}`] = v; // Keep primitive arrays as one item (or flatten indices)
            } else {
                // Ignore complex arrays for this simple flattener if not handled
            }
        } else if (typeof v === 'object' && v !== null) {
            flatten(`${prefix}${k}_`, v, target);
        } else {
            target[`${prefix}${k}`] = v;
        }
    }
}

// Original Juminhyo Data (Japanese keys)
const juminhyoData = {
    title: "（見本）住民票の写し（世帯連記式）",
    // ... (rest of the static data if needed for main execution)
};
const members = [ /* ... */]; // Placeholder, not used if main is removed or simplified.

// Existing main function for standalone run (kept for backward compat but commented out or simplified)
async function main() {
    // ... legacy code ...
}

if (import.meta.main) {
    // Optional: Restore original behavior if needed, or leave empty
}

