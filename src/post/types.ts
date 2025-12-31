/**
 * Web/A Post - Type Definitions
 * Based on: web-a-post-architecture.md
 */

export type PostRole = 'admin' | 'member' | 'guest' | 'visitor';

/**
 * Represents an incoming envelope in the Postal Hub.
 */
export interface PostalEnvelope {
    id: string;
    senderDid: string;
    recipientDid: string;
    receivedAt: string; // ISO8601
    headers: Record<string, string>;
    payload: unknown; // The actual L2 encrypted content or plaintext message
    signature?: string;
}

/**
 * A rule that dictates how the Post should respond or route a message.
 */
export interface PostalRule {
    id: string;
    priority: number;
    condition: (envelope: PostalEnvelope) => boolean | Promise<boolean>;
    action: PostalAction;
}

export type PostalAction =
    | { type: 'store', folder: string }
    | { type: 'forward', url: string }
    | { type: 'reject', reason: string }
    | { type: 'auto-reply', message: string };

/**
 * Interface for the Postal Hub (Digital Post Office).
 */
export interface IPostalHub {
    /**
     * Receives an envelope from the outside world.
     */
    receive(envelope: PostalEnvelope): Promise<PostalResult>;

    /**
     * Resolves the role of the sender based on DID and internal registry.
     */
    resolveRole(did: string): Promise<PostRole>;
}

export interface PostalResult {
    accepted: boolean;
    message?: string;
    actionTaken?: string;
}
