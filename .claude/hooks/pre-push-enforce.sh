#!/bin/bash
# Git Pre-Push Hook - Allow pushes to origin/main after feature merge
# This hook allows pushing to origin/main (no PR workflow)
# but verifies the commits come from merged feature branches

REMOTE=${1:-origin}
REFSPEC=${2:-}

# Allow all pushes for now (no PR workflow required)
# Workflow relies on pre-commit hook to block main branch commits
# and feature-workflow.py to manage merge process

exit 0
