import { describe, it, expect, beforeAll } from 'bun:test';
import { PrunableHashChain } from '../src/core/phc';
import { initWasm } from '../src/core/wasm_core';

describe('Prunable Hash Chain (PHC)', () => {
    beforeAll(async () => {
        await initWasm();
    });

    it('should create a genesis block and follow hash chain', async () => {
        const phc = new PrunableHashChain();

        // 1. Genesis
        const link0 = await phc.append('Genesis', { docId: 'did:web:example.com:doc1' });
        expect(link0.prevHash).toBeNull();
        expect(link0.event.type).toBe('Genesis');

        // 2. Metadata Update
        const link1 = await phc.append('MetadataUpdate', { tags: ['draft', 'vision'] });
        expect(link1.prevHash).toBe(link0.chainHash);
        expect(link1.event.type).toBe('MetadataUpdate');

        // 3. Verification
        expect(phc.verify()).toBe(true);
    });

    it('should detect tampering in the chain', async () => {
        const phc = new PrunableHashChain();
        await phc.append('Genesis', { data: 'orig' });
        await phc.append('MetadataUpdate', { data: 'update' });

        expect(phc.verify()).toBe(true);

        // Tamper with an event
        const links = phc.getLinks();
        links[0]!.event.payload.data = 'tampered';

        expect(phc.verify()).toBe(false);
    });

    it('should support pruning while maintaining verification', async () => {
        const phc = new PrunableHashChain();
        await phc.append('Genesis', { secret: 'genesis_data' });
        await phc.append('MetadataUpdate', { secret: 'intermediate_data' });
        const last = await phc.append('L4Rebuild', { public: 'final_info' });

        expect(phc.verify()).toBe(true);

        // Prune the intermediate block (index 1)
        phc.prune([0, 2]); // Keep Genesis and Final

        const links = phc.getLinks();
        expect(links[1]!.event.payload).toBeUndefined();
        expect((links[1]!.event as any).pruned).toBe(true);

        // Verification should still pass because hashes are unchanged
        expect(phc.verify()).toBe(true);
    });

    it('should roundtrip through JSON', async () => {
        const phc = new PrunableHashChain();
        await phc.append('Genesis', { a: 1 });
        await phc.append('MetadataUpdate', { b: 2 });

        const json = phc.toJSON();
        const phc2 = PrunableHashChain.fromJSON(json);

        expect(phc2.verify()).toBe(true);
        expect(phc2.getLinks().length).toBe(2);
        expect(phc2.getLinks()[1]!.event.payload.b).toBe(2);
    });
});
