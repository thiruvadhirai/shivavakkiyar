---
id: 0051
title: Create branch cleanup script
status: done
impact: Maintenance
priority: 030
complexity: 15 minutes
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: []
---

## Problem Statement

Cleaning up git branches requires reading all branches, filtering, and manually constructing delete commands. This is error-prone and inefficient.

## Solution

Create a generic, reusable Python script `scripts/cleanup-branches.py` that:
- Automatically protects `main` and current branch
- Protects worktree branches automatically
- Provides `--dry-run` for safety
- Supports `--keep` flag for additional protected branches
- Handles remote-tracking branches with `--remote` flag
- Uses `PROJECT_ROOT` environment variable for portability

## Acceptance Criteria

- [x] Script created at `scripts/cleanup-branches.py`
- [x] Uses Python 3 (follows project rules)
- [x] Uses `PROJECT_ROOT` environment variable
- [x] Executable and tested with `--dry-run`
- [x] Protects main, current branch, and worktree branches
- [x] Has clear usage documentation
- [x] Handles errors gracefully

## Definition of Done

✅ Script is executable and tested  
✅ Follows Python-first mandate from `.claude/rules/scripts.md`  
✅ Portable across environments (PROJECT_ROOT support)  
✅ Committed with proper task reference
