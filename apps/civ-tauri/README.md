# CIV Desktop (Tauri)

A native desktop application for reading My Number Cards using `packages/civ` and Tauri.
This bypasses WebUSB limitations on macOS/Windows by using native PC/SC (via `pcsc` crate).

## Prerequisites
- Rust (cargo)
- Bun
- Generic Token Driver (if on macOS/Windows, standard OS drivers usually work with PC/SC)

## Development

1. Install dependencies:
   ```bash
   cd apps/civ-tauri
   bun install
   ```

2. Run in dev mode:
   ```bash
   bun run tauri dev
   ```

## Build

To create a release application (DMG/EXE):
```bash
bun run tauri build
```
