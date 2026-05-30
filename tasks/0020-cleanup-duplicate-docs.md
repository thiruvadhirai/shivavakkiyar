---
id: 0020
title: Clean up duplicate documentation in .claude/ and root
status: open
impact: Maintenance
priority: 020
complexity: "30-45 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: []
---

## Problem Statement

The `.claude/` and root directories contain duplicate workflow, testing, and skills documentation from previous iterations. These create:
- Confusion about which documents are canonical/current
- Context window bloat when loading all docs
- Difficulty finding the right documentation
- Maintenance burden (updates needed in multiple places)

## Investigation Results

**Duplicates identified:**
1. `WORKFLOW_VERIFICATION.md` (root) - Duplicates `.claude/WORKFLOW.md`
2. `WORKFLOW_IMPLEMENTATION_SUMMARY.md` (root) - Historical artifact (dated 2026-05-29)
3. `SKILLS.md` (root) - Superseded by `.claude/SKILLS.md`
4. `TEST_RESULTS.md` (root) - Static snapshot, not maintained
5. `.claude/config.json` - Version mismatch, superseded by settings.json
6. `.claude/RESTRUCTURING_PLAN.md` - Completed plan artifact

**Files to assess:**
- `TESTING_CHECKLIST.md` - Verify accuracy before deletion
- `.claude/features.json` - Check if still actively maintained
- `.claude/architecture.md` - Check if referenced
- `.claude/file-impacts.md` - Check if referenced
- `KNOWN_ISSUES.md` - Decide: keep separate or merge

**Files that ARE canonical (keep):**
- `.claude/rules/` (5 files) - Path-scoped rules
- `.claude/WORKFLOW.md` - Main workflow
- `.claude/ITERATION_WORKFLOW.md` - BA clarification workflow
- `.claude/settings.json` - Permissions & hooks
- `CLAUDE.md` (root) - Master project documentation

## Acceptance Criteria

- [ ] Investigation complete on all 5 "assess" files
- [ ] Decision made on each file (keep/delete/merge)
- [ ] All files to delete identified and approved
- [ ] No references to deleted files in CLAUDE.md, rules, or workflows
- [ ] `scripts/claudeinvestigate/findjsonfiles.sh` added to source control

## Tasks Breakdown

### Phase 1: Assessment (5 min)
1. Review content of `TESTING_CHECKLIST.md` - is it accurate/useful?
2. Review `features.json` - still maintained? Still useful?
3. Check `.claude/architecture.md` - referenced anywhere?
4. Check `.claude/file-impacts.md` - referenced anywhere?
5. Decision on `KNOWN_ISSUES.md` - keep separate or merge?

### Phase 2: Mark for Deletion (Clear decisions)
Create a list of files approved for deletion:
- Phase 1 "confident delete" (above)
- Phase 2 assessment decisions

### Phase 3: Verify No References (Safety check)
Grep for references to files marked for deletion in:
- CLAUDE.md
- .claude/rules/* files
- .claude/WORKFLOW.md
- .claude/ITERATION_WORKFLOW.md
- package.json
- Any other docs

### Phase 4: Execute Deletion
Delete approved files, commit with task ID

### Phase 5: Add Investigation Script to Source Control
- `scripts/claudeinvestigate/findjsonfiles.sh` - Already created, needs to be committed

### Phase 6: Verify
- Run: `./scripts/feature-workflow.py test` - Ensure tests pass
- Manual verification: Documentation is accessible and not broken

## Definition of Done

✅ All conditions met:
1. Assessment complete on 5 files with documented decisions
2. All confident-delete files removed
3. No broken links or references
4. Tests still passing
5. Investigation script committed to repo
6. New devs can easily find workflow/testing docs

## Investigation Script Location

`scripts/claudeinvestigate/findjsonfiles.sh` - Created 2026-05-30, ready for commit

See: `CLEANUP_ACTION_PLAN.md` (detailed analysis of each file)

## Notes

- This is a maintenance task, no feature changes
- Safe to delete once references verified
- All .claude/rules/ files are SACRED - do not modify unless necessary
- CLAUDE.md is the master reference - keep it updated
