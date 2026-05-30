---
name: feature-workflow
description: Complete TDD development cycle with hierarchical feature branches
---

# Feature Workflow Skill

## Key Concepts

### Feature Hierarchy

- **Main Feature**: Top-level feature (e.g., "0001-fix-widget-crash")
- **Sub-Feature**: Nested feature branching from main feature (e.g., "0001a-null-check", "0001b-error-display")

### Branch Strategy

```
main
  └─ feature/0001-widget-crash (main feature)
      ├─ feature/0001a-null-check (sub-feature #1)
      └─ feature/0001b-error-display (sub-feature #2)
```

### Merge Rules

1. **Sub-features merge to main feature** (not directly to main)
2. **Main feature merges to main ONLY when:**
   - All sub-features are completed, OR
   - Sub-features are deferred (marked for future)
3. **Sub-features deferred for future:**
   - Rebase to main after main feature merges
   - Resolve conflicts in sub-feature branch (keep history linear)
   - This allows sub-feature to continue in next sprint

## Workflow Steps

### 1. Create Main Feature Branch

```bash
./scripts/feature-workflow.sh start 0001-fix-widget-crash
# Creates: feature/0001-fix-widget-crash (from main)
```

### 2. Create Sub-Feature (if needed)

If work breaks into discrete tasks:

```bash
# From feature/0001-fix-widget-crash:
git checkout feature/0001-fix-widget-crash
./scripts/feature-workflow.sh start 0001a-null-check
# Creates: feature/0001a-null-check (from feature/0001-fix-widget-crash)
```

### 3. Implement Sub-Feature (TDD)

```bash
# Write test
# ./scripts/feature-workflow.sh test  (fail)
# Edit code
# ./scripts/feature-workflow.sh test  (pass)
# ./scripts/feature-workflow.sh commit "Fixes #0001a"
```

### 4. Merge Sub-Feature Back to Main Feature

```bash
git checkout feature/0001-fix-widget-crash
./scripts/feature-workflow.sh finish  # Merges 0001a into 0001
# Deletes 0001a branch
```

### 5. Repeat Sub-Features (if multiple)

```bash
# If 0001b-error-display needed:
./scripts/feature-workflow.sh start 0001b-error-display
# ... implement ...
git checkout feature/0001-fix-widget-crash
./scripts/feature-workflow.sh finish  # Merges 0001b into 0001
```

### 6A: Complete Feature (Merge to Main)

If ALL sub-features done:

```bash
git checkout feature/0001-fix-widget-crash
./scripts/feature-workflow.sh finish
# Merges 0001 to main
./scripts/push-to-github.sh
```

### 6B: Defer Sub-Features (Rebase for Future)

If some sub-features deferred:

```bash
# Mark deferred sub-feature in task file (status: on-hold)
# Update task notes: "Will resume in next sprint"

# Merge completed main feature to main:
git checkout feature/0001-fix-widget-crash
./scripts/feature-workflow.sh finish  # 0001 → main
./scripts/push-to-github.sh

# Now rebase deferred sub-feature to main:
git checkout feature/0001c-future-work
git rebase main
# Resolve any conflicts (should be minimal)
# Force push to origin: git push -u origin feature/0001c-future-work --force

# This allows 0001c to continue in next iteration
```

## Commit History

**Goal**: Always keep main branch history linear (no merges visible)

### Good History (After Sub-Features Merged)

```
main:
├─ abc123: Add task workflow system (Fixes #0002)
├─ def456: Fix null-check in widget (Fixes #0001)
├─ ghi789: Add error handling (Fixes #0001)
└─ jkl012: Implement graceful fallback (Fixes #0001)
```

### Bad History (Avoid)

```
main:
├─ abc123: Add task workflow
└─ Merge branch 'feature/0001-widget-crash'
   ├─ Merge branch 'feature/0001a-null-check'
   │  └─ ...
   └─ Merge branch 'feature/0001b-error-display'
      └─ ...
```

## Conflict Resolution

If deferred sub-feature has conflicts after main feature merges:

```bash
git checkout feature/0001c-future-work
git rebase main
# Resolve conflicts in editor
git add .
git rebase --continue
# Repeat until rebased successfully
git push -u origin feature/0001c-future-work --force
```

## Task File Updates

### Main Feature Task

```yaml
---
id: 0001
status: in-progress | done
linked_tasks: [0001a, 0001b]  # Sub-feature IDs
blocked_by: []
---
```

### Sub-Feature Task

```yaml
---
id: 0001a
status: in-progress | done | on-hold
parent: 0001  # Main feature ID
---
```

## Tips

- **Small sub-features** (1-2 hours each) are easier to manage
- **Linear history** = cleaner git log = easier debugging
- **Rebase before merge** = keep feature branch up to date with main
- **Conflicts early** = catch problems before final merge to main
- **Defer intentionally** = mark task as on-hold, not abandoned
