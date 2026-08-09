---
id: 0054
title: Add Parkadal/Neelakantha story to Pradosha Kala pooja page
status: in-progress
impact: Low
priority: 070
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
linked_tasks: []
blocked_by: []
related: []
---

# Description

`pradoshakalapooja.md` explained *when* Pradosha Kalam occurs but not *why* this
specific twilight window on Triyodashi is sacred. Added the Samudra Manthan
(Parkadal) / Halahala poison / Shiva's blue throat (Neelakantha) story that
explains the mythological basis for the timing.

# Location / Context

- `pradoshakalapooja.md` — added a collapsed `<details>` section directly
  after the intro paragraph and before the "Calculate Your Pradosha Times"
  widget include.

# Acceptance Criteria

## Scenario: Visitor learns why Pradosha Kalam is significant
- **Given** a visitor on the Pradosha Kala pooja page
- **When** they load the page
- **Then** a collapsed section titled about Parkadal/Shiva's blue throat is visible above the calculator, collapsed by default

## Scenario: Visitor expands the story
- **Given** the collapsed section is present
- **When** the visitor clicks the summary
- **Then** the full story (Samudra Manthan, Halahala, Neelakantha, Ananda Tandavam, link to Triyodashi twilight) is shown

# Test Plan

1. Visual check: page renders with `<details>` collapsed by default (native HTML behavior, no JS/CSS dependency)
2. Confirm existing form IDs / widget markup (`#panchanga-simple-location-input`, etc.) untouched
3. `podman exec saivamcloud-test npm test` — confirm no regressions (content-only change, no JS touched)

# Dependencies

None.

# Estimated Time

0.5 hours

# Notes

Content-only addition using native `<details>/<summary>` — no new CSS or JS required, so widget null-safety and E2E selector contracts (`.claude/rules/widgets.md`) are unaffected.
