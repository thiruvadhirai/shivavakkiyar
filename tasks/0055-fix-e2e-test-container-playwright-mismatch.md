---
id: 0055
title: "Fix: E2E test container Playwright browser revision mismatch"
status: in-progress
impact: High
priority: 020
complexity: "0.5 hours"
assignee: Claude
created: 2026-08-09
completed: (pending)
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
parent_task: (none)
linked_tasks: [0054]
blocked_by: []
related: []
---

# Description

Deviation task discovered while working on #0054 (content-only change). All
39 E2E tests failed with:

```
Error: browserType.launch: Executable doesn't exist at
/root/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell
```

Root cause: `Dockerfile.test` bind-mounts the full repo (including host
`node_modules`) over `/app` at runtime (`podman-compose.yml`, source-mounted
for fast iteration). At *build* time it ran
`npm install @playwright/test@latest playwright@latest`, which resolved to
1.62.1 (browser revision 1234) and baked those browsers into the image. But
at *runtime* the bind-mounted host `node_modules/@playwright/test` is pinned
to 1.60.0 via `package-lock.json` (browser revision 1223) — a revision never
installed in the image. Build-time deps and runtime deps silently diverged.

Not caused by, or related to, the #0054 content change (no JS/test files
touched there).

# Location / Context

- `Dockerfile.test` — changed `npm install @playwright/test@latest playwright@latest`
  to `COPY package.json package-lock.json ./` + `npm ci`, so the image
  installs the exact version pinned in the lockfile — the same one used at
  runtime via the bind mount.

# Acceptance Criteria

## Scenario: E2E suite runs against the correct browser revision
- **Given** the saivamcloud-test image is rebuilt from the fixed Dockerfile.test
- **When** `./scripts/feature-workflow.py test` runs the full suite
- **Then** no test fails with `browserType.launch: Executable doesn't exist`

# Test Plan

1. `podman-compose build saivamcloud-test`
2. `./scripts/feature-workflow.py test` — all unit + integration + E2E pass

# Dependencies

Discovered while completing #0054; fixing this unblocks that task's `finish`/merge.

# Notes

Deviation task per `tasks/TASK_WORKFLOW.md` — priority 020 (High, blocks a
pending merge) rather than default fixed priority.
