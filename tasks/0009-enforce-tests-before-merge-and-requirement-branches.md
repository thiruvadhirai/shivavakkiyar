---
id: 0009
title: Enforce Tests Before Merge & Add Requirement Branch Pattern
status: open
impact: Critical
priority: P1
complexity: "3-4 hours"
assignee: Claude
created: 2026-05-30
linked_tasks: [0008]
---

# Description

Two critical workflow enhancements in one task:

## 1. Fix Tests-Before-Merge (Bug Fix)

**Current (WRONG):**
- Commit on feature branch
- Finish (merge to main)
- Test (too late, already merged) ❌

**Fix:**
- Commit on feature branch
- Finish command automatically runs tests
- If tests FAIL → block merge, stay on feature branch
- If tests PASS → merge to main ✅

## 2. Add Requirement Branch Pattern (New Feature)

Separate requirements from implementation:

**Workflow:**
```
MAIN BRANCH
    ↓
[1] requirement/* branch
    - Create task file (with task ID in commit)
    - Define feature/spec
    - NO auto-test required (just spec)
    - Merge to main
    ↓
[2] feature/* branch
    - Implement based on requirement
    - Auto-run tests before merge
    - Merge to main
    ↓
[3] Sub-feature (if needed)
    - Create requirement/* for sub-feature
    - Commit to requirement branch
    - Merge to main
    - Create feature/*-a (sub-feature) branch
    - Auto-run tests before merge
```

**Important:** Task files are committed on requirement branches, not main. The pre-commit hook blocks main commits.

## Implementation Details

### Part 1: Auto-Run Tests in Finish

Modify `scripts/feature-workflow.py`:

**New method:** `run_tests_silent()` - returns True/False  
**Modify:** `cmd_finish()` - auto-run tests before merge

```python
def run_tests_silent(self):
    """Run tests silently, return True if pass."""
    try:
        result = subprocess.run(
            "podman exec saivamcloud-test npm test",
            shell=True,
            capture_output=True,
            timeout=300
        )
        return result.returncode == 0
    except Exception:
        return False

def cmd_finish(self):
    """Finish feature branch - AUTO-RUN TESTS BEFORE MERGE."""
    current_branch = self.get_current_branch()
    
    # Validate feature branch
    if not current_branch.startswith("feature/"):
        self.log(f"Error: Must be on feature/* branch", RED)
        sys.exit(1)
    
    # ✅ NEW: Auto-run tests BEFORE merge
    self.log("Running tests before merge...", BLUE)
    print()
    
    if not self.run_tests_silent():
        self.log("❌ Tests FAILED - merge blocked", RED)
        print()
        self.log("Fix failing tests:", YELLOW)
        print("  1. Make fixes on feature branch")
        print("  2. Commit: ./scripts/feature-workflow.py commit '...'")
        print("  3. Finish: ./scripts/feature-workflow.py finish")
        return  # Block merge
    
    self.log("✅ Tests PASSED - proceeding with merge", GREEN)
    print()
    
    # Continue with existing finish logic...
```

### Part 2: Requirement Branch Support

Add to `scripts/feature-workflow.py`:

**New command:** `./scripts/feature-workflow.py requirement <name>`

```python
def cmd_requirement(self, req_name):
    """Start a requirement branch (requirement/*)."""
    if not req_name:
        self.log("Error: Requirement name required", RED)
        sys.exit(1)
    
    requirement_branch = f"requirement/{req_name}"
    current_branch = self.get_current_branch()
    
    # Must be on main to create requirement
    if current_branch != self.main_branch:
        self.log("Switching to main first...", YELLOW)
        self.run_command(f"git checkout {self.main_branch}")
    
    # Create requirement branch
    self.log(f"Creating requirement branch: {requirement_branch}", BLUE)
    self.run_command(f"git checkout -b {requirement_branch}")
    
    self.log(f"✅ Switched to: {requirement_branch}", GREEN)
    print()
    self.log("Next steps:", YELLOW)
    print("  1. Create task file: tasks/000X-description.md")
    print("  2. Document requirements/spec")
    print("  3. Commit: ./scripts/feature-workflow.py commit '...'")
    print("  4. Finish: ./scripts/feature-workflow.py requirement finish")
```

**New command:** `./scripts/feature-workflow.py requirement finish`

```python
def cmd_requirement_finish(self):
    """Merge requirement to main (no tests required)."""
    current_branch = self.get_current_branch()
    
    if not current_branch.startswith("requirement/"):
        self.log("Error: Not on requirement/* branch", RED)
        sys.exit(1)
    
    self.log(f"Finishing requirement: {current_branch}", BLUE)
    print()
    print("Commits to merge:")
    commits = self.run_command(
        f"git log main...HEAD --oneline",
        capture=True
    )
    for line in commits.split('\n'):
        if line:
            print(f"  {line}")
    
    print()
    response = input("Continue? (y/n) ").strip().lower()
    if response != 'y':
        return
    
    # Merge to main (no tests for requirement branches)
    self.run_command("git checkout main")
    self.run_command(f'git merge "{current_branch}" -m "Merge {current_branch} into main"')
    self.run_command(f"git branch -d {current_branch}")
    
    self.log("✅ Merged successfully", GREEN)
    print()
    self.log("Next: Create feature branch to implement", YELLOW)
    print("  ./scripts/feature-workflow.py start 000X-description")
```

### Update Help Text

Add requirement commands to usage:

```python
print("  requirement <name>    - Create requirement branch")
print("  requirement finish    - Merge requirement to main (no tests)")
```

## Usage Workflow

### Step 1: Create Requirement (on requirement/* branch)
```bash
./scripts/feature-workflow.py requirement 0009-tests-and-requirements

# Now on requirement/0009-tests-and-requirements
# Create: tasks/0009-enforce-tests-before-merge-and-requirement-branches.md

./scripts/feature-workflow.py commit "Task: Define requirement #0009"
./scripts/feature-workflow.py requirement finish

# Back on main with task file committed
```

### Step 2: Implement Feature (on feature/* branch)
```bash
./scripts/feature-workflow.py start 0009-tests-and-requirements

# Now on feature/0009-tests-and-requirements
# Edit: scripts/feature-workflow.py (add auto-test + requirement support)

./scripts/feature-workflow.py commit "Implement: Auto-test + requirement branches #0009"
./scripts/feature-workflow.py finish  # ← Auto-runs tests, blocks if fail

# Back on main with feature merged
```

### Step 3: Push to GitHub
```bash
./scripts/push-to-github.py
```

## Acceptance Criteria

✅ Requirement branches created with `requirement <name>`  
✅ Task files committed on requirement branches (with task ID)  
✅ `requirement finish` merges to main (no tests required)  
✅ Feature branches auto-run tests before merge  
✅ Feature merge blocked if tests fail  
✅ Pre-commit hook enforces branch discipline (no main commits)  
✅ All 85 tests still passing  
✅ Workflow documentation updated  

## Workflow Rules Enforced

1. **Nothing commits to main** (pre-commit hook blocks it)
2. **Requirements defined first** (requirement/* branches)
3. **Implementation follows spec** (feature/* branches)
4. **Tests always before merge** (feature branch auto-test)
5. **Sub-features follow same pattern** (requirement/* + feature/*)

---

**Complete enforcement system: spec → code → test → merge**

No bypassing possible - every step is enforced at tool level.
