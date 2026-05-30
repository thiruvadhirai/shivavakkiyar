#!/usr/bin/env python3
"""
Git Pre-Commit Hook - Block commits to main branch

This hook prevents direct commits to main, enforcing feature branch workflow.

Auto-detects project venv:
- If ./venv exists → uses venv python
- Otherwise → uses system python (PATH)

Exit 0: Allow commit
Exit 1: Block commit
"""

import sys
import os
import subprocess
from pathlib import Path

def use_project_venv_if_available():
    """Re-execute using project venv python if available."""
    # Find project root (script is at .claude/hooks/pre-commit-enforce.py)
    script_dir = Path(__file__).parent.parent.parent
    venv_python = script_dir / "venv" / "bin" / "python3"

    # Only proceed if venv exists and we're not already using it
    if not venv_python.exists():
        return  # Project venv doesn't exist, use system python

    # Check if we're already using the venv python
    try:
        current_executable = Path(sys.executable).resolve()
        venv_executable = venv_python.resolve()
        if current_executable == venv_executable:
            return  # Already using venv python
    except Exception:
        return  # Can't resolve, use current python

    # Re-execute with venv python
    try:
        os.execv(str(venv_python), [str(venv_python)] + sys.argv)
    except Exception:
        # If execv fails, continue with current python
        pass

# Auto-detect and use project venv if available
use_project_venv_if_available()

def get_current_branch():
    """Get current git branch."""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except Exception:
        # If we can't get branch, allow (git might be broken)
        return None

def main():
    """Enforce feature branch requirement."""
    branch = get_current_branch()

    if not branch:
        # Can't determine branch, allow
        return 0

    # Allow commits on feature and requirement branches
    if branch.startswith(('feature/', 'requirement/')):
        return 0

    # Allow commits during merge operations
    if branch == 'MERGE_HEAD' or branch.startswith('merge-'):
        return 0

    # Block all commits to main
    if branch == 'main':
        error_message = """
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

Current branch: {branch}
Required: feature/* or merge commit from feature branch

"""
        print(error_message.format(branch=branch), file=sys.stderr)
        return 1

    # For other branches, allow (could be temporary or experimental)
    return 0

if __name__ == "__main__":
    sys.exit(main())
