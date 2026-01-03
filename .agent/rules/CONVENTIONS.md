# Technical Conventions

## Runtime & Tools
- **Runtime**: Bun (`bun`).
- **Test Runner**: `bun test`.
- **Package Manager**: `npm` (via `package.json`) or `bun`.
- **File Operations**: `fs-extra` (preferred over `fs`).

## Markdown Style
- **Frontmatter**: Required for `sites/srn/content/*`. Use YAML.
    - Fields: `title`, `layout` (required). `description`, `author`, `date` (optional).
- **Headings**: If frontmatter has `title`, do NOT add a duplicate `#` H1.
- **Formatting**:
    - Wrap prose around 80-100 columns.
    - No trailing spaces.
    - Use fenced code blocks with language tags.
    - Lists: Use `-` bullets.

## Mermaid Diagrams
- Use fenced `mermaid` blocks.
- **Do NOT** include YAML-style `---` inside diagrams.
- Keep labels short. Use quotes for spaces.
- Avoid dense annotations for presentation readability.

## Project Structure
- `sites/`: Multi-tenant site content and config.
- `shared/`: Shared assets (fonts, schemas).
- `src/core/`: Shared logic (crypto, utils).
- `src/ssg/`: Build-time logic (LayoutManager, IdentityManager).
- `src/form/`: Client-side runtime logic.

## Build Commands
- **Do not execute without explicit permission.**
- **Lock File**: `.ssg-build.lock` prevents concurrent builds.
- **SRN Build**: `bun run build:srn`
- **SSG Only**: `bun run src/ssg/index.ts --site srn`
- **Tests**: `bun test` (runs all tests). `bun test --coverage` (required before release).
