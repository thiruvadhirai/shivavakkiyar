#!/bin/bash
# Git Pre-Commit Hook - Block commits to main branch
# This hook prevents direct commits to main, enforcing feature branch workflow

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Allow commits on feature branches
if [[ "$BRANCH" =~ ^feature/ ]]; then
  exit 0
fi

# Block all commits to main
if [ "$BRANCH" = "main" ]; then
  cat >&2 << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║              ❌ WORKFLOW VIOLATION: Direct main commit         ║
╚════════════════════════════════════════════════════════════════╝

You attempted to commit directly to the main branch.
This is not allowed. All changes must use feature branches.

WORKFLOW REQUIRED:

1. Create a task file (tasks/000X-description.md)
   - Define impact, priority, complexity
   - Write acceptance criteria

2. Create feature branch from task ID:
   ./scripts/feature-workflow.py start 000X-description

3. Make changes on the feature branch

4. Run tests:
   ./scripts/feature-workflow.py test

5. Commit with task ID:
   ./scripts/feature-workflow.py commit "Fix: Description of change

   - Detail 1
   - Detail 2

   Fixes #000X"

6. Finish and merge to main:
   ./scripts/feature-workflow.py finish

7. Push to GitHub:
   ./scripts/push-to-github.py

═══════════════════════════════════════════════════════════════════

Current branch: $BRANCH
Required: feature/* or merge commit from feature branch

EOF
  exit 1
fi

# For other branches, allow (could be temporary or experimental)
exit 0
