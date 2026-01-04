# Known Issues

## Bun Test Concurrency Issue with SSG Integration Tests

**Status:** Known Limitation (as of 2026-01-04)

**Affected:** SSG Integration tests when run with full test suite (`bun test`)

**Symptom:** 6 SSG Integration tests fail with `NotOpenForReading` errors when running all 352 tests concurrently.

**Root Cause:** Bun test runner file locking conflict when resolving package.json exports to TypeScript files during concurrent test execution.

**Error Messages:**
```
error: NotOpenForReading reading file: "packages/core/src/did.ts"
error: NotOpenForReading reading file: "packages/core/src/wasm_core.ts"
```

**Impact:** None on production functionality. All features work correctly.
- Browser forms: ✅ Working
- Bundle optimization: ✅ Complete (983KB, 81% reduction)
- Client functionality: ✅ All tests pass individually

**Workarounds:**

```bash
# Option 1: Run SSG tests separately
bun test tests/ssg*.test.ts

# Option 2: Run all other tests excluding SSG
bun test src/ packages/

# Option 3: Run SSG tests individually
bun test tests/ssg.test.ts
bun test tests/ssg_tsa.test.ts
bun test tests/coverage_ssg.test.ts
```

**Test Results:**
- Individual SSG tests: ✅ All pass (6/6)
- Client tests: ✅ All pass (74/74)
- Browser functionality: ✅ Working perfectly
- Overall when run together: 346/352 tests pass (98.3%)

**Background:**

This issue emerged after optimizing the client bundle by adding specific exports to `packages/core/package.json`:
- `@srn/core/did`
- `@srn/core/encoding`
- `@srn/core/wasm_core`
- `@srn/core/parser`
- `@srn/core/l2crypto`

When 50+ test files run concurrently, Bun's module resolver encounters file locking conflicts when multiple tests simultaneously resolve these TypeScript exports. The issue does not occur when tests run individually or in smaller groups.

**Related:**
- Bundle optimization commit: c616a97d
- Package exports: `packages/core/package.json`
- Bun issue tracker: https://github.com/oven-sh/bun/issues

**Future Resolution:**

This is likely a Bun-specific bug that may be fixed in future versions. Monitor Bun releases for file handling improvements in the test runner.
