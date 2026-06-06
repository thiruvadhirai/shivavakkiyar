---
id: 0012
title: Add Critical LSP Support (Python, JavaScript, TypeScript, Ruby)
status: done
impact: High
priority: 030
complexity: "2-3 hours"
assignee: Claude
created: 2026-05-30
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
linked_tasks: []
blocked_by: []
related: []
---

# Description

Add Language Server Protocol (LSP) support for the four critical languages used in this project: Python (backend scripts), JavaScript/TypeScript (frontend), and Ruby (Jekyll templates). This ensures all developers have consistent IDE experience (autocomplete, linting, formatting) when working on the project from Windows via remote-SSH to Ubuntu.

# Location / Context

Files to create/update:
- `requirements-dev.txt` — Python LSP dependencies
- `package.json` — JavaScript/TypeScript LSP dependencies
- `Gemfile` — Ruby LSP dependencies (if needed)
- `.vscode/extensions.json` — Extension recommendations
- `.vscode/settings.json` — Language server and formatter configuration

# Acceptance Criteria

## Scenario: Python LSP installed via requirements-dev.txt
- **Given** a developer clones the project on Ubuntu (remote-SSH from Windows)
- **When** they run `source venv/bin/activate && pip install -r requirements-dev.txt`
- **Then** `pylsp --version` succeeds and VS Code autocomplete works on .py files

## Scenario: JavaScript/TypeScript LSP installed via package.json
- **Given** a developer runs `npm install`
- **When** they open a .js or .ts file in VS Code
- **Then** eslint shows linting errors and typescript-language-server provides autocomplete

## Scenario: Ruby LSP available for Jekyll templates
- **Given** a developer has the project open in VS Code
- **When** they open a .rb file or a Liquid template (.html with Liquid)
- **Then** ruby-lsp provides syntax highlighting and basic autocomplete

## Scenario: VS Code auto-prompts for extensions on first open
- **Given** .vscode/extensions.json lists all required extensions
- **When** a developer opens the project folder via remote-SSH for the first time
- **Then** VS Code shows "Install recommended extensions?" prompt automatically

## Scenario: VS Code settings enforce correct formatters per language
- **Given** .vscode/settings.json specifies defaultFormatter per language
- **When** a developer saves a Python, JS, TS, or Ruby file
- **Then** the correct formatter runs automatically without manual configuration

## Scenario: All existing tests unaffected
- **Given** requirements-dev.txt and package.json updated with LSP deps
- **When** `./scripts/feature-workflow.py test` runs in container
- **Then** all 85 tests pass (LSP tools are host-side only, containers unaffected)

# Test Plan

1. Verify `requirements-dev.txt` includes python-lsp-server and pylsp-mypy
2. Verify `package.json` includes eslint and typescript-language-server
3. Verify `.vscode/extensions.json` exists with recommended extensions
4. Verify `.vscode/settings.json` configures formatters per language
5. Open Python, JS, TS, Ruby files in VS Code → autocomplete should work
6. Run `./scripts/feature-workflow.py test` → all 85 tests pass

# Dependencies

- None (critical LSP is foundational; task 0013 depends on this)

# Estimated Time

2-3 hours (setup + testing)

# Notes

Focus on the critical languages only (Python, JS, TS, Ruby). Go, Rust, C/C++, Zig are deferred to task 0013 (lowest priority).
