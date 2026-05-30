---
description: Git workflow script enforcement
globs: ["scripts/**"]
---

# Git Workflow Rules

ALWAYS use workflow script. NEVER use `git commit` directly.

## Workflow Commands

```bash
./scripts/feature-workflow.sh start NNNN-name   # Create feature branch (installs hooks)
./scripts/feature-workflow.sh test              # Run tests in container
./scripts/feature-workflow.sh commit "message"  # Commit (VERSION auto-increments)
./scripts/feature-workflow.sh finish            # Merge to main
./scripts/push-to-github.sh                     # Push to GitHub
```

## What the Script Does

- ✅ Creates feature/* branch from main
- ✅ Installs git hooks automatically
- ✅ Runs tests in container only
- ✅ Auto-increments VERSION via pre-commit hook
- ✅ Validates task ID in commit message
- ✅ Merges to main safely
- ✅ Prevents accidental `main` commits

## Commit Requirements

Every commit MUST:
- Reference a task ID: `Fixes #0001` or `#0001`
- Be meaningful (not "fix stuff")
- Follow verb format: `Fix: ...`, `Add: ...`, `Update: ...`
- Include bullet-point details (optional but recommended)

Example:
```
Fix: Widget null-check crashes

- Add optional chaining to panchanga access
- Handle undefined location gracefully
- All tests passing

Fixes #0001
```
