import path from "node:path";
import * as fs from "fs-extra";

export interface TransportCapability {
    type: string;
    url: string;
    priority: number;
}

export interface ResolveResult {
    did: string;
    endpoints: TransportCapability[];
    document?: any;
}

/**
 * Resolves a DID (currently supports did:web) and extracts Web/A transport capabilities.
 */
export async function resolveTransport(did: string): Promise<ResolveResult> {
    if (!did.startsWith("did:web:")) {
        throw new Error(`Unsupported DID method: ${did}. Only did:web is supported in this prototype.`);
    }

    const url = didToUrl(did);
    console.error(`Fetching DID document from: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch DID document: ${response.statusText} (${response.status})`);
        }

        const doc = await response.json();
        const endpoints: TransportCapability[] = [];

        if (Array.isArray(doc.service)) {
            for (const service of doc.service) {
                if (service.type === "weba-reply" || service.type === "SoraneTransport") {
                    endpoints.push({
                        type: service.type,
                        url: typeof service.serviceEndpoint === "string"
                            ? service.serviceEndpoint
                            : (service.serviceEndpoint?.uri || service.serviceEndpoint?.[0]),
                        priority: service.priority ?? 10
                    });
                }
            }
        }

        // Sort by priority (lower is higher priority)
        endpoints.sort((a, b) => a.priority - b.priority);

        return {
            did,
            endpoints,
            document: doc
        };
    } catch (e: any) {
        throw new Error(`DID resolution failed for ${did}: ${e.message}`);
    }
}

function didToUrl(did: string): string {
    const parts = did.split(":");
    // parts[0] is "did", parts[1] is "web"
    const domain = parts[2];
    const pathParts = parts.slice(3);

    let baseUrl = `https://${domain}`;

    // Testing override for srn.example -> Local Emulator
    if (domain === "srn.example") {
        baseUrl = "http://127.0.0.1:5001/demo-weba/us-central1/didDocument";
    }

    if (pathParts.length === 0) {
        return `${baseUrl}/.well-known/did.json`;
    } else {
        return `${baseUrl}/${pathParts.join("/")}/did.json`;
    }
}
