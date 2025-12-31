# Agent Notes

## Markdown Style (Docs)
- Use YAML frontmatter for files under `sites/srn/content/`.
- If frontmatter includes `title`, do not add a duplicate `#` H1 heading.
- Wrap prose around 80-100 columns; avoid single long lines.
- No trailing spaces or manual line breaks for soft wraps.
- Use fenced code blocks with a language tag.
- Keep lists consistent with `-` bullets; indent wrapped lines by two spaces.
- Leave a blank line after frontmatter and before the next heading.

## Project Status & Roadmap
- Track high-level progress and milestones in `ROADMAP.md`.
- See `remote/functions/GUEST_DID_STATUS.md` for specific WebAuthn/Guest DID details.

## Repo Notes
- Tests: `bun test --coverage`

## Build & SSG
- SRN build: `bun run build:srn`
- Full build (all sites): `bun run build`
- Clean rebuild (all sites): `bun run build:full`
- SSG only: `bun run src/ssg/index.ts --site srn` (add `--clean` to reset)
- Dev watch: `bun --watch src/ssg/index.ts`

## Build Gate
- Run `bun test --coverage` before any build or deploy.
- If tests fail, stop and fix before building.

## Frontmatter (Docs)
- Required for `sites/srn/content/*`: `title`, `layout`
- Common optional: `description`, `author`, `date`, `status`
- Presentations: set `presentation_template` when needed

## Mermaid Notes
- Use fenced ```mermaid blocks; do not include YAML-style `---` inside diagrams.
- Keep labels short; prefer quoted labels for spaces.
- Avoid very long labels or dense annotations in presentation mode.

## Release Management
- After completing a major feature, security remediation, or architectural change, **ALWAYS update `sites/srn/content/releases.md`**.
- Use semantic versioning (Major.Minor.Patch) based on the impact of changes.
- Ensure the release note entry includes the date and a categorized list of improvements.

## Document Staging & Quality Control
- **Draft Status**: All new, in-review, or in-progress documents MUST include `draft: true` in their frontmatter.
- **Staging Rule**: Do not add links to draft documents on main dashboards until they are finalized.
- **Document Stating Process**: New conceptual papers must undergo a "Stating Process" where the core hypothesis is refined through dialogue with the **Red Team**.
- **Red Team Engagement**: Proactively seek feedback from the Red Team (security/architectural reviewers) before finalizing state transitions in technical papers.
- **Joint Task Force Review**: Critical architectural changes and public-facing specifications must be reviewed by the **Security & Legal Task Force (SLTF)** to ensure alignment between technical verifiability and legal validity.

## Documentation & Localization
- For technical specifications and design notes, **prioritize updating the English version (`.md`)** during active development to reduce token consumption and maintain a single source of truth.
- Update the Japanese version (`.ja.md`) intermittently or at major milestones (e.g., when a feature is finalized or ready for public review).
- Ensure critical changes to data structures or protocols are reflected in both versions before a release.
# AI Interaction Guidelines

## Disclaimer Policy for Simulated Governance Documents

When creating artifacts that simulate governance processes, legal discussions, or policy decisions (e.g., meeting minutes, agendas, official-looking specifications), you **MUST** include a prominent disclaimer to prevent misunderstanding by external parties.

### Required Frontmatter
For any simulated governance document, add the following fields to the YAML frontmatter:

```yaml
draft: true
simulated_governance: true
disclaimer: >
  This document is a SIMULATION for quality assurance and scenario testing purposes.
  It does not reflect actual decisions by the organization or government entities.
```

### Content Disclaimer
In addition to the frontmatter, adding a visible quote block at the top of the markdown body is recommended:

```markdown
> **⚠️ SIMULATION NOTICE**
> This document is a generated simulation for testing governance processes.
> It is NOT an official record.
```

This rule applies to all files under `sites/srn/content/governance/` created by AI agents.
