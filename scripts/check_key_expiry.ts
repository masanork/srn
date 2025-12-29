import * as fs from "fs";
import * as path from "path";

// Usage: bun scripts/check_key_expiry.ts --file ./keys/epoch-public.json --threshold 30

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
};

const filePath = getArg("--file");
const thresholdStr = getArg("--threshold") || "30";

if (!filePath) {
  console.error("Usage: check_key_expiry.ts --file <path> [--threshold <days>]");
  process.exit(1);
}

const thresholdDays = parseInt(thresholdStr, 10);

try {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: Key registry file not found at ${absolutePath}`);
    // If the file doesn't exist yet, that's a critical "expiry" (0 days left)
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  const registry = JSON.parse(content);

  if (!registry.keys || !Array.isArray(registry.keys) || registry.keys.length === 0) {
    console.error("Error: Registry is empty or invalid.");
    process.exit(1);
  }

  // Find the latest validUntil date
  // Keys are usually sorted, but let's be safe
  let maxDate = new Date(0);
  for (const k of registry.keys) {
    const end = new Date(k.validUntil);
    if (end > maxDate) maxDate = end;
  }

  const now = new Date();
  const diffTime = maxDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  console.log(`Latest key expiry: ${maxDate.toISOString()}`);
  console.log(`Days remaining: ${diffDays}`);

  if (diffDays <= thresholdDays) {
    console.error(`\n[CRITICAL] Key inventory is low! Only ${diffDays} days remaining (Threshold: ${thresholdDays}).`);
    console.error(`Please run 'bun weba-l2-crypto gen-epoch-keys' to replenish the key calendar.\n`);
    process.exit(1); // Fail the CI job
  }

  console.log("Key inventory is sufficient.");
  process.exit(0);

} catch (e: any) {
  console.error("An error occurred during check:", e.message);
  process.exit(1);
}
