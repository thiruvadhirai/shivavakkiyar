#!/usr/bin/env python3
"""
Git Pre-Commit Hook - Block commits to main branch

This hook prevents direct commits to main, enforcing feature branch workflow.
Exit 0: Allow commit
Exit 1: Block commit
"""

import sys
import subprocess

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

    # Allow commits on feature branches
    if branch.startswith('feature/'):
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
