# Tasks 3-7 Quick Implementation Checklist

## Overview
Complete implementation guide saved to: `IMPLEMENTATION_TASKS_3-7.md`

All code is provided. Just follow the steps below for each task.

---

## Task 3: Connect Modal to URL State
**File**: `_includes/panchanga-widget-full.html`

1. Find section: `expandBtn.onclick = () => { openModal(); };`
2. Replace with the comprehensive modal event handler code from `IMPLEMENTATION_TASKS_3-7.md` (Task 3, Step 1)
3. Also add E2E test code to `tests/e2e/panchangam.spec.js` (from Task 3 earlier)
4. Run tests: `./scripts/feature-workflow.py test`
5. Commit: `./scripts/feature-workflow.py commit "feat: Connect modal form to URL state..."`

---

## Task 4: Add Browser History & Back/Forward Navigation
**File**: `_includes/panchanga-widget-full.html`

1. Find section: `// Run auto-load on page load`
2. Add the `window.addEventListener('popstate', ...)` code BEFORE that line
3. Run tests: `./scripts/feature-workflow.py test`
4. Commit: `./scripts/feature-workflow.py commit "feat: Add browser history support..."`

---

## Task 5: Add Page Load Scenarios
**File**: `_includes/panchanga-widget-full.html`

1. Find function: `const autoLoadAndCalculate = async () => {`
2. Replace the entire function with updated code from Task 5
3. Run tests: `./scripts/feature-workflow.py test`
4. Commit: `./scripts/feature-workflow.py commit "feat: Add page load scenarios..."`

---

## Task 6: Add Complete Workflow E2E Tests
**File**: `tests/e2e/panchangam.spec.js`

1. Add the test.describe('Complete Workflow Tests', ...) block at end of file
2. Run tests: `./scripts/feature-workflow.py test`
3. Commit: `./scripts/feature-workflow.py commit "test: Add comprehensive E2E tests..."`

---

## Task 7: Final Testing & Verification
**Commands**:

```bash
# Run full test suite
./scripts/feature-workflow.py test

# Manual testing checklist (see IMPLEMENTATION_TASKS_3-7.md)

# Final commit
./scripts/feature-workflow.py commit "test: Verify all tests pass and no regressions..."

# Update task file status to "done" 
# Edit: tasks/0045-url-state-modal-panchangam.md
# Change: status: open → status: done

# Merge to main
./scripts/feature-workflow.py finish

# Push to GitHub
./scripts/push-to-github.py
```

---

## Important Notes

✅ **Follow project rules** (from `.claude/rules/general.md`):
- Use `./scripts/feature-workflow.py commit` (not `git commit`)
- Include "Fixes #0045" in commit messages
- No "Co-Authored-By:" footers
- All tests in container with `./scripts/feature-workflow.py test`

✅ **Test in container**:
```bash
./scripts/feature-workflow.py test
```

✅ **Commit format**:
```
./scripts/feature-workflow.py commit "Verb: description

- detail
- detail

Fixes #0045"
```

✅ **When all tasks complete**:
1. Update `tasks/0045-url-state-modal-panchangam.md`: status → done
2. `./scripts/feature-workflow.py finish` (merges to main)
3. `./scripts/push-to-github.py` (pushes to GitHub)

---

## Reference
- Implementation details: `IMPLEMENTATION_TASKS_3-7.md`
- Project rules: `.claude/rules/general.md`
- Feature workflow: `./scripts/feature-workflow.py --help`
