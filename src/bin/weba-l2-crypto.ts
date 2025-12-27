import { Command } from "commander";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  generateRecipientKeyPair,
  generateUserKeyPair,
  signLayer2,
  encryptLayer2,
  decryptLayer2,
  verifyLayer2Signature,
  toBase64Url,
  fromBase64Url,
  Layer2Payload,
  Layer2Encrypted,
} from "../core/l2crypto.ts";

const program = new Command();

program
  .name("weba-l2-crypto")
  .description("Web/A Layer 2 Encryption & Signature PoC")
  .version("0.1.0");

program
  .command("gen-keys")
  .description("Generate recipient (encryption) and user (signing) keypairs")
  .option("-o, --out <dir>", "Output directory", "./keys")
  .action(async (options) => {
    const outDir = path.resolve(options.out);
    await fs.mkdir(outDir, { recursive: true });

    const recipient = generateRecipientKeyPair();
    const user = generateUserKeyPair();

    const recipientKey = {
      kid: "issuer#kem-2025",
      publicKey: toBase64Url(recipient.publicKey),
      privateKey: toBase64Url(recipient.privateKey),
    };

    const userKey = {
      kid: "user#sig-1",
      publicKey: toBase64Url(user.publicKey),
      privateKey: toBase64Url(user.privateKey),
    };

    await fs.writeFile(
      path.join(outDir, "issuer.json"),
      JSON.stringify(recipientKey, null, 2)
    );
    await fs.writeFile(
      path.join(outDir, "user.json"),
      JSON.stringify(userKey, null, 2)
    );

    console.log(`Keys generated in ${outDir}`);
  });

program
  .command("sign-and-encrypt")
  .description("Sign and encrypt Layer 2 data")
  .requiredOption("--layer1-ref <ref>", "Layer 1 reference (e.g. hash)")
  .requiredOption("--recipient-key <file>", "Recipient's public key JSON")
  .requiredOption("--user-key <file>", "User's private key JSON")
  .requiredOption("--in <file>", "Input Layer 2 plaintext JSON")
  .requiredOption("--out <file>", "Output envelope JSON")
  .action(async (options) => {
    const layer1Ref = options.layer1Ref;
    const recipientKey = JSON.parse(await fs.readFile(options.recipientKey, "utf-8"));
    const userKey = JSON.parse(await fs.readFile(options.userKey, "utf-8"));
    const plain = JSON.parse(await fs.readFile(options.in, "utf-8"));

    const payload: Layer2Payload = {
      layer2_plain: plain,
      layer2_sig: await signLayer2(
        plain,
        fromBase64Url(userKey.privateKey),
        userKey.kid
      ),
    };

    const envelope = await encryptLayer2(
      payload,
      fromBase64Url(recipientKey.publicKey),
      layer1Ref,
      recipientKey.kid
    );

    await fs.writeFile(options.out, JSON.stringify(envelope, null, 2));
    console.log(`Encrypted envelope saved to ${options.out}`);
  });

program
  .command("decrypt-and-verify")
  .description("Decrypt and verify Layer 2 envelope")
  .requiredOption("--recipient-key <file>", "Recipient's private key JSON")
  .requiredOption("--user-pubkey <file>", "User's public key JSON (for verification)")
  .requiredOption("--in <file>", "Input envelope JSON")
  .action(async (options) => {
    const recipientKey = JSON.parse(await fs.readFile(options.recipientKey, "utf-8"));
    const userKey = JSON.parse(await fs.readFile(options.userPubkey, "utf-8"));
    const envelope: Layer2Encrypted = JSON.parse(await fs.readFile(options.in, "utf-8"));

    const payload = await decryptLayer2(
      envelope,
      fromBase64Url(recipientKey.privateKey)
    );

    const isValid = verifyLayer2Signature(
      payload,
      fromBase64Url(userKey.publicKey)
    );

    if (isValid) {
      console.log("Signature: VALID");
      console.log("Payload:", JSON.stringify(payload.layer2_plain, null, 2));
    } else {
      console.error("Signature: INVALID");
      process.exit(1);
    }
  });

program.parse();
