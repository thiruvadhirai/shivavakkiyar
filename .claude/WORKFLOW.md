# Development Workflow - Panchanga Calculator Project

**IMPORTANT**: This workflow is MANDATORY for all development. Not following it will result in:
- Broken tests in main branch
- Unclear commit history
- Missing version increments
- No traceability of changes

---

## 🚀 Quick Start

### Every Development Session Must Follow This Pattern:

```bash
# 1. START a feature branch
./scripts/feature-workflow.sh start feature-name

# 2. MAKE CHANGES
# Edit files, write code, etc.

# 3. RUN TESTS (BEFORE committing)
./scripts/feature-workflow.sh test

# 4. COMMIT CHANGES (using workflow script, NOT git commit)
./scripts/feature-workflow.sh commit "Your commit message"

# 5. REPEAT steps 2-4 until feature is complete

# 6. FINISH the feature (merge to main locally)
./scripts/feature-workflow.sh finish

# 7. PUSH to GitHub
./scripts/push-to-github.sh
```

---

## ⚠️ Golden Rules

### Rule 1: NEVER commit directly to main
❌ **WRONG:**
```bash
git add .
git commit -m "fix bug"
git push origin main
```

✅ **RIGHT:**
```bash
./scripts/feature-workflow.sh start fix-bug
# ... make changes ...
./scripts/feature-workflow.sh test
./scripts/feature-workflow.sh commit "fix bug"
./scripts/feature-workflow.sh finish
./scripts/push-to-github.sh
```

### Rule 2: ALWAYS test before committing
❌ **WRONG:**
```bash
./scripts/feature-workflow.sh commit "add feature"
```

✅ **RIGHT:**
```bash
./scripts/feature-workflow.sh test  # Run tests FIRST
./scripts/feature-workflow.sh commit "add feature"  # Then commit
```

### Rule 3: ALWAYS use workflow scripts for commits
❌ **WRONG:**
```bash
git add .
git commit -m "message"
```

✅ **RIGHT:**
```bash
./scripts/feature-workflow.sh commit "message"
```

### Rule 4: Commit frequently (don't pile up changes)
❌ **WRONG:**
```bash
# Make 10 changes, then commit everything at once
./scripts/feature-workflow.sh commit "many changes"
```

✅ **RIGHT:**
```bash
# Make 1-3 related changes
./scripts/feature-workflow.sh test
./scripts/feature-workflow.sh commit "specific change 1"

# Make 1-3 more related changes
./scripts/feature-workflow.sh test
./scripts/feature-workflow.sh commit "specific change 2"
```

---

## 📋 Detailed Steps

### Step 1: Start Feature Branch

```bash
./scripts/feature-workflow.sh start fix-widget-null-check
```

This:
- Creates branch: `feature/fix-widget-null-check`
- Checks out the new branch
- Verifies you're not on main

### Step 2: Make Changes

Edit files, write code, add tests. No restrictions here.

### Step 3: Run Tests BEFORE Committing

```bash
./scripts/feature-workflow.sh test
```

This runs:
- Unit tests: `node tests/panchanga-calculator.test.js`
- Integration tests: `node tests/panchanga-calculator-integration.test.js`

**MUST PASS before moving to step 4.** If tests fail:
1. Fix the code
2. Run tests again
3. Then commit

### Step 4: Commit with Workflow Script

```bash
./scripts/feature-workflow.sh commit "Fix null check in widget calculate button

- Add optional chaining to tithi.phase access
- Add null check for panchanga object
- Add try-catch in calculate button handler
- Prevent 'Cannot read properties of undefined' error"
```

This:
- Stages all changes
- Creates commit with your message
- Auto-increments VERSION file (minor version)
- Displays new version

Commit message format:
```
First line: What did you change (imperative)

Body (optional):
- Bullet list of specifics
- Why you made this change
- Links to related issues
```

### Step 5: Repeat 2-4 Until Feature Complete

For each logical chunk of work:
1. Make changes
2. Run tests
3. Commit

Don't pile up changes. Each commit should be related and testable.

### Step 6: Finish Feature (Merge to Main)

```bash
./scripts/feature-workflow.sh finish
```

This:
- Switches to main branch
- Merges your feature branch
- Displays merge summary
- Tells you to push next

### Step 7: Push to GitHub

```bash
./scripts/push-to-github.sh
```

This pushes all commits to GitHub.

---

## 🧪 Testing Requirements

### What Must Pass

**Before every commit**, all tests must pass:

```bash
# Unit tests (15/15 must pass)
node tests/panchanga-calculator.test.js

# Integration tests (70/70 must pass)
node tests/panchanga-calculator-integration.test.js
```

Both must show: ✅ ALL TESTS PASSED

### If Tests Fail

1. **Read the error message carefully**
2. **Fix the code** that caused the failure
3. **Run tests again**
4. **Only commit when tests pass**

Example:
```
❌ Test: Tithi calculation fails
   Expected: 15, Got: undefined

→ Fix code
→ Run tests again: ./scripts/feature-workflow.sh test
→ If passes: ./scripts/feature-workflow.sh commit "..."
```

### E2E Tests (Optional for Now)

E2E tests require browser binaries to be set up in Docker. Not required before commit, but good to run before push:

```bash
podman-compose --profile test up saivamcloud-test
```

---

## 📝 Commit Message Format

**Good commit messages are essential.** They help future developers (including you!) understand what changed and why.

### Format:

```
Verb: description of what changed

Body (optional, but recommended):
- Specific changes made
- Why this change was needed
- Side effects or related items

Examples:
- Add: New feature
- Fix: Bug fix
- Update/Enhance: Improvement to existing feature
- Refactor: Code reorganization (no behavior change)
- Test: Test additions or updates
- Docs: Documentation updates
```

### Examples:

**Good:**
```
Fix null check in widget calculate button

- Add optional chaining (?) to tithi.phase access
- Prevent 'Cannot read properties of undefined' crash
- Closes issue #47
```

**Good:**
```
Add E2E testing infrastructure with Playwright

- Implement 15 Playwright test cases
- Add containerized testing with Dockerfile.test
- Configure code coverage reporting
- All tests passing: 15/15
```

**Bad:**
```
fix stuff
```

**Bad:**
```
Add feature and fix bug and update docs and refactor code
```

---

## 🔄 Real Example: Complete Workflow

### Scenario: Fix the null check bug in widget

```bash
# 1. Start feature branch
$ ./scripts/feature-workflow.sh start fix-widget-null-check
Created branch: feature/fix-widget-null-check

# 2. Edit file (e.g., _includes/panchanga-widget-full.html)
$ vim _includes/panchanga-widget-full.html
# Change line 311 from:
#   p.tithi.phase.toUpperCase()
# To:
#   p?.tithi?.phase?.toUpperCase?.()

# 3. Run tests
$ ./scripts/feature-workflow.sh test
Running tests...
✅ All 15 unit tests passed
✅ All 70 integration tests passed

# 4. Commit change
$ ./scripts/feature-workflow.sh commit "Fix null check in widget calculate button

- Add optional chaining to tithi.phase access
- Prevents 'Cannot read properties of undefined' error
- Tests still passing: 15/15 unit + 70/70 integration"

✅ Commit successful!
New version: 1.0.0-beta.3

# 5. Do more work if needed
$ vim _includes/panchanga-widget-simple.html
# Make similar fix at line 344

# 6. Test again
$ ./scripts/feature-workflow.sh test
✅ All tests passed

# 7. Commit again
$ ./scripts/feature-workflow.sh commit "Fix null check in simple widget

- Update panchanga-widget-simple.html line 344
- Add optional chaining to phase access
- Consistent with full widget fix"

✅ Commit successful!
New version: 1.0.0-beta.4

# 8. Feature complete - finish
$ ./scripts/feature-workflow.sh finish
Merged feature/fix-widget-null-check to main
Ready to push to GitHub

# 9. Push to GitHub
$ ./scripts/push-to-github.sh
Pushing to GitHub...
✅ Pushed successfully!
```

---

## 🛑 If You Mess Up

### Committed directly to main?

```bash
# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Create feature branch with your changes
./scripts/feature-workflow.sh start fix-my-feature

# Now commit properly
./scripts/feature-workflow.sh test
./scripts/feature-workflow.sh commit "message"
```

### Forgot to test before committing?

```bash
# Check what failed
./scripts/feature-workflow.sh test

# Fix code
# (edit files)

# Test again
./scripts/feature-workflow.sh test

# If tests pass, you're good
# Just commit the fix
./scripts/feature-workflow.sh commit "fix test failures"
```

### Committed but want to change the message?

```bash
git commit --amend -m "Better message"
```

---

## 🚨 Warning Signs

If any of these are true, **STOP and re-read this guide**:

- [ ] Branch name is `main` (should be `feature/something`)
- [ ] Uncommitted changes exist before committing (should be clean)
- [ ] Test failures before committing (should be all passing)
- [ ] Using `git commit` directly instead of `./scripts/feature-workflow.sh commit`
- [ ] VERSION file hasn't changed after committing (should increment)
- [ ] Multiple unrelated changes in one commit (should be focused)

---

## 📚 Related Documentation

- **CLAUDE.md** - Project overview and architecture
- **SKILLS.md** - Technical skill documentation
- **TESTING.md** - Complete testing guide
- **.claude/config.json** - This workflow in machine-readable format

---

## ✅ Checklist Before Pushing to GitHub

- [ ] All commits are on feature branch (NOT main)
- [ ] All tests pass: `./scripts/feature-workflow.sh test`
- [ ] Feature branch merged to main: `./scripts/feature-workflow.sh finish`
- [ ] VERSION file incremented (check VERSION file)
- [ ] Commit messages are descriptive
- [ ] E2E tests checked (optional): `podman-compose --profile test up`
- [ ] Ready to push: `./scripts/push-to-github.sh`

**If ALL checkboxes are checked ✓, you're ready to push!**

---

## 🎯 Summary

**The Golden Rule: Feature Branch → Test → Commit → Finish → Push**

```
    ┌─ Create feature branch
    │
    ├─ Make changes (repeat 2-3x)
    │  ├─ Edit code
    │  ├─ Run tests (MUST PASS)
    │  └─ Commit changes
    │
    ├─ Merge to main locally
    │
    └─ Push to GitHub
```

**Follow this every single time. No exceptions.**
