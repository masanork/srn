import type { IPostalHub, PostalEnvelope, PostalResult, PostRole, PostalRule, PostalAction } from './types.js';
import type { IPostalStorage } from './storage/types.js';

/**
 * Web/A Postal Hub Implementation
 * Acts as the 'PBX' (Private Branch Exchange) and 'Intelligent Post Office' for Web/A identities.
 */
export class PostalHub implements IPostalHub {
    private rules: PostalRule[] = [];
    private roleMap: Map<string, PostRole> = new Map();

    constructor(private storage?: IPostalStorage) {
        // Default deny-all or safe-defaults can be set here
    }

    /**
     * Registers a known DID with a specific role.
     */
    registerDid(did: string, role: PostRole) {
        this.roleMap.set(did, role);
    }

    /**
     * Adds a processing rule to the hub.
     */
    addRule(rule: PostalRule) {
        this.rules.push(rule);
        this.rules.sort((a, b) => a.priority - b.priority); // Lower number = Higher priority
    }

    async resolveRole(did: string): Promise<PostRole> {
        return this.roleMap.get(did) || 'visitor';
    }

    /**
     * The main entry point for incoming messages.
     * Evaluates rules and executes actions.
     */
    async receive(envelope: PostalEnvelope): Promise<PostalResult> {
        console.log(`[PostalHub] Received envelope from ${envelope.senderDid} to ${envelope.recipientDid}`);

        // 1. Role Resolution
        const role = await this.resolveRole(envelope.senderDid);
        console.log(`[PostalHub] Identified role: ${role}`);

        // 2. Rule Evaluation
        for (const rule of this.rules) {
            try {
                if (await rule.condition(envelope)) {
                    console.log(`[PostalHub] Rule matched: ${rule.id}`);
                    return await this.executeAction(rule.action, envelope);
                }
            } catch (e) {
                console.error(`[PostalHub] Rule evaluation error`, e);
            }
        }

        // 3. Fallback (Default Action)
        return {
            accepted: false,
            message: "No matching rule found. Envelope rejected by default policy.",
            actionTaken: "reject"
        };
    }

    private async executeAction(action: PostalAction, envelope: PostalEnvelope): Promise<PostalResult> {
        switch (action.type) {
            case 'store':
                console.log(`[PostalHub] Storing envelope in folder: ${action.folder}`);
                if (this.storage) {
                    await this.storage.saveEnvelope(action.folder, envelope);
                }
                return { accepted: true, actionTaken: `stored:${action.folder}` };

            case 'forward':
                console.log(`[PostalHub] Forwarding envelope to: ${action.url}`);
                // TODO: Implement forwarding logic
                return { accepted: true, actionTaken: `forwarded:${action.url}` };

            case 'reject':
                console.log(`[PostalHub] Rejecting envelope: ${action.reason}`);
                return { accepted: false, message: action.reason, actionTaken: 'reject' };

            case 'auto-reply':
                console.log(`[PostalHub] Auto-replying: ${action.message}`);
                // TODO: Implement auto-reply sending logic
                return { accepted: true, message: action.message, actionTaken: 'auto-reply' };
        }
    }
}
