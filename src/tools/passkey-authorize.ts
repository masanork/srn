import { generateHybridKeys, createDelegateCertificate } from '../vc.ts';
import path from 'path';
import fs from 'fs-extra';
import { loadConfig, getAbsolutePaths } from '../config.ts';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';

/**
 * PassKey Authorization Tool (PoC)
 * 1. Generates ephemeral build keys.
 * 2. Simulates PassKey Root Identity (for this CLI tool, we use a local P-256 key if no PassKey exists).
 * 3. In a real production tool, this would trigger a Browser WebAuthn ceremony.
 */

async function run() {
    const siteArg = process.argv.indexOf('--site');
    const siteName = siteArg !== -1 ? process.argv[siteArg + 1] : null;

    if (!siteName) {
        console.error("Usage: bun run src/tools/passkey-authorize.ts --site <site-name>");
        process.exit(1);
    }

    const config = await loadConfig();
    const { DATA_DIR } = getAbsolutePaths(config);
    await fs.ensureDir(DATA_DIR);

    const SITE_DOMAIN = config.identity.domain;
    const SITE_PATH = config.identity.path;
    const SITE_DID = `did:web:${SITE_DOMAIN}${SITE_PATH.replace(/\//g, ':')}`;

    console.log(`🔐 Authorizing build for site: ${siteName} (${SITE_DID})`);

    // 1. Root Identity Management (Simulation)
    // In a real app, the private key of the Root Identity is NOT on disk, it's in the PassKey hardware.
    // For this PoC to be runnable without a browser session in a terminal environment,
    // we use a "Root Key File" if it exists, or create one.
    // NOTE: This represents the "Master Identity" that would be in your YubiKey/TouchID.
    const rootIdentityPath = path.join(DATA_DIR, 'root-identity.json');
    let rootKeys: any;

    if (await fs.pathExists(rootIdentityPath)) {
        rootKeys = await fs.readJson(rootIdentityPath);
        console.log("  Using existing Root Identity.");
    } else {
        // Generate a new Root Identity (Hybrid: P-256 + PQC)
        // We use P-256 here to match PassKey compatibility
        rootKeys = generateHybridKeys();
        await fs.writeJson(rootIdentityPath, rootKeys, { spaces: 2 });
        console.log("  Generated NEW Root Identity (represents your PassKey/Master Key).");
    }

    // 2. Generate Ephemeral Build Keys
    const buildKeys = generateHybridKeys();
    const buildKeysPath = path.join(DATA_DIR, 'delegate-key.json');

    // 3. Mode Selection
    if (process.argv.includes('--browser')) {
        await startWebAuthnServer(siteName, buildKeys, rootKeys, buildKeysPath, SITE_DID);
    } else {
        // ... existing CLI simulation ...
        console.log("  Signing Delegate Certificate (CLI Simulation)...");
        const delegateCert = await createDelegateCertificate(
            buildKeys,
            rootKeys,
            SITE_DID,
            7
        );

        const result = { buildKeys, delegateCertificate: delegateCert };
        await fs.writeJson(buildKeysPath, result, { spaces: 2 });
        console.log(`✅ Authorization successful!`);
        console.log(`   Delegate Certificate saved to: ${buildKeysPath}`);
        console.log(`   You can now run 'bun run build --site ${siteName}' and it will use this authorized key.`);
    }
}

async function startWebAuthnServer(siteName: string, buildKeys: any, rootKeys: any, buildKeysPath: string, SITE_DID: string) {
    const port = 3000;
    const challenge = crypto.randomBytes(32).toString('base64');

    console.log(`🌍 Starting WebAuthn Server on http://localhost:${port}`);

    const server = Bun.serve({
        port,
        async fetch(req) {
            const url = new URL(req.url);

            if (url.pathname === '/') {
                const html = await Bun.file(path.join(import.meta.dir, 'webauthn.html')).text();
                return new Response(html, { headers: { 'Content-Type': 'text/html' } });
            }

            if (url.pathname === '/session') {
                return Response.json({
                    challenge,
                    credentialId: rootKeys.p256_id || btoa('dummy-id') // Simulation
                });
            }

            if (url.pathname === '/authorize' && req.method === 'POST') {
                const body = await req.json();
                console.log("  Received WebAuthn signature from browser.");

                // In a real implementation:
                // 1. Verify body.response.signature matches rootKeys.p256.publicKey
                // 2. Over [authenticatorData + sha256(clientDataJSON)]

                // For this PoC, we assume success if the browser reached here
                const delegateCert = await createDelegateCertificate(
                    buildKeys,
                    rootKeys,
                    SITE_DID,
                    7
                );

                const result = { buildKeys, delegateCertificate: delegateCert };
                await fs.writeJson(buildKeysPath, result, { spaces: 2 });

                setTimeout(() => {
                    console.log("✅ Build authorized via browser! Stopping server.");
                    server.stop();
                }, 1000);

                return Response.json(delegateCert);
            }

            return new Response("Not Found", { status: 404 });
        }
    });

    console.log(`🚀 Opening browser...`);
    exec(`open http://localhost:${port}`);
}

run().catch(console.error);
