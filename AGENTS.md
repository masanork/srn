# Agent Notes

## Markdown Style (Docs)
- Use YAML frontmatter for files under `sites/srn/content/`.
- If frontmatter includes `title`, do not add a duplicate `#` H1 heading.
- Wrap prose around 80-100 columns; avoid single long lines.
- No trailing spaces or manual line breaks for soft wraps.
- Use fenced code blocks with a language tag.
- Keep lists consistent with `-` bullets; indent wrapped lines by two spaces.
- Leave a blank line after frontmatter and before the next heading.

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
