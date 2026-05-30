---
id: 0021
title: Build comprehensive artifact reference map for entire repo
status: open
impact: Documentation
priority: 015
complexity: "45-60 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: []
---

## Problem Statement

No single source of truth exists showing:
- Which task maps to which feature/spec document
- Which code files implement which specs
- Which test files cover which features
- How _data folder is used throughout the site
- Relationships between all markdown pages and their purpose

This makes onboarding slow and maintenance harder.

## Scope

Build a complete artifact inventory mapping:

### 1. Tasks → Features → Specs → Code → Tests
```
Task 0001 
  ├─ Feature: Widget Null-Safety Fix
  ├─ Spec: docs/widget-spec.md (lines X-Y)
  ├─ Implementation: assets/js/panchanga-calculator.js, _includes/panchanga-widget-simple.html
  ├─ Tests: tests/panchanga-calculator.test.js, tests/e2e.spec.js
  └─ Status: complete
```

### 2. All Markdown Pages Inventory
- Jekyll pages (panchanga.md, pradoshakalapooja.md, etc)
- Documentation pages (docs/*)
- Task files (tasks/*)
- Process docs (.claude/WORKFLOW.md, etc)
- Purpose, front matter, related tasks/specs for each

### 3. _data Folder Complete Assessment
- What files exist in _data/
- What each file contains and why
- Which templates/pages reference each data file
- Any unused or redundant data files

### 4. Delivery Format
Create `.claude/ARTIFACTS_MAP.md`:
- Markdown tables showing all relationships
- Indexed by task ID, feature name, and file type
- Cross-referenced links to actual files
- Summary statistics (total tasks, features, specs, pages)

## Acceptance Criteria

- [ ] All tasks (0001-0020+) listed with their artifacts
- [ ] All markdown pages catalogued with purpose/status
- [ ] _data folder fully assessed with usage map
- [ ] All interdependencies documented
- [ ] No orphaned documents or specs
- [ ] `.claude/ARTIFACTS_MAP.md` complete and verified

## Definition of Done

✅ Conditions met:
1. Comprehensive inventory created
2. All cross-references verified
3. No broken links in map
4. Can answer: "What task created this feature?" for any feature
5. Can answer: "What pages use this data file?" for any _data file

## Notes

This is a documentation/audit task. No code changes required, just inventory creation.
Focus on completeness and accuracy over speed.
