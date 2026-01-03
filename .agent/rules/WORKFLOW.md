# Development Workflow

## 1. Build Gate (Clean Test Policy)
- **Rule**: Do not start new feature development or architectural changes unless ALL tests are passing.
- **Check**: Run `bun test --coverage` before any build or deploy.
- **Fix**: Resolve existing regressions before moving forward.

## 2. Release Management
- **Trigger**: Completion of a major feature, security remediation, or architectural change.
- **Action**: Update `sites/srn/content/releases.md`.
    - Format: `## vX.Y.Z - Title`
    - Content: Date and categorized list of improvements.
- **Versioning**: Semantic Versioning (Major.Minor.Patch).

## 3. Document Staging
- **Drafts**: All new/in-progress documents MUST include `draft: true` in frontmatter.
- **Staging**: Do not link to draft documents from main dashboards until finalized.
- **Stating Process**: New conceptual papers undergo refinement via Red Team dialogue.

## 4. Localization
- **Primary**: English (`.md`). Update first to maintain single source of truth.
- **Secondary**: Japanese (`.ja.md`). Update intermittently or at major milestones.
- **Sync**: Ensure critical protocol/data structure changes are reflected in both languages before release.
