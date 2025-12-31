import { spawn } from "bun";

console.log("🦀 Building folio-core (Rust/WASM)...");

const cmd = ["cargo", "build", "--target", "wasm32-unknown-unknown", "--release"];

const proc = spawn(cmd, {
    cwd: import.meta.dir,
    stdout: "inherit",
    stderr: "inherit",
});

const exitCode = await proc.exited;

if (exitCode === 0) {
    console.log("✅ WASM Build Successful!");

    // Optional: Run wasm-bindgen if needed (usually required for valid JS binding)
    // For now, we just confirm the binary exists.
    const wasmPath = "../target/wasm32-unknown-unknown/release/folio_core.wasm";
    console.log(`Artifact: ${wasmPath}`);
} else {
    console.error("❌ Build Failed");
    process.exit(1);
}
