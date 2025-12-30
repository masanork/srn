---
title: "Red Team Report: Web/A Folio Transport Threat Analysis"
layout: article
author: "Red Team Lead"
date: 2025-12-30
ai_generated: true
---

This report assesses the Web/A Folio transport concept that surfaced after release
approval. The assessment is grounded in the existing transport statements in the Web/A
whitepaper and the Web/A Folio paper, not in hypothetical features. The goal is to expose
security gaps, threat boundaries, and specification changes required before any transport
prototype can be safely approved.

## Sources in Scope
- Web/A discussion paper, Messaging and Transport extension (Section 6.6).
- Web/A Folio paper, Messaging and Transport draft (Section 6.2).

## Summary Assessment
The transport concept is positioned as an optional layer for submission and reception,
intended to remain transport-agnostic, verified-only, and portable across platforms. It is
also expected to support multi-hop routing while preserving end-to-end encryption. These
principles are sound at the vision level, but the current text leaves critical security
properties undefined. As written, transport introduces new trust boundaries, metadata
leakage, and replay vectors that are not addressed by the existing L2 cryptographic
controls. If implemented without explicit cryptographic bindings and operational
constraints, transport will become a stealth attack surface that undermines provenance and
user safety.

## Threat Model (Derived From Current Text)
- **Adversaries**
  - Passive and active network observers in multi-hop routes.
  - Compromised transport operators or serverless accounts.
  - Malicious senders attempting to bypass "verified-only" acceptance.
  - Coerced or subpoenaed intermediaries extracting metadata.
- **Assets at risk**
  - Confidentiality of L2-encrypted payloads if key handling is expanded.
  - Integrity and provenance of Web/A documents and Folio audit logs.
  - Privacy of sender-receiver relationship graphs in routing metadata.
  - Availability of inboxes and delivery semantics.
- **Trust boundaries**
  - The transport layer is not part of the signed data model, yet it influences
    acceptance and routing decisions that affect document integrity and custody.

## Critical Gaps Against the Stated Principles
### Verified-only acceptance is underspecified
The Web/A paper states that inbound payloads must be accepted only after validation of
VC/DID signatures. The Folio paper mirrors this via Cloud Functions before acceptance.
What is missing:
- Binding of transport headers to the validated signature material.
- Explicit rejection rules for invalid or unverifiable payloads across multi-hop routes.
- The required evidence stored for abuse tracking without becoming a metadata data lake.

### WebPKI-first trust without a transport trust boundary model
Reusing WebPKI/DID resolution is sensible, but the transport layer becomes a trust anchor
when it decides which signatures are "good enough" to store. This invites:
- Policy downgrade attacks if a node accepts weaker issuer bindings.
- Replay attacks where a previously valid payload is reintroduced.
- Substitution attacks if transport metadata is not bound to issuer intent.

### Multi-hop routing without formal anti-replay and audit semantics
The Web/A paper expects multi-hop routing with end-to-end encryption and per-hop
assignment, blocking, and auditability. Without protocol-level sequencing and anti-replay,
any hop can reorder, replay, or stall messages while appearing compliant. The current text
has no monotonic counters, epochs, or signed delivery receipts.

### Transport-agnostic design lacks minimum security invariants
Folio claims transport should remain optional and transport-agnostic, but there is no
minimum bar for confidentiality, integrity, or metadata protection. This means two
implementations can both claim compliance while providing radically different security.

## Key Risks Specific to Folio Workflows
- **Inbox poisoning**: A malicious sender can flood inboxes with unverifiable payloads
  that are expensive to verify, or with valid-but-malicious documents that bypass routing
  heuristics.
- **Provenance drift**: If transport metadata is not bound to the document signature, a
  payload can be replayed to a different recipient or context while remaining valid at the
  cryptographic layer.
- **Metadata coercion**: Multi-hop routing implies routing records. Without strict
  minimization and retention limits, these records become an intelligence asset.
- **Audit log ambiguity**: Folio logs record operations, but transport events are not
  cryptographically anchored. A compromised transport can fabricate delivery history.

## Required Specification Changes
### 1) Transport envelope with authenticated headers
Define a transport envelope whose headers are covered by a sender signature or a derived
MAC from the sender's DID key. At minimum, bind:
- Sender DID, recipient DID or scoped address.
- Transport policy version and allowed hop count.
- Nonce or sequence number for anti-replay.

### 2) Anti-replay, sequencing, and delivery receipts
Mandate monotonic counters or epoch-bound nonces and a replay window for each recipient.
For multi-hop, require signed hop receipts or a verifiable delivery chain to avoid silent
mutation.

### 3) Verified-only acceptance must include policy gates
Clarify that verification includes:
- Issuer binding checks, not only signature validity.
- Schema or profile conformity for the payload class.
- Explicit rejection and logging behavior for unverified inputs.

### 4) Metadata minimization and retention limits
Define a minimum privacy baseline for transport logs:
- No persistent correlation identifiers by default.
- Explicit retention windows with secure deletion requirements.
- Redaction rules for observability pipelines.

### 5) Transport operator trust model
Specify whether transport operators are trusted, semi-trusted, or adversarial. The
current text reads like they are semi-trusted, but the design must assume adversarial
operators unless a strict governance model is defined.

## Recommended Red Team Exercises
- **Replay chain attack**: Inject a valid payload into multiple recipients via hop
  re-binding to test provenance drift and audit logging.
- **Policy downgrade simulation**: Evaluate how a weaker verification policy at an
  intermediate hop can poison the inbox.
- **Metadata correlation study**: Test linkability using size, timing, and routing
  identifiers across multi-hop paths.

## Immediate Go/No-Go Criteria
- A transport prototype should not ship until authenticated headers, anti-replay
  guarantees, and operator trust assumptions are formally specified.
- Transport logs and inbox acceptance policies must be defined as security controls, not
  operational defaults.
- Multi-hop routing must include a verifiable chain of custody, or it should be deferred.

## Closing Statement
The transport concept is defensible only if it remains an optional, minimal carrier that
never changes the signed data model and never expands key trust. The existing whitepapers
state that intent but do not yet enforce it. Until the missing bindings, replay defenses,
and trust boundary definitions are written into the specification, transport should be
considered a high-risk extension and paused for formal design review.
