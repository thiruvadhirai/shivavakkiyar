#!/usr/bin/env python3
"""
Git Pre-Push Hook - Allow pushes to origin/main after feature merge

This hook allows pushing to origin/main (no PR workflow required).
Workflow relies on pre-commit hook to block main branch commits
and feature-workflow.py to manage merge process.

Exit 0: Allow push
Exit 1: Block push
"""

import sys

def main():
    """Allow all pushes (no PR workflow required)."""
    # No restrictions - workflow enforcement happens at:
    # 1. Pre-commit: blocks commits to main
    # 2. feature-workflow.py: manages merging to main
    # 3. UserPromptSubmit: blocks prompts without task ID

    # Therefore, all pushes to origin/main are safe
    return 0

if __name__ == "__main__":
    sys.exit(main())
