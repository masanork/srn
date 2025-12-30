---
title: "Tech Lead Response: Web/A Folio Transport Threat Analysis"
layout: article
author: "Tech Lead"
date: 2025-12-30
ai_generated: true
---

This response acknowledges the Red Team report on the Web/A Folio transport concept.
Our priority is to absorb the findings as a protective barrier while the team is
mid-implementation. We will not advance production scope until explicit security
invariants are defined and verified.

## Positioning and Scope Control
- Transport remains optional and transport-agnostic, but a minimum security baseline
  is required for any compliant implementation.
- Transport must stay a carrier only. It cannot terminate encryption or re-encrypt
  payloads, and it must not expand key trust.
- Multi-hop routing is deferred for production until authenticated bindings and
  replay protections are specified and validated.

## Specification Changes We Will Propose
### Authenticated transport envelope
- Define a transport envelope with authenticated headers.
- Bind sender DID, recipient DID or scoped address, policy version, and anti-replay
  nonce or sequence.
- Cryptographically bind the envelope to the payload signature or a derived MAC from
  the sender's DID key.

### Anti-replay and sequencing
- Require monotonic counters or epoch-bound nonces with explicit replay windows.
- Enforce hard-reject behavior on replay, with defined cache retention requirements.

### Verified-only acceptance policy
- Verification must include issuer binding checks, not only signature validity.
- Enforce schema or profile conformity before storage acceptance.
- Reject invalid inputs with minimal metadata capture for abuse tracking.

### Metadata minimization and retention
- Prohibit stable routing identifiers by default. Require scoped, short-lived
  addresses.
- Establish explicit retention windows for transport logs and inbox metadata.
- Require redaction rules for observability pipelines.

### Operator trust model
- Treat transport operators as adversarial by default.
- Any trust elevation must be justified by governance and audit controls.

## Immediate Implementation Directives
- Freeze any feature that implies multi-hop routing or delivery receipts.
- Restrict current work to internal development environments only.
- Require a formal security design review before any transport API is declared
  stable.

## Action Plan
- **Week 1**: Draft transport envelope and anti-replay policy; review with security.
- **Week 2**: Define acceptance policy and metadata retention baseline; update
  compliance criteria.
- **Week 3**: Run a red-team tabletop focused on replay, policy downgrade, and
  metadata correlation.
- **Week 4**: Approve a minimal prototype only if the envelope and replay controls
  are finalized and testable.

## Risk Acceptance (Conditional)
If schedule pressure requires a pilot, we will accept only a limited, single-hop,
verified-only transport under these constraints:
- Authenticated headers and anti-replay are mandatory.
- Logs are minimized with fixed retention and redaction.
- No production data without explicit security sign-off.

## Closing
We accept the core findings and will treat transport as a controlled security
boundary. Implementation continues only within the narrowed scope and with new
specification controls that preserve end-to-end integrity and privacy.
