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

## Phase 2.5: Polish & Refactor (Next)
- [ ] **CLI Cleanup**: Normalize CLI options (ensure `--key-file` works everywhere).
- [ ] **Browser DID Resolution**: Implement proper `did:key` resolution in Browser Client (currently blocked/mocked).
- [ ] **L2 Signature Standard**: Clean up the "Dummy Signature" hack for Guest DIDs (define proper `ES256` or `Passkey` signature type for L2 envelopes).
- [ ] **Dependency Management**: Ensure `l2crypto.ts` (fs dependency) doesn't break Browser builds.

## Phase 3: Advanced Authorization (VC)
- [ ] **VC issuance**: Admin issues "Access Pass" VC instead of DB whitelist.
- [ ] **VC presentation**: Users present VC during auth to gain access.
- [ ] **Capability Delegation**: Allow users to delegate posting rights to other DIDs/Agents.

## Phase 4: Scalability & Production
- [ ] **Data Retention Policies**: Automated cleanup of old messages/threads.
- [ ] **Thread Visualization**: Enhance CLI/Web UI to show threaded conversations.
