import canonicalize from 'canonicalize';
import { sha256Hash } from './wasm_core.js';
import { bytesToHex } from './encoding.js';

export type PHCEventType =
    | 'Genesis'
    | 'L4Rebuild'
    | 'Transfer'
    | 'MetadataUpdate'
    | 'Verification';

export interface PHCEvent {
    type: PHCEventType;
    timestamp: string;
    payload: any;
}

export interface PHCLink {
    prevHash: string | null; // null for Genesis
    event: PHCEvent;
    eventHash: string; // SHA-256 of canonicalized event
    chainHash: string; // SHA-256 of (prevHash + eventHash)
}

/**
 * Prunable Hash Chain (PHC) Implementation for Layer 3 (Context).
 * Ensures auditability and long-term validity of Web/A containers.
 */
export class PrunableHashChain {
    private links: PHCLink[] = [];

    constructor(links: PHCLink[] = []) {
        this.links = links;
    }

    /**
     * Appends a new event to the chain.
     */
    async append(type: PHCEventType, payload: any): Promise<PHCLink> {
        const prevLink = this.links.length > 0 ? this.links[this.links.length - 1] : null;
        const prevHash = prevLink ? prevLink.chainHash : null;

        const event: PHCEvent = {
            type,
            timestamp: new Date().toISOString(),
            payload
        };

        const eventJson = canonicalize(event);
        if (!eventJson) throw new Error('Failed to canonicalize event');

        const eventHash = bytesToHex(sha256Hash(new TextEncoder().encode(eventJson)));

        // Chain hash = SHA-256(prevHash + eventHash)
        const chainInput = (prevHash || '') + eventHash;
        const chainHash = bytesToHex(sha256Hash(new TextEncoder().encode(chainInput)));

        const link: PHCLink = {
            prevHash,
            event,
            eventHash,
            chainHash
        };

        this.links.push(link);
        return link;
    }

    /**
     * Verifies the entire chain integrity.
     */
    verify(): boolean {
        for (let i = 0; i < this.links.length; i++) {
            const link = this.links[i]!;
            const prevLink = i > 0 ? this.links[i - 1] : null;
            const expectedPrevHash = prevLink ? prevLink.chainHash : null;

            // 1. Check continuity
            if (link.prevHash !== expectedPrevHash) return false;

            // 2. Check content integrity (ONLY if not pruned)
            const isPruned = (link.event as any).pruned === true;
            if (!isPruned) {
                const eventJson = canonicalize(link.event);
                if (!eventJson) return false;
                const eventHash = bytesToHex(sha256Hash(new TextEncoder().encode(eventJson)));
                if (link.eventHash !== eventHash) return false;
            }

            // 3. Check chain hash integrity
            const chainInput = (link.prevHash || '') + link.eventHash;
            const chainHash = bytesToHex(sha256Hash(new TextEncoder().encode(chainInput)));
            if (link.chainHash !== chainHash) return false;
        }
        return true;
    }

    /**
     * Returns all links in the chain.
     */
    getLinks(): PHCLink[] {
        return [...this.links];
    }

    /**
     * Prunes the chain by removing intermediate event bodies while keeping hashes.
     * This preserves the audit trail without bloating the container.
     */
    prune(keepIndices: number[]): void {
        const indices = new Set(keepIndices);
        // Always keep the Genesis (0) and the Latest (length-1) if not specified? 
        // For now, respect the indices provided.

        this.links = this.links.map((link, idx) => {
            if (indices.has(idx)) return link;

            // Prune the event body but keep hashes
            return {
                ...link,
                event: {
                    ...link.event,
                    payload: undefined, // Pruned
                    pruned: true
                } as any
            };
        });
    }

    /**
     * Serializes the chain to JSON.
     */
    toJSON(): PHCLink[] {
        return this.links;
    }

    /**
     * Deserializes the chain from JSON.
     */
    static fromJSON(data: any): PrunableHashChain {
        if (!Array.isArray(data)) throw new Error('PHC must be an array');
        return new PrunableHashChain(data);
    }
}
