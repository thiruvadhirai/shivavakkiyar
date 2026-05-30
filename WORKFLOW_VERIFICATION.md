# Workflow Verification & Complete Flow Documentation

This document ensures the entire task-driven development workflow works correctly end-to-end.

---

## Complete Workflow Flow (Start to Push)

### Phase 1: Planning (Before Code)

1. **Create task file**: `tasks/NNNN-kebab-case.md`
   - ID, title, status, impact, priority (P1-P5)
   - RACI matrix (Responsible, Accountable, Consulted, Informed)
   - Acceptance criteria (becomes tests)
   - Complexity estimate (<4 hours recommended)
   - Dependencies

   See: `tasks/TASK_WORKFLOW.md` + `.claude/skills/task-planning/SKILL.md`

2. **Example task**: 
   ```yaml
   ---
   id: 0001
   title: Fix Widget Null-Check Crashes
   status: open
   impact: Critical
   priority: 010
   complexity: "1-2 hours"
   assignee: dev-name
   raci:
     responsible: dev-name
     accountable: tech-lead
   ---
   ```

### Phase 2: Feature Branch Setup

```bash
./scripts/feature-workflow.sh start 0001-fix-widget-null-checks
```

**What happens automatically:**
- Creates `feature/0001-fix-widget-null-checks` from main
- Installs pre-commit hook (`scripts/setup-hooks.sh`)
- Displays version and next steps

**Hook installed**: `scripts/hooks/pre-commit` validates:
- ✅ Task ID reference (`#0001`, `Fixes #0001`, etc.)
- ✅ Version auto-increment
- ✅ No direct commits to main without task ID

### Phase 3: TDD Loop (Repeat Until Done)

#### Step 3a: Write Test
```javascript
// In tests/panchanga-calculator.test.js
tests.push({
  name: 'Widget handles undefined panchanga',
  test: () => {
    const p = undefined;
    const phase = p?.tithi?.phase?.toUpperCase?.() ?? 'N/A';
    assertEqual(phase, 'N/A');
  }
});
```

Source: `.claude/skills/tdd/SKILL.md`

#### Step 3b: Run Tests in Container
```bash
./scripts/feature-workflow.sh test
```

**What happens:**
- Verifies dev container running: `saivamcloud-dev`
- Starts test container if needed: `saivamcloud-test`
- Runs tests: `npm test` (15 unit + 70 integration)
- Validates 100% test pass OR documents coverage override reason
- Reports results

**Coverage requirement:**
- All tests must PASS (85/85)
- Coverage gaps documented with reason tag: `@coverage-override: reason-here`

**Must FAIL if:**
- Tests fail (compilation error, assertion failure)
- Container not running
- Test framework broken

#### Step 3c: Implement Code
```javascript
// In widget HTML or JavaScript
const phase = p?.tithi?.phase?.toUpperCase?.() ?? 'N/A';  // Safe
```

#### Step 3d: Run Tests Again
```bash
./scripts/feature-workflow.sh test
# ✅ All tests passed
```

### Phase 4: Commit (With Task ID)

```bash
./scripts/feature-workflow.sh commit "Fix: Widget null-check crashes

- Add optional chaining to tithi.phase access
- Handle undefined panchanga gracefully
- All 85 tests passing

Fixes #0001"
```

**What happens:**
1. Stages all changes: `git add -A`
2. Pre-commit hook runs:
   - ✅ Validates task ID present (`#0001`)
   - ✅ Increments VERSION: `1.0.0-beta.2` → `1.0.0-beta.3`
   - ✅ Stages VERSION change
3. Creates commit with your message
4. Reports new version

**Hook blocks if:**
- No task ID in message → Error, commit fails, must re-run with task ID
- (Other hook errors listed below)

**Repeat steps 3a-4** as needed until all acceptance criteria met.

### Phase 5: Merge to Main

```bash
./scripts/feature-workflow.sh finish
```

**What happens:**
1. Lists commits to merge
2. Asks for confirmation
3. Switches to main
4. **Fast-forward merge** (no new commit, so hook doesn't apply)
5. Deletes feature branch
6. Reports success

**Result**: Linear git history, all commits have task IDs

### Phase 6: Push to GitHub

```bash
./scripts/push-to-github.sh
```

**What happens:**
1. Verifies on main branch
2. Shows commits to push
3. Asks for confirmation
4. Pushes to `origin/main`
5. Reports success

**No new commits created** (just pushing existing ones)

---

## Workflow Rules & Where They're Documented

| Rule | Where Enforced | Where Documented |
|------|---|---|
| Always use feature branches | `.claude/rules/general.md` | `.claude/rules/git-workflow.md` |
| Task ID in commits | Pre-commit hook (`scripts/hooks/pre-commit`) | `.claude/rules/general.md` |
| All tests pass | `feature-workflow.sh test` | `.claude/rules/testing.md` |
| Container-only tests | Permissions (`settings.json`) | `.claude/rules/testing.md` |
| Version auto-increment | Pre-commit hook | `.claude/rules/general.md` |
| TDD pattern | `.claude/skills/tdd/SKILL.md` | Task acceptance criteria |
| Task-first workflow | `.claude/skills/task-planning/SKILL.md` | `tasks/TASK_WORKFLOW.md` |
| Hierarchical branches | `.claude/skills/feature-workflow/SKILL.md` | `.claude/rules/git-workflow.md` |

---

## Failure Scenarios & Expected Behavior

### ❌ Commit without task ID

**Scenario**: Run `git commit -m "Fix stuff"`

**Expected**: Pre-commit hook blocks
```
❌ Commit message must reference a task ID
Valid patterns:
  - Fixes #0001
  - Task #0001
  - Fix: description ... Fixes #0001

Your commit message:
  Fix stuff
```

**What to do**: Re-run with task ID
```bash
git commit --amend -m "Fix: Widget null-check crashes

Fixes #0001"
```

---

### ❌ Test fails

**Scenario**: Run `./scripts/feature-workflow.sh test` → test fails

**Expected**: Error reported
```
❌ Tests failed!

FAIL: Widget handles undefined
  Expected: N/A
  Got: undefined
```

**What to do**:
1. Fix code (implement the feature)
2. Re-run: `./scripts/feature-workflow.sh test`
3. Verify all 85 tests pass
4. Then commit

---

### ❌ Container not running

**Scenario**: Run `./scripts/feature-workflow.sh test` → container missing

**Expected**: Auto-starts containers
```
Starting dev container...
Starting test container...
Running tests...
✅ All tests passed!
```

**What to do**: Nothing—workflow script handles it

---

### ❌ Coverage gap (100% not achievable)

**Scenario**: Test file has unreachable code path (e.g., fallback for missing browser API)

**Expected**: Document with override tag
```javascript
// In test file, near the gap:
// @coverage-override: Astronomy Engine fallback - can't test in Node.js
const sunLon = astronomyEngine?.getSunLongitude?.() ?? fallbackFormula();
```

**What to do**:
1. Add tag with reason
2. Tests still pass (85/85)
3. Document in code comment
4. Commit normally

---

## Commit History Verification

After pushing, verify linear history:

```bash
git log --oneline -10
```

**Expected output**:
```
abc1234 Fix: Widget null-check crashes (Fixes #0001)
def5678 Add: Task workflow system (Fixes #0002)
ghi9012 Add: Claude Code native structure (Fixes #0002)
...
```

**✅ Good**: Every commit has task ID, no merge commits

**❌ Bad**: 
- Commit without task ID: `abc1234 Fix stuff`
- Merge commit: `Merge branch 'feature/0001' into main`

---

## End-to-End Test (Full Workflow)

To verify the entire workflow works:

```bash
# 1. Create task
# (Create tasks/9999-test-workflow.md)

# 2. Start feature branch
./scripts/feature-workflow.sh start 9999-test-workflow

# 3. Verify hook installed
ls -la .git/hooks/pre-commit

# 4. Make a change
echo "// test" >> assets/js/test.js

# 5. Try commit without task ID (should fail)
git commit -m "Test"  # ❌ Should be blocked

# 6. Commit with task ID (should pass)
./scripts/feature-workflow.sh commit "Test workflow

- Verify end-to-end
- All components working

Fixes #9999"  # ✅ Should succeed

# 7. Run tests
./scripts/feature-workflow.sh test  # ✅ All 85 pass

# 8. Merge to main
./scripts/feature-workflow.sh finish  # ✅ Merged

# 9. Verify linear history
git log --oneline -3

# 10. Push to GitHub
./scripts/push-to-github.sh  # ✅ Pushed
```

---

## All Rules Work Together

**Task File** (`tasks/NNNN-....md`)
  ↓
  Creates acceptance criteria (becomes tests)
  ↓
**Feature Branch** (`feature/NNNN-...`)
  ↓
  Installs hook (`scripts/hooks/pre-commit`)
  ↓
**TDD Loop** (Write test → Code → Pass)
  ↓
  Requires tests to pass
  ↓
**Commit** (With task ID)
  ↓
  Pre-commit hook validates: `#NNNN` + version increment
  ↓
**Merge** (Fast-forward, no new commit)
  ↓
  Linear history maintained
  ↓
**Push** (To GitHub)
  ↓
  All commits have task IDs in linear history

---

## If Workflow Fails

If any of these break, it's a **Claude CLI bug** (not user error):

1. ❌ Hook not installed on `feature-workflow.sh start`
2. ❌ Tests don't run in container via workflow script
3. ❌ VERSION not incremented on commit
4. ❌ Merge creates new commit instead of fast-forward
5. ❌ Push fails after merge
6. ❌ Task ID validation doesn't block commits

**Report these as bugs** with:
- Exact command that failed
- Error message from workflow script
- Git log showing result
- Container status (`podman ps`)

---

## Summary Checklist

Before pushing to GitHub, verify:

- [ ] Task file exists: `tasks/NNNN-...md`
- [ ] Feature branch created: `feature/NNNN-...`
- [ ] Hook installed: `ls -la .git/hooks/pre-commit`
- [ ] All tests pass: 85/85 ✅
- [ ] Coverage gaps documented with `@coverage-override`
- [ ] All commits have task IDs: `git log --oneline`
- [ ] No merge commits (linear history)
- [ ] VERSION incremented
- [ ] Feature branch merged to main
- [ ] Pushed to GitHub: `git push`

**Then**: Feature is shipped and available on main
