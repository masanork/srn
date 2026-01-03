import { describe, expect, test } from "bun:test";
import { getTimestamp, verifyTimestamp } from "../src/tools/tsa_client.ts";

describe("TSA Client Integration", () => {
    // Public free TSA servers
    const TSA_URL = "http://timestamp.digicert.com";
    // Alternative: "http://timestamp.entrust.net/TSS/RFC3161sha2TS"

    test("should fetch a valid timestamp token from DigiCert", async () => {
        const data = new TextEncoder().encode("Hello Web/A LTV " + Date.now());
        
        try {
            console.log(`Requesting timestamp from ${TSA_URL}...`);
            const tokenBuffer = await getTimestamp(data, TSA_URL);
            
            expect(tokenBuffer).toBeDefined();
            expect(tokenBuffer.byteLength).toBeGreaterThan(0);
            console.log(`Received token: ${tokenBuffer.byteLength} bytes`);

            const time = await verifyTimestamp(tokenBuffer, data);
            console.log(`Verified Timestamp: ${time.toISOString()}`);

            // Check if time is recent (within last 5 minutes)
            const now = new Date();
            const diff = Math.abs(now.getTime() - time.getTime());
            expect(diff).toBeLessThan(5 * 60 * 1000); // 5 minutes

        } catch (e: any) {
            console.warn("TSA Test Failed (Network issue?):", e);
            // If it's a network timeout, we might want to soft-fail or skip
            // But for now, let's see the error.
            // If running in an offline environment, this will fail.
            if (e.message.includes("fetch")) {
                console.log("Skipping test due to network failure");
                return;
            }
            throw e;
        }
    }, 15000); // 15s timeout
});
