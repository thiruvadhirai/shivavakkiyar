---
id: 0056
title: "E2E tests flaky against live Nominatim geocoding (rate-limited)"
status: open
impact: Medium
priority: 050
complexity: "1-2 hours"
assignee: (unassigned)
created: 2026-08-09
completed: (pending)
raci:
  responsible: (todo)
  accountable: Vairam
  consulted: []
  informed: []
parent_task: (none)
linked_tasks: [0054, 0055]
blocked_by: []
related: []
---

# Description

After fixing #0055 (container image drift), 33/39 E2E tests pass. The
remaining 6 all depend on a location search resolving via the live Nominatim
API (e.g. typing "Chennai" and waiting for the Calculate button to enable).
They fail with either a 30s timeout waiting for the button to become enabled,
or a missing `locationid=` in the resulting URL.

Verified this is not a container network/DNS problem — a request to Nominatim
from inside `saivamcloud-test` succeeds (200) when a `User-Agent` header is
set. `CLAUDE.md` already documents Nominatim's own limit: **1 request/second**.
The E2E suite fires several geocoding searches across specs in quick
succession, which is consistent with hitting that limit mid-run and getting
throttled/blocked for the rest of the run.

# Location / Context

- `tests/e2e/panchangam.spec.js` (Modal Form Submission tests)
- `tests/e2e.spec.js` (Calculate button / results display tests)
- `assets/js/location-manager.js` — geocodeLocation() — where the live
  Nominatim call is made from the browser during tests
- See `docs/NOAA-SOLAR-REFERENCE.md` / `CLAUDE.md` "Nominatim Rate Limiting"
  section for the documented 1 req/sec constraint

# Acceptance Criteria

## Scenario: E2E suite passes reliably without live geocoding dependency
- **Given** the full E2E suite runs in the test container
- **When** multiple tests each search a location via Nominatim
- **Then** none fail due to rate limiting or network flakiness against the live API

# Test Plan

1. Run `./scripts/feature-workflow.py test` several times in a row and see if
   failures are consistent (same 6) or vary (confirms flakiness vs. a real bug)
2. Consider: mock/stub Nominatim responses in E2E tests, add request spacing
   between geocoding-dependent specs, or reuse a single resolved location
   across tests via the existing localStorage cache instead of re-searching

# Dependencies

Builds on #0055 (container fixes) which unblocked E2E entirely.

# Notes

Deviation task discovered while validating #0054 (unrelated content-only
change). Not a regression — pre-existing test fragility against a
rate-limited third-party API.
