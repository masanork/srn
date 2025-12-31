import type { PostalEnvelope, PostalRule } from "../types.js";

/**
 * Interface for Web/A Post Persistance Layer.
 * Designed to support FileSystem (Local), D1 (Cloudflare), Firestore (Firebase), or PostgreSQL (Supabase).
 */
export interface IPostalStorage {
    /**
     * Saves an envelope to the persistence layer.
     * @param folder The folder name (e.g., "inbox", "sent", "spam")
     * @param envelope The envelope object
     */
    saveEnvelope(folder: string, envelope: PostalEnvelope): Promise<void>;

    /**
     * Retrieves envelopes from a specific folder.
     * @param folder The folder name
     * @param limit Max number of items
     * @param offset Pagination offset
     */
    getEnvelopes(folder: string, limit?: number, offset?: number): Promise<PostalEnvelope[]>;

    /**
     * Retrieves the active rules for a given DID.
     * @param did The DID of the mailbag owner (usually Admin)
     */
    getRules(did: string): Promise<PostalRule[]>;
}
