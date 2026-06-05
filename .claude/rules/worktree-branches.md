# Worktree Branch Naming Convention

## Rule: Use `feature/wt-` prefix for worktree branches

All worktree branches must follow the naming convention:
```
feature/wt-NNNN-kebab-case-description
```

### Examples
- ✅ `feature/wt-0021-build-artifact-reference-map`
- ✅ `feature/wt-0022-convert-scripts-to-python`
- ✅ `feature/wt-0023-environment-variable-support`
- ❌ `worktree-task-0021-artifacts` (old, deprecated)
- ❌ `feature/0021-build-artifact-reference-map` (not a worktree branch)

## Worktree Setup

When creating a worktree branch:

1. Create the feature branch with `feature/wt-` prefix
2. Create the worktree directory: `.claude/worktrees/task-NNNN-name/`
3. The worktree `.git` file references the main repo's `.git/worktrees/` directory
4. All work happens in the worktree, commits go to the `feature/wt-NNNN-*` branch

## Cleanup Policy

- Old `worktree-task-*` branches should be deleted
- Orphaned worktree directories (no corresponding `feature/wt-*` branch) should be cleaned up
- Check `.claude/worktrees/` regularly for stale entries

## Related Files

- `.claude/rules/git-workflow.md` - Git workflow for feature branches
- `scripts/feature-workflow.py` - Automated feature branch management
