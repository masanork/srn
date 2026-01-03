import * as pkijs from "pkijs";
import * as asn1js from "asn1js";
import { getCrypto } from "pkijs";

// Set up crypto engine for Bun (Bun implements Web Crypto API globally as crypto)
const crypto = globalThis.crypto;
pkijs.setEngine("newEngine", crypto, new pkijs.CryptoEngine({ name: "", crypto: crypto as any, subtle: crypto.subtle as any }));

export async function getTimestamp(data: Uint8Array, tsaUrl: string): Promise<ArrayBuffer> {
    // 1. Calculate Hash of the data
    const hash = await crypto.subtle.digest("SHA-256", data);

    // 2. Create TimeStampReq
    const req = new pkijs.TimeStampReq({
        version: 1,
        messageImprint: new pkijs.MessageImprint({
            hashAlgorithm: new pkijs.AlgorithmIdentifier({
                algorithmId: "2.16.840.1.101.3.4.2.1" // SHA-256
            }),
            hashedMessage: new asn1js.OctetString({ valueHex: hash })
        }),
        nonce: new asn1js.Integer({ valueHex: crypto.getRandomValues(new Uint8Array(8)).buffer }),
        certReq: true
    });

    const reqBuffer = req.toSchema().toBER(false);

    // 3. Send Request to TSA
    const response = await fetch(tsaUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/timestamp-query"
        },
        body: reqBuffer
    });

    if (!response.ok) {
        throw new Error(`TSA Request Failed: ${response.status} ${response.statusText}`);
    }

    const respBuffer = await response.arrayBuffer();

    // 4. Validate Response (Basic Structure Check)
    const asn1 = asn1js.fromBER(respBuffer);
    if (asn1.offset === -1) {
        throw new Error("Failed to parse TSA response (ASN.1)");
    }

    const resp = new pkijs.TimeStampResp({ schema: asn1.result });
    
    // Check Status
    // pkijs 3.x+ simplifies simple types to primitives
    if (resp.status.status !== 0) {
        const failureInfo = resp.status.failInfo ? resp.status.failInfo.toString() : "No info";
        throw new Error(`TSA Error Status: ${resp.status.status} Info: ${failureInfo}`);
    }

    if (!resp.timeStampToken) {
        throw new Error("No TimeStampToken in response");
    }

    // Return the full raw response (for storage in Trust Store)
    return respBuffer;
}

export async function verifyTimestamp(respBuffer: ArrayBuffer, originalData: Uint8Array): Promise<Date> {
    const asn1 = asn1js.fromBER(respBuffer);
    const resp = new pkijs.TimeStampResp({ schema: asn1.result });

    if (!resp.timeStampToken) throw new Error("No token");

    const contentInfo = resp.timeStampToken;
    
    // Verify ContentType is SignedData (1.2.840.113549.1.7.2)
    if (contentInfo.contentType !== "1.2.840.113549.1.7.2") {
        throw new Error("Invalid ContentType in TimeStampToken: " + contentInfo.contentType);
    }

    // Parse the inner SignedData
    // contentInfo.content is the ASN.1 schema of SignedData
    const signedData = new pkijs.SignedData({ schema: contentInfo.content });
    
    // Extract TSTInfo (Encapsulated Content)
    const encapContent = signedData.encapContentInfo;
    if (encapContent.eContentType !== "1.2.840.113549.1.9.16.1.4") { // id-ct-TSTInfo
         throw new Error("Invalid EncapsulatedContentType: " + encapContent.eContentType);
    }

    const tstInfoOctet = encapContent.eContent;
    if (!(tstInfoOctet instanceof asn1js.OctetString)) {
         throw new Error("Unexpected TSTInfo content type");
    }
    
    // Parse TSTInfo
    const tstInfoAsn1 = asn1js.fromBER(tstInfoOctet.valueBlock.valueHexView);
    const tstInfoObj = new pkijs.TSTInfo({ schema: tstInfoAsn1.result });

    // Verify Hash
    const originalHash = await crypto.subtle.digest("SHA-256", originalData);
    const originalHashView = new Uint8Array(originalHash);
    const tokenHashView = new Uint8Array(tstInfoObj.messageImprint.hashedMessage.valueBlock.valueHexView);

    // Verify Algorithm (SHA-256)
    if (tstInfoObj.messageImprint.hashAlgorithm.algorithmId !== "2.16.840.1.101.3.4.2.1") {
         throw new Error("Unsupported hash algorithm in token: " + tstInfoObj.messageImprint.hashAlgorithm.algorithmId);
    }

    // Constant time compare? Or just simple compare for now.
    let match = true;
    if (originalHashView.length !== tokenHashView.length) match = false;
    else {
        for(let i=0; i<originalHashView.length; i++) {
            if(originalHashView[i] !== tokenHashView[i]) match = false;
        }
    }

    if (!match) throw new Error("Timestamp token hash mismatch");

    return tstInfoObj.genTime;
}
