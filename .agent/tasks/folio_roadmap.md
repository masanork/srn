---
description: Folio Development & Verification Roadmap
---

# Folio Roadmap: Secure & Scalable Messaging for Web/A

## Phase 1: Foundation & Security (Completed 2025-12-30)
- [x] **CLI Implementation**: Basic `did`, `transport`, `sync` commands.
- [x] **Remote Authentication**: `did:key` signature verification.
- [x] **Admin Controls**: `ADMIN_DIDS` config and `addUser` mutation.
- [x] **PFS Integration**: `getPreKey` migration to main remote.
- [x] **Security Hardening**: Secure file permissions for keys.
- [x] **Strict Mode Enforcement**: Access control logic enabled. Only explicitly allowed DIDs or Admins can post.
- [x] **Regional Optimization**: Deployed to `asia-northeast1`.

## Phase 2: User Onboarding & Access (Completed 2025-12-30)
- [x] **End-to-End Test**: Verified `admin add-user` -> `transport send` -> `sync` flow.
- [x] **Guest DID Integration**: Implemented `guestPostMessage` for Passkey-authenticated submissions.
- [x] **Web/A Form Integration**: Embedded Guest DID submission into Markdown Forms (RSVP, Join Request).
- [x] **Account Request Flow**: Created `join.md` for self-service account requests.

## Phase 2.5: Polish & Refactor (Completed 2025-12-30)
- [x] **CLI Cleanup**: Normalize CLI options (ensure `--key-file` works everywhere).
- [x] **Browser DID Resolution**: Implemented `did:key` (Ed25519) to X25519 conversion in WASM for browser-side encryption.
- [x] **L2 Signature Standard**: Cleaned up the "Dummy Signature" hack. Added formal `alg: "none"` support in WASM/L2 for Guest DIDs.
- [x] **Browser Compatibility**: リファクタリング「l2crypto.ts」を環境非依存化。

## Phase 3: Advanced Authorization (VC) (In Progress 2025-12-30)
- [x] **VC issuance**: Admin issues "Access Pass" VC instead of DB whitelist via `admin issue-pass`.
- [x] **VC presentation**: Users present VC during auth to gain access in `postMessage`. (Completed 2025-12-30)
- [ ] **Capability Delegation**: Allow users to delegate posting rights to other DIDs/Agents.

## Phase 4: Scalability & Production
- [ ] **Data Retention Policies**: Automated cleanup of old messages/threads.
- [ ] **Thread Visualization**: Enhance CLI/Web UI to show threaded conversations.
