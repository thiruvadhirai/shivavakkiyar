---
id: 0004
title: Fix Pre-Commit Hook Version Loop Bug
status: done
impact: Low
priority: P5
complexity: "1-2 hours"
assignee: Claude
created: 2026-05-30
linked_tasks: [0003, 0003a]
---

# Description

The pre-commit hook that auto-increments VERSION is entering a loop when called via Claude workflow scripts. Instead of incrementing by 1 per commit (e.g., beta.2 → beta.3), the version jumps by thousands (e.g., beta.427783 → beta.449533).

Root cause: The hook appears to be invoked multiple times per single commit, likely when `feature-workflow.py` runs `git add -A` followed by `git commit`.

## Example

- Started with: `1.0.0-beta.427783`
- Expected after 3 commits: `1.0.0-beta.427786`
- Actually got: `1.0.0-beta.449533` (+ 21,750 jumps)

## Affected Files

- `scripts/hooks/pre-commit` — Version increment logic (lines 37-49)

## Root Cause

When Claude calls workflow scripts that execute git commands, the pre-commit hook may be triggered multiple times or in unexpected ways. This causes the VERSION to increment much more than 1 per commit.

## Solution Options

1. **Add hook guard** — Prevent hook from running twice via a mutex/lock
2. **Use timestamp** — Switch to `1.0.0-beta.TIMESTAMP` format
3. **Use commit count** — Auto-generate from `git rev-list --count HEAD`
4. **Simplify versioning** — Only update on tags, not every commit

## Acceptance Criteria

- [ ] Pre-commit hook increments VERSION by exactly 1 per commit
- [ ] No multi-thousand jumps in version numbers
- [ ] Hook works correctly when called by feature-workflow.py
- [ ] Verify via: create feature branch, make 3 commits, check VERSION increases by 3 only

## Priority Notes

**P5 (Lowest)**: This is a cosmetic issue that doesn't affect functionality. The workflow works correctly; only the version numbering is inflated. Can be deferred or fixed opportunistically.

## Testing

```bash
./scripts/feature-workflow.py start test-versioning
echo "test" >> README.md
./scripts/feature-workflow.py commit "Test: version bump check #0004"
cat VERSION  # Should be 1.0.0-beta.11

echo "test2" >> README.md
./scripts/feature-workflow.py commit "Test: second commit #0004"
cat VERSION  # Should be 1.0.0-beta.12

echo "test3" >> README.md
./scripts/feature-workflow.py commit "Test: third commit #0004"
cat VERSION  # Should be 1.0.0-beta.13
```

If VERSION jumps to 1.0.0-beta.100+, the loop is still happening.
