---
description: Core rules always applied to this project — no globs, always loaded
---

# Panchanga Calculator — Core Rules

## Git & Commits

- **Branches**: Always `feature/*` (never commit to `main` directly)
- **Commit format**: `Verb: description\n\n- bullet details`
  - Example: `Fix null-check crash in widget\n\n- Add optional chaining\n- Tests passing`
- **No footers**: Never add `Co-Authored-By:` or similar metadata
- **Task reference**: Every commit must reference a task ID: `Fixes #0001`
- **Commit via script**: Use `./scripts/feature-workflow.sh commit "..."` (never `git commit` directly)

## Version Management

- **File**: `VERSION` (semantic versioning)
- **Format**: `MAJOR.MINOR.PATCH-STAGE.NUM` (e.g., `1.0.0-beta.7`)
- **Auto-increment**: Via pre-commit hook (`scripts/hooks/pre-commit`)
- **Source controlled**: Hook is in `scripts/hooks/pre-commit` (installed by workflow script)
- **Never manually edit** during feature development (hook handles it)

## Container Enforcement

- **Dev server**: `podman-compose up -d saivamcloud-dev` → http://localhost:5080
- **Test container**: `saivamcloud-test` (all tests run inside)
- **All code runs in container**: Never run `npm`, `node`, `python3`, `ruby` on host
  - ✅ `podman exec saivamcloud-test npm test`
  - ✅ `podman-compose exec saivamcloud-test pytest`
  - ❌ `npm test` (on host, forbidden)
  - ❌ `python3 scripts/foo.py` (on host, forbidden)
- **Name convention**: Container names follow `svc-<purpose>` pattern
- **Feature-workflow enforces**: `./scripts/feature-workflow.sh test` runs tests in container automatically

## Task Workflow

- **Every feature starts with a task** in `tasks/NNNN-kebab-case.md`
- **Task file contains**: impact, priority, complexity, RACI matrix, acceptance criteria
- **Branch naming**: `feature/0001-short-title` (uses task ID)
- **Commit messages reference task**: `Fixes #0001`
- **Pre-commit validation**: Commits without task ID fail (enforced by hook)

See `tasks/TASK_WORKFLOW.md` for full details.

## Development Workflow

```bash
# 1. Start feature branch (installs hooks automatically)
./scripts/feature-workflow.sh start NNNN-short-title

# 2. Make changes (TDD: test first, code second)
# Edit files, write tests

# 3. Run tests in container (MUST pass)
./scripts/feature-workflow.sh test

# 4. Commit (version auto-increments, task ID validated)
./scripts/feature-workflow.sh commit "Verb: description

- detail
- detail

Fixes #NNNN"

# 5. Repeat 2-4 until feature complete

# 6. Finish (merge to main)
./scripts/feature-workflow.sh finish

# 7. Push to GitHub
./scripts/push-to-github.sh
```

## Never Allowed (Even in Auto-Approve Mode)

- ❌ `git commit` directly (use workflow script)
- ❌ `git push --force` (only push via push-to-github.sh)
- ❌ `npm test` on host (must be in container)
- ❌ Manual VERSION edits during feature work (let hook handle it)
- ❌ Commits without task ID reference
- ❌ Committing to `main` branch directly

---

**Questions?** See:
- `tasks/TASK_WORKFLOW.md` — how to plan tasks
- `.claude/rules/testing.md` — testing in containers
- `.claude/skills/feature-workflow/` — full development cycle skill