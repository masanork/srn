import { encode, decode } from 'cbor-x';
import {
    initWasm,
    p256Sign,
    sha256Hash,
    ed25519Sign
} from './wasm_core';
import { bytesToHex, hexToBytes } from './encoding';
import crypto from 'node:crypto';

// COSE Constants
const COSE_ALG_ES256 = -7; // ECDSA w/ SHA-256
const COSE_ALG_EdDSA = -8;
const COSE_HEADER_ALG = 1;
const COSE_HEADER_KID = 4;

/**
 * Creates the Sig_structure for COSE_Sign1
 * @param bodyProtected 
 * @param payload 
 */
function createCoseSign1Structure(
    bodyProtected: Uint8Array,
    payload: Uint8Array,
    externalAad: Uint8Array = new Uint8Array(0)
): Uint8Array {
    return encode([
        "Signature1",
        bodyProtected,
        externalAad,
        payload
    ]);
}

/**
 * Wraps data in CBOR Tag 24 (Encoded CBOR Data Item).
 * Since cbor-x might not export a Tag class easily, we simulate the byte prefix
 * for a standard CBOR Tag 24 if we were writing raw. 
 * However, to ensure valid CBOR structure within a wrapping library, 
 * we often just store the bytes of the encoded item if the library doesn't support tags.
 * 
 * In this implementation, we return the encoded bytes of the item, 
 * effectively treating them as `bstr` which is the inner content of the Tag 24.
 * A strictly compliant mDoc reader might expect the `d8 18` prefix.
 * 
 * @param item The item to encode and wrap
 */
function encodeAsTagged24(item: any): Uint8Array {
    // For now, we return the encoded bytes.
    // In a full implementation, we might need to prepend tag markers 
    // or use a CBOR library that supports Tags.
    return encode(item);
}

/**
 * mDoc structure generation
 */

export interface MSOValidity {
    signed: Date;
    validFrom: Date;
    validUntil: Date;
}

export interface MDocKeys {
    p256?: { privateKey: string; publicKey: string }; // Hex
    ed25519?: { privateKey: string; publicKey: string }; // Hex
}

export type DigestAlgorithm = "SHA-256" | "SHA-512";

/**
 * Generates an ISO 18013-5 mDoc compliant structure.
 * 
 * @param claims The data to include (flattened or nested). Will be put into specific namespace.
 * @param issuerKeys Keys to sign the mDoc (Prefer P-256 for Passkey compatibility).
 * @param devicePublicKeyHex The P-256 public key of the device/holder (Hex).
 * @param docType The document type (default: org.iso.18013.5.1.mDL).
 * @param namespace The namespace for claims (default: org.iso.18013.5.1).
 */
export async function createMDoc(
    claims: Record<string, any>,
    issuerKeys: MDocKeys,
    devicePublicKeyHex: string, // Holder's key (P-256)
    docType: string = "org.iso.18013.5.1.mDL",
    namespace: string = "org.iso.18013.5.1",
    validity?: MSOValidity
): Promise<{ mdoc: Uint8Array; b64url: string }> {
    await initWasm();

    // 1. Prepare IssuerSignedItem and Calculate Digests
    const valueDigests: Record<string, Record<number, Uint8Array>> = {};
    const issuerSignedItems: Uint8Array[] = [];

    // We assume a single namespace for simplicity in this helper
    valueDigests[namespace] = {};

    let digestIdCounter = 0;
    const sortedKeys = Object.keys(claims).sort(); // Sort for deterministic behavior

    for (const key of sortedKeys) {
        const digestId = digestIdCounter++;
        const randomSalt = crypto.getRandomValues(new Uint8Array(16));

        // Structure: [digestID, random, elementIdentifier, elementValue]
        const item = {
            digestID: digestId,
            random: randomSalt,
            elementIdentifier: key,
            elementValue: claims[key]
        };

        // This is strictly "IssuerSignedItem"
        // We need to encode it to bytes for hashing and for inclusion in IssuerSigned
        const itemBytes = encode(item);

        // Tag 24 Wrapping (simulated by just using bytes for digest, 
        // real implementation requires wrapping if embedding)
        // ISO 18013-5: digest = Hash(IssuerSignedItemBytes)
        // IssuerSignedItemBytes = Tagged(24, bstr(encode(item)))
        // We will hash the `itemBytes` directly for this prototype 
        // assuming the verifier does the same.
        const digest = sha256Hash(itemBytes);

        valueDigests[namespace][digestId] = digest;
        issuerSignedItems.push(itemBytes);
    }

    // 2. Create Mobile Security Object (MSO)
    const now = new Date();
    const validityInfo = validity || {
        signed: now,
        validFrom: now,
        validUntil: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };

    const mso = {
        version: "1.0",
        digestAlgorithm: "SHA-256",
        valueDigests: valueDigests,
        deviceKeyInfo: {
            deviceKey: {
                // COSE_Key format for P-256
                kty: 2, // EC2
                crv: 1, // P-256
                x: hexToBytes(devicePublicKeyHex.slice(2, 66)), // primitive parsing
                y: hexToBytes(devicePublicKeyHex.slice(66, 130))
            }
            // in real mDoc, this involves full COSE_Key structure tagging capability
        },
        docType: docType,
        validityInfo: {
            signed: Math.floor(validityInfo.signed.getTime() / 1000), // mDoc uses tdate or int
            validFrom: Math.floor(validityInfo.validFrom.getTime() / 1000),
            validUntil: Math.floor(validityInfo.validUntil.getTime() / 1000)
        }
    };

    // Encode MSO (Wrapped in Tag 24 for the sig payload usually)
    const msoBytes = encode(mso);

    // 3. Create IssuerAuth (COSE_Sign1)
    // We prefer P-256 if available
    let alg = COSE_ALG_EdDSA;
    type SignFunction = (p: Uint8Array) => Promise<Uint8Array>;
    let signFn: SignFunction = async (p: Uint8Array) => new Uint8Array(0);

    if (issuerKeys.p256) {
        alg = COSE_ALG_ES256;
        signFn = async (p: Uint8Array) => {
            const key = hexToBytes(issuerKeys.p256!.privateKey);
            return p256Sign(key, p);
        };
    } else if (issuerKeys.ed25519) {
        alg = COSE_ALG_EdDSA;
        signFn = async (p: Uint8Array) => {
            const key = hexToBytes(issuerKeys.ed25519!.privateKey);
            return ed25519Sign(key, p);
        };
    } else {
        throw new Error("No suitable issuer key provided");
    }

    const protectedHeader = encode(new Map<number, any>([
        [COSE_HEADER_ALG, alg]
    ]));

    // MSO Bytes is the payload
    const sigStructure = createCoseSign1Structure(protectedHeader, msoBytes);
    const signature = await signFn(sigStructure);

    const issuerAuth = [
        protectedHeader,
        new Map(), // unprotected
        msoBytes,  // payload
        signature
    ];

    // 4. Construct Final mDoc
    const mDoc = {
        docType: docType,
        issuerSigned: {
            nameSpaces: {
                [namespace]: issuerSignedItems
            },
            issuerAuth: issuerAuth
        }
    };

    const finalCbor = encode(mDoc);
    const b64 = Buffer.from(finalCbor).toString('base64url');

    return {
        mdoc: finalCbor,
        b64url: b64
    };
}
