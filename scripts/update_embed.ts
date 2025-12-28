import { build } from "bun";
import { readFile, writeFile } from "fs/promises";

async function main() {
    console.log("Building client bundle...");
    const result = await build({
        entrypoints: ["src/form/client/index.ts"],
        outdir: "src/form/client",
        naming: "bundle.js",
        minify: true,
    });

    if (!result.success) {
        console.error("Build failed", result.logs);
        process.exit(1);
    }

    console.log("Reading bundle...");
    const bundleContent = await readFile("src/form/client/bundle.js", "utf-8");

    console.log("Updating embed.ts...");
    const tsContent = `// Auto-generated from src/form/client/bundle.js
export const CLIENT_BUNDLE = ${JSON.stringify(bundleContent)};
`;

    await writeFile("src/form/client/embed.ts", tsContent);
    console.log("Done!");
}

main();
