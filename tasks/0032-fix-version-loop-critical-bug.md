---
id: 0032
title: "CRITICAL BUG: Fix version auto-increment infinite loop"
status: done
impact: Critical
priority: 001
complexity: "30-45 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: [0003, 0004]
blocked_by: []
related: [0003, 0004]
---

# Critical Bug: VERSION Auto-Increment Loop

## Original Requirement (Task 0003)

**Task 0003**: "Persist Git Hooks + Enforce Task Workflow"  
**Requirement**: Auto-increment VERSION file on every commit  
**Format**: `MAJOR.MINOR.PATCH-STAGE.NUM` (e.g., `1.0.0-beta.2` → `1.0.0-beta.3`)  
**Reference**: Task 0003 line 60: "VERSION auto-increments on commit"

## Current Status (BROKEN)

**Current VERSION**: `1.0.0-beta.459660` ❌  
**Expected VERSION**: Should be `~1.0.0-beta.70` (70+ commits on main)  
**Actual increment**: +21,750 jumps in ~70 commits (300x normal rate!)

**Previous failed fix attempt**: Task 0004 marked as "done" but bug persists

## Root Cause

The pre-commit hook at `scripts/hooks/pre-commit` (line 52) calls:
```bash
git add "$VERSION_FILE" 2>/dev/null || true
```

This creates a **recursive loop**:

1. User runs `git commit`
2. Pre-commit hook runs (triggered by git)
3. Hook increments VERSION (e.g., `beta.2` → `beta.3`)
4. Hook does `git add VERSION` to stage the incremented file
5. **Git triggers pre-commit hook AGAIN** (because VERSION file changed)
6. Hook increments VERSION again (e.g., `beta.3` → `beta.4`)
7. Hook does `git add VERSION` again
8. **Loop continues** until git detects no changes or a depth limit

## Why Task 0004 Failed

Task 0004 was marked as done but the fix was incomplete. The hook still has the recursive `git add` call that triggers the loop.

## Solution

**Prevent recursive hook invocation** using an environment variable guard:

### Fix Implementation

**File**: `scripts/hooks/pre-commit`

```bash
#!/bin/bash
# ... existing header ...

# PREVENT RECURSIVE HOOK INVOCATION
# If VERSION_HOOK_RUNNING is set, we're already in the hook - don't recurse
if [ "$VERSION_HOOK_RUNNING" = "1" ]; then
  exit 0
fi

# ... existing code lines 7-52 ...

# Update VERSION file
echo "$new_version" > "$VERSION_FILE"

# FIX: Don't use git add here - it triggers the hook again!
# Instead, mark that we're running the hook so the recursive call exits early
# The committed file will be staged naturally when the user calls git commit

export VERSION_HOOK_RUNNING=1

# Still need to stage VERSION, but only if this is the first invocation
if [ "$VERSION_HOOK_RUNNING" = "1" ]; then
  git add "$VERSION_FILE" 2>/dev/null || true
  unset VERSION_HOOK_RUNNING
fi

# ... rest of file (lines 55-92) ...
```

**Alternative Approach** (Simpler - Recommended):

Remove the `git add` call entirely. Git will automatically include the VERSION file since it's already tracked. The hook only needs to UPDATE the file content; git will notice the change.

```bash
# Update VERSION file
echo "$new_version" > "$VERSION_FILE"

# REMOVED: git add "$VERSION_FILE" (causes recursive hook invocation)
# Git automatically includes tracked files in the commit
```

## Why This Works

1. **Prevents recursion**: Guard variable ensures hook only runs once per commit
2. **Still increments correctly**: VERSION is updated in-place
3. **File is committed**: Git includes tracked files automatically
4. **Clean and simple**: No complex locking or timing issues

## Acceptance Criteria

- [ ] VERSION increments by exactly 1 per commit (no multi-thousand jumps)
- [ ] Hook does not recurse infinitely
- [ ] Tested: Create feature branch, make 5 commits, verify VERSION increases by 5 only
- [ ] Current inflated VERSION file identified and documented
- [ ] Option to reset VERSION to realistic value provided (e.g., `1.0.0-beta.70`)
- [ ] Task 0004 status reviewed (why it was marked done when bug persists)
- [ ] Pre-commit hook guards added to prevent future recursion

## Test Plan

```bash
# 1. Get current VERSION before fix
BEFORE=$(cat VERSION)
echo "Before: $BEFORE"

# 2. Create test branch
git checkout -b test-version-fix

# 3. Make 5 commits
for i in {1..5}; do
  echo "test $i" >> test.txt
  git add test.txt
  git commit -m "Test commit $i - Fixes #0032"
  echo "After commit $i: $(cat VERSION)"
done

# 4. Verify VERSION increased by exactly 5
# Extract build number
AFTER=$(cat VERSION | grep -oE '[0-9]+$')
echo "Final VERSION number: $AFTER"
echo "Should have increased by 5"

# 5. Cleanup
git checkout main
git branch -D test-version-fix
```

## Version Reset Strategy

After fixing the hook, we need to decide on the VERSION:

**Option A**: Keep inflated number (459660) - not recommended  
**Option B**: Reset to semantic (1.0.0-beta.1) with note in git  
**Option C**: Reset to realistic (1.0.0-beta.70) based on commit count  

**Recommendation**: Option C - use `git rev-list --count HEAD` to auto-generate realistic version

## Related Tasks

- **Task 0003**: Original requirement (version auto-increment)
- **Task 0004**: Previous failed fix attempt (mark as "reopened")
- **CLAUDE.md**: References version management in Development Workflow section

## References

- Git Hook Documentation: https://git-scm.com/docs/githooks
- Pre-commit hook invocation order
- Git staging and hook interaction
