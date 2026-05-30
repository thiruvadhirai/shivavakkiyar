---
description: Container-only test enforcement, TDD patterns
globs: ["tests/**", "**/*.test.js", "**/*.spec.js", "**/*.test.cjs", "assets/js/**/*.test.js"]
---

# Testing Rules

## Container-Only (MANDATORY)

- ✅ `./scripts/feature-workflow.sh test` or `podman exec saivamcloud-test npm test`
- ❌ `npm test` on host (blocked by permissions)
- ❌ `node tests/*.js` on host (blocked by permissions)

Dev server: `podman-compose up -d saivamcloud-dev` → http://localhost:5080

## Test Organization (Transition Plan)

**Current**: `tests/` folder (15 unit + 70 integration + 15 E2E tests)

**Future**: Unit tests adjacent to source code (language-appropriate patterns):
- `assets/js/foo.js` → `assets/js/foo.test.js`

## Build Exclusions

Test files excluded from Jekyll build via `_config.yml`:
- `*.test.js` not included in site output
- Tests stay in git, excluded from production

## TDD Pattern

1. Write failing test (based on task acceptance criteria)
2. Run: `./scripts/feature-workflow.sh test` (see it fail)
3. Implement code
4. Run tests again (see it pass)
5. Commit with task ID: `Fixes #0001`

See `tasks/TASK_WORKFLOW.md` for details.
