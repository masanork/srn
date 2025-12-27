import fs from "node:fs";
import path from "node:path";
import {
  buildLayer2Payload,
  decryptLayer2Envelope,
  encryptLayer2Payload,
  generateRecipientKeys,
  signLayer2Plain,
  verifyPayloadSignature,
  type Layer2Encrypted,
  type RecipientKeyFile,
} from "./weba_l2crypto";

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getOption(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function requireOption(args: string[], name: string): string {
  const value = getOption(args, name);
  if (!value) {
    throw new Error(`Missing required option: ${name}`);
  }
  return value;
}

function printHelp() {
  const help = `Usage:
  bun src/cli.ts --help
  bun src/cli.ts generate-keys --out keys/ [--recipient issuer#kem-2025] [--user-kid user#sig-1] [--pqc]
  bun src/cli.ts sign-and-encrypt --layer1-ref sha256:... --recipient issuer#kem-2025 --keys keys/issuer.json --in layer2.json --out envelope.json
  bun src/cli.ts decrypt-and-verify --keys keys/issuer.json --in envelope.json
`;
  console.log(help);
}

function runGenerateKeys(args: string[]) {
  const outDir = requireOption(args, "--out");
  const recipientKid = getOption(args, "--recipient") ?? "issuer#kem-2025";
  const userKid = getOption(args, "--user-kid") ?? "user#sig-1";
  const usePqc = hasFlag(args, "--pqc");

  const keys = generateRecipientKeys({ recipientKid, usePqc });
  keys.user_sig.kid = userKid;

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "issuer.json");
  writeJson(outPath, keys);
  console.log(`Wrote keys to ${outPath}`);
}

function runSignAndEncrypt(args: string[]) {
  const layer1Ref = requireOption(args, "--layer1-ref");
  const recipient = requireOption(args, "--recipient");
  const keysPath = requireOption(args, "--keys");
  const inputPath = requireOption(args, "--in");
  const outPath = requireOption(args, "--out");

  const keys = readJson<RecipientKeyFile>(keysPath);
  if (keys.recipient_kid !== recipient) {
    throw new Error(`Recipient kid mismatch: keys=${keys.recipient_kid} arg=${recipient}`);
  }

  const layer2Plain = readJson<unknown>(inputPath);
  const userSig = signLayer2Plain(layer2Plain, keys.user_sig);
  const payload = buildLayer2Payload(layer2Plain, userSig);

  const usePqc = keys.pqc?.available && keys.pqc.public_key;
  const envelope = encryptLayer2Payload({
    layer1_ref: layer1Ref,
    recipient_kid: recipient,
    payload,
    recipient_public_jwk: keys.x25519.public_jwk,
    pqc_public_key: usePqc ? keys.pqc?.public_key : undefined,
  });

  writeJson(outPath, envelope);
  console.log(`Wrote envelope to ${outPath}`);
}

function runDecryptAndVerify(args: string[]) {
  const keysPath = requireOption(args, "--keys");
  const inputPath = requireOption(args, "--in");

  const keys = readJson<RecipientKeyFile>(keysPath);
  const envelope = readJson<Layer2Encrypted>(inputPath);
  const { payload } = decryptLayer2Envelope({ envelope, recipient_keys: keys });
  const verification = verifyPayloadSignature(payload, keys.user_sig.public_jwk);

  const output = {
    payload,
    signature: verification,
  };
  console.log(JSON.stringify(output, null, 2));

  if (!verification.ok) {
    process.exitCode = 1;
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  switch (command) {
    case "generate-keys":
      runGenerateKeys(args);
      return;
    case "sign-and-encrypt":
      runSignAndEncrypt(args);
      return;
    case "decrypt-and-verify":
      runDecryptAndVerify(args);
      return;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main();
