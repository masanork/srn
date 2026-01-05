
import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs-extra";
import * as path from "node:path";
import { spawn } from "bun";

const CLI_PATH = path.resolve(__dirname, "../src/folio/cli.ts");
const TEST_DIR = path.resolve(__dirname, "./temp_folio_cli_test");
const KEYS_DIR = path.join(TEST_DIR, "keys");

async function runCli(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const proc = spawn(["bun", CLI_PATH, ...args], {
        cwd: process.cwd(),
        env: { ...process.env, PATH: process.env.PATH },
        stdin: null,
        stdout: "pipe",
        stderr: "pipe",
    });

    const [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited
    ]);



    return { stdout, stderr, exitCode };
}

describe("Folio CLI Integration Tests", () => {
    beforeAll(async () => {
        await fs.ensureDir(TEST_DIR);
    });

    afterAll(async () => {
        await fs.remove(TEST_DIR);
    });

    test("did create: should create a new DID and output keys", async () => {
        const { stdout, stderr, exitCode } = await runCli(["did", "create"]);
        if (exitCode !== 0) console.error("CLI Error:", stderr);
        expect(exitCode).toBe(0);
        expect(stdout).toContain("DID: did:key:z");
        expect(stdout).toContain("Algorithm: Ed25519");
    });

    test("did create --save: should create and save a key file", async () => {
        const alias = "test-identity";
        const { stdout, exitCode } = await runCli([
            "did",
            "create",
            "--save",
            alias,
            "--folio",
            TEST_DIR
        ]);

        expect(exitCode).toBe(0);
        expect(stdout).toContain(`Key saved to`);

        const keyFile = path.join(KEYS_DIR, `${alias}.json`);
        expect(await fs.pathExists(keyFile)).toBe(true);

        const keyData = await fs.readJson(keyFile);
        expect(keyData).toHaveProperty("did");
        expect(keyData).toHaveProperty("privateKey");
        expect(keyData.did).toStartWith("did:key:");
        expect(keyData.method).toBe("key");
    });

    test("did resolve: should resolve a did:key", async () => {
        // First create a DID to resolve
        const createRes = await runCli(["did", "create"]);
        const didMatch = createRes.stdout.match(/DID: (did:key:\w+)/);
        if (!didMatch || !didMatch[1]) throw new Error("Failed to extract DID from create output");
        const did = didMatch[1];

        const { stdout, exitCode } = await runCli(["did", "resolve", did]);
        expect(exitCode).toBe(0);

        const doc = JSON.parse(stdout);
        expect(doc.id).toBe(did);
        expect(doc.verificationMethod).toBeArray();
        expect(doc.verificationMethod[0].controller).toBe(did);
    });

    test("transport send: should fail gracefully with missing key", async () => {
        const { stderr, exitCode } = await runCli([
            "transport",
            "send",
            "--did", "did:web:example.com",
            "--message", "hello",
            "--sender", "did:key:z123"
        ]);
        expect(exitCode).toBe(1);
        expect(stderr).toContain("Either --key or --key-file must be provided");
    });

    test("transport send: should accept --key-file", async () => {
        // 1. Create a key file
        const alias = "sender-id";
        await runCli(["did", "create", "--save", alias, "--folio", TEST_DIR]);
        const keyFilePath = path.join(KEYS_DIR, `${alias}.json`);
        const keyData = await fs.readJson(keyFilePath);

        // 2. Try to send (it will likely fail on network/mock, but should pass key validation)
        // We expect it to try sending and fail at network layer or mock layer,
        // but NOT fail with "Either --key or --key-file must be provided"
        // Since we don't have a mocked network for the CLI process, we expect an error,
        // but we verify the error message is about network/resolution, not missing keys.

        const { stderr, exitCode } = await runCli([
            "transport",
            "send",
            "--did", "did:web:example.com", // Will fail resolution
            "--message", "hello",
            "--sender", keyData.did,
            "--key-file", keyFilePath
        ]);

        expect(exitCode).toBe(1);
        // It should try to resolve the recipient DID and fail there
        expect(stderr).not.toContain("Either --key or --key-file must be provided");
        expect(stderr).toSatisfy((msg: string) =>
            msg.includes("DID resolution failed") ||
            msg.includes("fetch failed") ||
            msg.includes("Unsupported DID method")
        );
    });

    test("transport send: should validate key-file content", async () => {
        const badKeyFile = path.join(TEST_DIR, "bad-key.json");
        await fs.writeJson(badKeyFile, { foo: "bar" }); // Missing privateKey

        const { stderr, exitCode } = await runCli([
            "transport",
            "send",
            "--did", "did:web:example.com",
            "--message", "hello",
            "--sender", "did:key:z123",
            "--key-file", badKeyFile
        ]);

        expect(exitCode).toBe(1);
        expect(stderr).toContain("Key file does not contain 'privateKey' field");
    });

    test("admin add-user: should validate missing keys", async () => {
        const { stderr, exitCode } = await runCli([
            "admin",
            "add-user",
            "--new-did", "did:key:zUser...",
            "--admin-did", "did:key:zAdmin...",
            "--remote", "http://localhost:5002/api"
        ]);
        expect(exitCode).toBe(1);
        expect(stderr).toContain("Either --key or --key-file must be provided");
    });

    test("admin add-user: should validate key-file", async () => {
        const alias = "admin-id";
        await runCli(["did", "create", "--save", alias, "--folio", TEST_DIR]);
        const keyFilePath = path.join(KEYS_DIR, `${alias}.json`);

        // Run command (expected to fail at network, but pass key check)
        const { stderr, exitCode } = await runCli([
            "admin",
            "add-user",
            "--new-did", "did:key:zUser...",
            "--admin-did", "did:key:zAdmin...", // In real flow, this should match key's DID
            "--key-file", keyFilePath,
            "--remote", "http://localhost:5002/api"
        ]);

        expect(exitCode).toBe(1);
        // Error should be network related, NOT missing key
        expect(stderr).not.toContain("Either --key or --key-file must be provided");
        expect(stderr).toSatisfy((msg: string) =>
            msg.includes("fetch failed") ||
            msg.includes("Network request failed") ||
            msg.includes("Unable to connect")
        );
    });
});
