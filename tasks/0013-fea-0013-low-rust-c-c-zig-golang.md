---
id: 0013
title: Add Optional LSP Support (Rust, C/C++, Zig, Go)
status: open
impact: Low
priority: 090
complexity: "1-2 hours per language"
assignee: Claude
created: 2026-05-30
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
linked_tasks: []
blocked_by: [0012]
related: []
---

# Description

Add Language Server Protocol (LSP) support for future languages: Rust, C/C++, Zig, and Go. These languages are not currently used in the project but are being considered for upcoming services. LSP support will be added as each service is introduced, ensuring developers have consistent IDE experience from day one.

This task is blocked by task 0012 (critical LSP support) — once the core workflow is established and tested with Python/JS/TS/Ruby, extending to new languages follows the same pattern.

# Location / Context

Future files to create/update (when services are added):
- `Cargo.toml` or `Cargo.lock` — Rust LSP dependencies
- `CMakeLists.txt` or `.cpp` config — C/C++ LSP dependencies
- `build.zig` or similar — Zig LSP dependencies
- `go.mod` or `go.sum` — Go LSP dependencies
- `.vscode/extensions.json` — Additional extension recommendations
- `.vscode/settings.json` — Language server configuration for each new language

# Acceptance Criteria

## Scenario: Rust LSP available when a Rust service is added
- **Given** a new Rust service directory is added to the project
- **When** a developer opens a .rs file in VS Code
- **Then** rust-analyzer provides autocomplete, type checking, and error highlighting

## Scenario: C/C++ LSP available when a C/C++ service is added
- **Given** a new C or C++ service directory is added
- **When** a developer opens a .c or .cpp file in VS Code
- **Then** clangd provides autocomplete and diagnostics

## Scenario: Zig LSP available when a Zig service is added
- **Given** a new Zig service directory is added
- **When** a developer opens a .zig file in VS Code
- **Then** zls provides autocomplete and type checking

## Scenario: Go LSP available when a Go service is added
- **Given** a new Go service directory is added
- **When** a developer opens a .go file in VS Code
- **Then** gopls provides autocomplete and type checking

## Scenario: Task is blocked until 0012 (critical LSP) is complete
- **Given** task 0012 is still open or in-progress
- **When** planning the next feature to implement
- **Then** this task (0013) is skipped — priority 090 + blocked_by: [0012]

# Test Plan

When implementing (after 0012):
1. Create a test Rust service directory with a .rs file
2. Open in VS Code → rust-analyzer should provide autocomplete
3. Repeat for C++, Zig, Go with appropriate test files
4. Verify no regression in existing Python/JS/TS/Ruby LSP support
5. Run `./scripts/feature-workflow.py test` → all tests pass

# Dependencies

- **Blocked by**: Task #0012 (critical LSP support must be established first)

# Estimated Time

1-2 hours per language (deferred until service is added)

# Notes

This is the **lowest priority task (priority 090)**. It will be implemented only after:
1. Task 0012 (critical LSP) is complete and verified
2. A new service using one of these languages is added to the project

Each language LSP can be implemented independently once the pattern is established in 0012.
