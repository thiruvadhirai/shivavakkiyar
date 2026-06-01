---
id: 0003
title: Persist Git Hooks + Enforce Task Workflow Across All Branches
status: done
impact: High
priority: 010
complexity: "2-3 hours"
assignee: Vairam
created: 2026-05-29
raci:
  responsible: Vairam
  accountable: Vairam
  consulted: []
  informed: [team]
linked_tasks: [0002]
blocked_by: []
related: []
---

# Description

Git hooks installed on feature branches don't persist to main branch. Users can bypass task ID validation by using plain `git commit` on main. Need to:

1. Create setup script to install hooks (run once after clone)
2. Modify feature-workflow.sh to ensure hooks always installed
3. Test full workflow end-to-end with real feature (0001)
4. Document workflow verification checklist
5. Verify all failure points handled gracefully

# Acceptance Criteria

- [x] `scripts/setup-hooks.sh` created (idempotent, installs pre-commit hook)
- [x] `feature-workflow.sh` ensures hooks installed on every `start` and `test`
- [x] `DEVELOPMENT.md` updated with "Setup Hooks" step
- [x] Full workflow tested end-to-end (branch → test → commit → merge → push)
- [x] Task ID validation works on all branches (feature + main attempt)
- [x] Workflow Verification Checklist documented (`WORKFLOW_VERIFICATION.md`)
- [x] All test suites pass (85 tests)
- [x] Git log shows linear history with task references

# Test Plan

1. Fresh start: clone repo, run setup
2. Verify hooks installed: `ls -la .git/hooks/pre-commit`
3. Start feature branch for task 0001: `feature-workflow.sh start 0001-fix-widget-null-checks`
4. Attempt commit without task ID → should fail
5. Attempt commit with task ID → should succeed
6. Merge to main → verify hook persists
7. Attempt commit on main without task ID → should fail
8. Run full tests: `npm test` (host should fail, container should pass)
9. Push to GitHub

# Workflow Verification

Test scenarios:
- ✅ `feature-workflow.sh start` → hooks installed
- ✅ Plain `git commit` without `#0001` → pre-commit hook blocks
- ✅ `git commit` with `#0001` → pre-commit hook passes
- ✅ Merge to main → hooks persist
- ✅ VERSION auto-increments on commit
- ✅ Container-only test enforcement (host `npm test` fails)
- ✅ All 85 tests pass in container

# Dependencies

- Task 0002 must be completed first (rules/hooks exist)

# Estimated Time

2-3 hours
