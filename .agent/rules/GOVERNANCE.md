# Governance Simulation Rules

## Disclaimer Policy
This project uses "Simulated Governance" to test processes. Artifacts may look like official legal documents or meeting minutes.

### Required Disclaimer
For any file under `sites/srn/content/governance/`, you **MUST** add:

**1. Frontmatter:**
```yaml
draft: true
simulated_governance: true
disclaimer: >
  This document is a SIMULATION for quality assurance and scenario testing purposes.
  It does not reflect actual decisions by the organization or government entities.
```

**2. Content Body (Top):**
```markdown
> **⚠️ SIMULATION NOTICE**
> This document is a generated simulation for testing governance processes.
> It is NOT an official record.
```

## Committee Structure
- **Governance Committee**: The decision-making body. Documents decisions in `governance/minutes-*.md`.
- **Red Team**: Provides adversarial feedback. Reports in `governance/red-team-*.md`.
- **SLTF (Security & Legal Task Force)**: Reviews specs.

## Workflow
1.  **Proposal**: Agent drafts a proposal in `governance/proposals/`.
2.  **Review**: Red Team / SLTF reviews (Self-Correction or Agent Interaction).
3.  **Decision**: Committee "approves" (Simulated).
4.  **Implementation**: Code changes are made.
