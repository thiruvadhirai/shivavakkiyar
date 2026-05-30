---
id: 0014
title: Fix Deprecated Ruby VSCode Extension Recommendation
status: open
impact: Medium
priority: 040
complexity: "less than 1 hour"
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

The .vscode/extensions.json recommends deprecated Ruby extensions (wingrunr21.vscode-ruby, rebornix.ruby) that display deprecation warnings in VSCode and recommend migration to the official Ruby LSP extension (Shopify.ruby-lsp). Update to recommend only the official, actively-maintained Ruby LSP extension.

# Location / Context

- `.vscode/extensions.json` — Lists recommended VSCode extensions
- `.vscode/settings.json` — May need updates for Ruby LSP configuration

# Acceptance Criteria

## Scenario: Only official Ruby LSP extension is recommended
- **Given** .vscode/extensions.json lists VSCode extensions
- **When** a developer opens the project in VSCode
- **Then** only "Shopify.ruby-lsp" is recommended (no deprecated extensions)

## Scenario: No deprecation warnings for Ruby extension
- **Given** a developer installs the recommended Ruby extension
- **When** VSCode loads the extension
- **Then** no deprecation warning is displayed

## Scenario: Ruby LSP works for Jekyll templates
- **Given** Shopify.ruby-lsp is installed
- **When** a developer opens a .rb file or .liquid template
- **Then** autocomplete, syntax highlighting, and linting work correctly

# Test Plan

1. Verify .vscode/extensions.json only contains "Shopify.ruby-lsp" for Ruby
2. Run tests: `./scripts/feature-workflow.py test` (should pass, no functional change)
3. Manually open .rb file in VSCode and verify Ruby LSP autocomplete works
4. Check for any deprecation warnings in VSCode extension panel

# Dependencies

- None (pure configuration fix)

# Estimated Time

Less than 1 hour

# Notes

- This is a configuration-only fix, no code changes
- All tests should continue to pass
- Removing deprecated extensions prevents VSCode deprecation warnings
- Shopify.ruby-lsp is the official, actively-maintained Ruby LSP extension
