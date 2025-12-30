import * as path from "node:path";
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
    implicit?: boolean;
}

/**
 * Resolves a DID (supports did:web and did:key) and extracts Web/A transport capabilities.
 */
export async function resolveTransport(did: string): Promise<ResolveResult> {
    // 1. Handle did:key (Implicit Resolution)
    if (did.startsWith("did:key:")) {
        // did:key typically doesn't have a service endpoint in the traditional sense
        // unless resolved via a universal resolver.
        // For Folio prototype, we treat did:key as valid but without explicit endpoints
        // unless we want to assume a default router/relay.
        // FOR NOW: Return implicit success so transport send doesn't block.
        // The actual endpoint usage depends on the caller knowing a relay/server URL (via --remote).
        return {
            did,
            endpoints: [], // No explicit endpoints in did:key string
            implicit: true
        };
    }

    if (!did.startsWith("did:web:")) {
        throw new Error(`Unsupported DID method: ${did}. Only did:web and did:key are supported.`);
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
        baseUrl = "http://localhost:5002";
    }

    if (pathParts.length === 0) {
        return `${baseUrl}/.well-known/did.json`;
    } else {
        return `${baseUrl}/${pathParts.join("/")}/did.json`;
    }
}
