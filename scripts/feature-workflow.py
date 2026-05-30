#!/usr/bin/env python3
"""
Feature Branch Workflow Management for Python
Replaces feature-workflow.sh with Python3 for better cross-platform support

Usage:
    ./scripts/feature-workflow.py start <feature-name>
    ./scripts/feature-workflow.py test
    ./scripts/feature-workflow.py commit "<message>"
    ./scripts/feature-workflow.py finish
    ./scripts/feature-workflow.py status
    ./scripts/feature-workflow.py list
    ./scripts/feature-workflow.py requirement <requirement-name> [--sub-of <task-id>] [--depends-on <task-id>] [--blocks <task-id>]
    ./scripts/feature-workflow.py requirement finish
    ./scripts/feature-workflow.py requirement list

Commands:
    start <name>           - Create and switch to feature/name branch
    status                 - Show current branch and version
    test                   - Run unit tests in container
    commit <msg>           - Commit changes (auto-increments version via hook)
    list                   - List all feature branches
    finish                 - Auto-run tests, merge feature to main and delete feature branch
    clean                  - Delete all feature branches except current
    requirement <name>     - Create requirement branch with auto-generated BDD task file
                            Options:
                              --sub-of <task-id>     - This is a sub-requirement of another task
                              --depends-on <task-id> - This task is blocked by another (add to blocked_by)
                              --blocks <task-id>     - This task unblocks another (note in task file)
    requirement finish     - Merge requirement to main (no tests required)
    requirement list       - Show active requirement branches and dependency tree
"""

import os
import sys
import subprocess
import re
from pathlib import Path
from datetime import date

# Colors
GREEN = '\033[0;32m'
BLUE = '\033[0;34m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
NC = '\033[0m'


class WorkflowManager:
    """Manage feature branch workflow."""

    def __init__(self):
        self.main_branch = "main"
        self.version_file = Path("VERSION")

    def log(self, message, color=NC):
        """Print colored message."""
        print(f"{color}{message}{NC}")

    def run_command(self, cmd, check=True, capture=False):
        """Run shell command."""
        try:
            if capture:
                result = subprocess.run(
                    cmd, shell=True, check=check, capture_output=True, text=True
                )
                return result.stdout.strip()
            else:
                subprocess.run(cmd, shell=True, check=check)
                return None
        except subprocess.CalledProcessError as e:
            self.log(f"❌ Command failed: {cmd}", RED)
            raise

    def get_current_branch(self):
        """Get current git branch."""
        return self.run_command(
            "git rev-parse --abbrev-ref HEAD", capture=True
        )

    def get_current_version(self):
        """Get current version from VERSION file."""
        if self.version_file.exists():
            return self.version_file.read_text().strip()
        return "unknown"

    def branch_exists(self, branch_name):
        """Check if branch exists."""
        result = self.run_command(
            f"git show-ref --quiet refs/heads/{branch_name}",
            check=False
        )
        return result is None or result == ""

    def cmd_start(self, feature_name):
        """Start a feature branch."""
        if not feature_name:
            self.log("Error: Feature name required", RED)
            self.log("Usage: ./scripts/feature-workflow.py start <feature-name>")
            sys.exit(1)

        feature_branch = f"feature/{feature_name}"
        current_branch = self.get_current_branch()

        if current_branch != self.main_branch:
            self.log(
                f"Warning: Not on {self.main_branch} branch. Switching to {self.main_branch} first...",
                YELLOW
            )
            self.run_command(f"git checkout {self.main_branch}")
            self.run_command(f"git pull origin {self.main_branch}")

        if self.branch_exists(feature_branch):
            self.log(
                "Feature branch already exists. Switching to it...",
                YELLOW
            )
            self.run_command(f"git checkout {feature_branch}")
        else:
            self.log(f"Creating feature branch: {feature_branch}", BLUE)
            self.run_command(f"git checkout -b {feature_branch}")

        # Install/update git hooks
        self.setup_hooks()

        self.log(f"✅ Switched to: {feature_branch}", GREEN)
        self.log(f"   Version: {self.get_current_version()}")
        print()
        self.log("Next steps:", YELLOW)
        print("  1. Make code changes")
        print("  2. Run: ./scripts/feature-workflow.py test")
        print("  3. Run: ./scripts/feature-workflow.py commit 'message'")
        print("  4. Repeat 1-3 as needed")
        print("  5. Run: ./scripts/feature-workflow.py finish")

    def cmd_test(self):
        """Run tests in container."""
        self.log("Running tests in saivamcloud-test container...", BLUE)
        print()

        # Check test file exists
        if not Path("tests/panchanga-calculator.test.js").exists():
            self.log(
                "Error: Test file not found: tests/panchanga-calculator.test.js",
                RED
            )
            sys.exit(1)

        # Start containers if needed
        try:
            dev_running = "saivamcloud-dev" in self.run_command(
                "podman ps --format '{{.Names}}'", capture=True
            )
            if not dev_running:
                self.log("Starting dev container...", YELLOW)
                self.run_command("podman-compose up -d saivamcloud-dev")

            test_running = "saivamcloud-test" in self.run_command(
                "podman ps --format '{{.Names}}'", capture=True
            )
            if not test_running:
                self.log("Starting test container...", YELLOW)
                self.run_command("podman-compose --profile test up -d saivamcloud-test")

            # Run tests
            self.run_command("podman exec saivamcloud-test npm test")
            print()
            self.log("✅ All tests passed!", GREEN)

        except subprocess.CalledProcessError:
            print()
            self.log("❌ Tests failed!", RED)
            sys.exit(1)

    def cmd_commit(self, message):
        """Commit changes."""
        if not message:
            self.log("Error: Commit message required", RED)
            self.log("Usage: ./scripts/feature-workflow.py commit 'Your message'")
            sys.exit(1)

        current_branch = self.get_current_branch()
        if current_branch == self.main_branch:
            self.log("Error: Cannot commit directly to main branch", RED)
            self.log("Use: ./scripts/feature-workflow.py start <feature-name>")
            sys.exit(1)

        self.log("Staging and committing changes...", BLUE)

        # Stage all changes
        self.run_command("git add -A")

        # Show what will be committed
        print()
        print("Changes to commit:")
        self.run_command("git diff --cached --stat")

        print()
        self.log("Committing...", BLUE)

        # Commit with message
        try:
            self.run_command(f'git commit -m "{message}"')
        except subprocess.CalledProcessError:
            self.log("Commit failed", RED)
            sys.exit(1)

        # Show new version
        new_version = self.get_current_version()
        print()
        self.log("✅ Commit successful!", GREEN)
        self.log(f"   New version: {new_version}")

    def run_tests_silent(self):
        """Run tests silently, return True if pass, False if fail."""
        try:
            result = subprocess.run(
                "podman exec saivamcloud-test npm test",
                shell=True,
                capture_output=True,
                timeout=300,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False

    def cmd_finish(self):
        """Finish feature branch - AUTO-RUN TESTS BEFORE MERGE."""
        current_branch = self.get_current_branch()

        if current_branch == self.main_branch:
            self.log("Error: Already on main branch", RED)
            sys.exit(1)

        if not current_branch.startswith("feature/"):
            self.log(f"Error: Not on a feature branch", RED)
            self.log(f"Current branch: {current_branch}")
            sys.exit(1)

        self.log(f"Finishing feature branch: {current_branch}", BLUE)
        print()

        # Auto-run tests BEFORE merge
        self.log("Running tests before merge...", BLUE)
        print()

        if not self.run_tests_silent():
            self.log("❌ Tests FAILED - merge blocked", RED)
            print()
            self.log("Fix failing tests and try again:", YELLOW)
            print("  1. Make fixes on feature branch")
            print("  2. Run: ./scripts/feature-workflow.py commit '...'")
            print("  3. Run: ./scripts/feature-workflow.py finish")
            return

        self.log("✅ Tests PASSED - proceeding with merge", GREEN)
        print()

        # Show commits to be merged
        print("Commits to merge:")
        commits = self.run_command(
            f"git log {self.main_branch}...HEAD --oneline",
            capture=True
        )
        for line in commits.split('\n'):
            if line:
                print(f"  {line}")

        print()
        response = input("Continue? (y/n) ").strip().lower()
        if response != 'y':
            print("Aborted.")
            return

        print()
        self.log("Merging to main...", BLUE)

        # Switch to main
        self.run_command(f"git checkout {self.main_branch}")

        # Merge feature branch
        try:
            self.run_command(
                f'git merge "{current_branch}" -m "Merge {current_branch} into main"'
            )
            self.log("✅ Merged successfully", GREEN)
        except subprocess.CalledProcessError:
            self.log("❌ Merge conflict!", RED)
            print("Resolve conflicts and run:")
            print("  git add . && git commit")
            sys.exit(1)

        # Delete feature branch
        print()
        self.log(f"Deleting feature branch: {current_branch}", BLUE)
        self.run_command(f"git branch -d {current_branch}")

        print()
        self.log("✅ Feature branch finished and deleted", GREEN)
        print()
        print("Next steps:")
        print("  1. Review commits on main")
        print("  2. Run: ./scripts/push-to-github.py")
        print("  3. Start new feature: ./scripts/feature-workflow.py start <name>")

    def cmd_status(self):
        """Show current status."""
        current_branch = self.get_current_branch()
        current_version = self.get_current_version()

        self.log("Current Status:", BLUE)
        print(f"  Branch: {current_branch}")
        print(f"  Version: {current_version}")
        print()

        if current_branch.startswith("feature/"):
            self.log(f"✅ On feature branch - Ready for development", GREEN)
            print()
            print("Changes from main:")
            self.run_command(f"git diff --stat {self.main_branch}...HEAD")
        elif current_branch == self.main_branch:
            self.log(f"✅ On main branch - Ready to start a new feature", GREEN)
        else:
            self.log(f"⚠️  On detached branch: {current_branch}", YELLOW)

    def cmd_list(self):
        """List feature branches."""
        self.log("Available feature branches:", BLUE)
        print()

        branches = self.run_command(
            "git branch -a | grep 'feature/'",
            check=False,
            capture=True
        )

        if branches:
            print(branches)
        else:
            print("  (No feature branches)")

        print()
        self.log(f"Current branch: {self.get_current_branch()}")

    def cmd_clean(self):
        """Clean up feature branches."""
        self.log("Deleting all feature branches...", YELLOW)
        print()

        current_branch = self.get_current_branch()
        deleted = 0

        branches = self.run_command(
            "git branch | grep 'feature/'",
            check=False,
            capture=True
        )

        for branch in branches.split('\n'):
            branch = branch.strip().lstrip('* ')
            if branch and branch != current_branch:
                print(f"  Deleting: {branch}")
                self.run_command(f"git branch -D {branch}")
                deleted += 1

        print()
        if deleted > 0:
            self.log(f"✅ Deleted {deleted} branch(es)", GREEN)
        else:
            self.log("No branches to delete", BLUE)

    def _extract_task_id(self, req_name):
        """Extract NNNN task ID from requirement name like 'fea-0011-critical-lsp'."""
        m = re.search(r'(\d{4})', req_name)
        return m.group(1) if m else None

    def _get_next_task_id(self):
        """Find next available task ID by scanning tasks/ directory."""
        tasks_dir = Path('tasks')
        ids = []
        if tasks_dir.exists():
            for f in tasks_dir.glob('[0-9][0-9][0-9][0-9]-*.md'):
                m = re.match(r'^(\d{4})', f.name)
                if m:
                    ids.append(int(m.group(1)))
        return f'{max(ids) + 1:04d}' if ids else '0001'

    def _create_bdd_task_file(self, task_id, req_name, sub_of=None, depends_on=None, blocks=None):
        """Create a starter task file with BDD acceptance criteria template."""
        tasks_dir = Path('tasks')
        tasks_dir.mkdir(exist_ok=True)

        task_file = tasks_dir / f'{task_id}-{req_name}.md'
        if task_file.exists():
            self.log(f"Task file already exists: {task_file}", YELLOW)
            return

        title = req_name.replace('-', ' ').title()
        today = date.today().isoformat()

        blocked_by_val = f'[{depends_on}]' if depends_on else '[]'
        linked_tasks_val = f'[{sub_of}]' if sub_of else '[]'
        parent_line = f'parent_task: {sub_of}\n' if sub_of else ''

        content = f"""---
id: {task_id}
title: {title}
status: open
impact: Medium
priority: 050
complexity: "TBD"
assignee: Claude
created: {today}
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
{parent_line}linked_tasks: {linked_tasks_val}
blocked_by: {blocked_by_val}
related: []
---

# Description

[Describe what problem this solves and why it matters.]

# Location / Context

[Which files, modules, or areas are affected?]

# Acceptance Criteria

## Scenario: [Primary Scenario Name]
- **Given** [the initial context or precondition]
- **When** [the action or event occurs]
- **Then** [the expected observable outcome]

## Scenario: [Edge Case or Secondary Scenario]
- **Given** [another starting condition]
- **When** [action or event]
- **Then** [expected result]

# Test Plan

1. [How will you verify this works?]
2. Run tests: `./scripts/feature-workflow.py test`
3. [Manual verification steps if needed]

# Dependencies

{f'- Blocked by: Task #{depends_on}' if depends_on else '- None'}
{f'- Sub-requirement of: Task #{sub_of}' if sub_of else ''}
{f'- Blocks: Task #{blocks}' if blocks else ''}

# Estimated Time

TBD

# Notes

[Any additional context or constraints.]
"""

        task_file.write_text(content)
        self.log(f"✅ Created task file: {task_file}", GREEN)
        print(f"   Edit it to fill in the BDD scenarios before committing.")

    def cmd_requirement(self, req_name, sub_of=None, depends_on=None, blocks=None):
        """Create a requirement branch for defining specs."""
        if not req_name:
            self.log("Error: Requirement name required", RED)
            self.log("Usage: ./scripts/feature-workflow.py requirement <requirement-name>")
            sys.exit(1)

        requirement_branch = f"requirement/{req_name}"
        current_branch = self.get_current_branch()

        if current_branch != self.main_branch:
            self.log(f"Switching to {self.main_branch} first...", YELLOW)
            self.run_command(f"git checkout {self.main_branch}")

        self.log(f"Creating requirement branch: {requirement_branch}", BLUE)
        self.run_command(f"git checkout -b {requirement_branch}")

        # Auto-generate starter task file with BDD template
        task_id = self._extract_task_id(req_name)
        if task_id:
            self._create_bdd_task_file(task_id, req_name, sub_of, depends_on, blocks)

        self.log(f"✅ Switched to: {requirement_branch}", GREEN)
        print()
        self.log("Next steps:", YELLOW)
        print("  1. Edit the task file to fill in BDD scenarios")
        print("  2. Document requirements/spec")
        print("  3. Commit: ./scripts/feature-workflow.py commit '...'")
        print("  4. Finish: ./scripts/feature-workflow.py requirement finish")

    def cmd_requirement_finish(self):
        """Merge requirement to main (no tests required)."""
        current_branch = self.get_current_branch()

        if not current_branch.startswith("requirement/"):
            self.log("Error: Not on requirement/* branch", RED)
            self.log(f"Current branch: {current_branch}")
            sys.exit(1)

        self.log(f"Finishing requirement: {current_branch}", BLUE)
        print()

        # Show commits to be merged
        print("Commits to merge:")
        commits = self.run_command(
            f"git log {self.main_branch}...HEAD --oneline",
            capture=True
        )
        for line in commits.split('\n'):
            if line:
                print(f"  {line}")

        print()
        response = input("Continue? (y/n) ").strip().lower()
        if response != 'y':
            print("Aborted.")
            return

        print()
        self.log("Merging to main...", BLUE)

        # Switch to main
        self.run_command(f"git checkout {self.main_branch}")

        # Merge requirement branch (no tests for requirements)
        try:
            self.run_command(
                f'git merge "{current_branch}" -m "Merge {current_branch} into main"'
            )
            self.log("✅ Merged successfully", GREEN)
        except subprocess.CalledProcessError:
            self.log("❌ Merge conflict!", RED)
            print("Resolve conflicts and run:")
            print("  git add . && git commit")
            sys.exit(1)

        # Delete requirement branch
        print()
        self.log(f"Deleting requirement branch: {current_branch}", BLUE)
        self.run_command(f"git branch -d {current_branch}")

        print()
        self.log("✅ Requirement merged and deleted", GREEN)
        print()
        self.log("Next: Create feature branch to implement", YELLOW)
        print(f"  ./scripts/feature-workflow.py start {current_branch.replace('requirement/', '')}")

    def cmd_requirement_list(self):
        """Display dependency tree of requirement/* branches and their tasks."""
        self.log("Requirement branches and dependency tree:", BLUE)
        print()

        # Get all requirement branches
        branches = self.run_command(
            "git branch | grep 'requirement/' || echo ''",
            check=False, capture=True
        )

        # Read task files to build dependency map
        tasks_dir = Path('tasks')
        task_data = {}  # task_id -> {title, status, parent, blocked_by}

        if tasks_dir.exists():
            for f in sorted(tasks_dir.glob('[0-9][0-9][0-9][0-9]-*.md')):
                content = f.read_text()
                fm_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
                if not fm_match:
                    continue
                fm = fm_match.group(1)

                def get_field(name):
                    m = re.search(rf'^{name}:\s*(.+)$', fm, re.MULTILINE)
                    return m.group(1).strip() if m else ''

                task_id = get_field('id')
                if task_id:
                    task_data[task_id] = {
                        'title': get_field('title'),
                        'status': get_field('status'),
                        'parent': get_field('parent_task'),
                        'blocked_by': get_field('blocked_by'),
                        'file': f.name
                    }

        # Display: branches first, then tree relationships
        if branches.strip():
            print("Active requirement branches:")
            for branch in branches.split('\n'):
                branch = branch.strip().lstrip('* ')
                if branch:
                    task_id_m = re.search(r'(\d{4})', branch)
                    info = ''
                    if task_id_m:
                        tid = task_id_m.group(1)
                        if tid in task_data:
                            t = task_data[tid]
                            info = f" [{t['status']}] {t['title']}"
                            parent = t.get('parent')
                            if parent:
                                info += f" (sub of #{parent})"
                    print(f"  {branch}{info}")
        else:
            print("  (No active requirement branches)")

        print()
        print("Task dependency tree (from task files):")
        roots = [tid for tid, t in task_data.items() if not t.get('parent')]

        def print_tree(task_id, indent=0):
            if task_id not in task_data:
                return
            t = task_data[task_id]
            prefix = '  ' * indent + ('└─ ' if indent > 0 else '')
            blocked_note = ''
            if t.get('blocked_by') and t['blocked_by'] not in ('[]', ''):
                blocked_note = f" [BLOCKED by {t['blocked_by']}]"
            print(f"  {prefix}#{task_id}: {t['title']} [{t['status']}]{blocked_note}")
            children = [tid for tid, td in task_data.items() if td.get('parent') == task_id]
            for child in sorted(children):
                print_tree(child, indent + 1)

        if roots:
            for root in sorted(roots):
                print_tree(root)
        else:
            print("  (No root tasks found)")

        print()
        self.log(f"Current branch: {self.get_current_branch()}")

    def setup_hooks(self):
        """Setup git hooks."""
        setup_script = Path("scripts/setup-hooks.py")
        if setup_script.exists():
            try:
                self.run_command(f"python3 {setup_script}", check=False)
                print()
            except Exception:
                pass  # Non-fatal if setup fails

    def show_help(self):
        """Show help message."""
        print(__doc__)

    def main(self):
        """Main entry point."""
        if len(sys.argv) < 2:
            self.show_help()
            sys.exit(0)

        command = sys.argv[1]
        args = sys.argv[2:] if len(sys.argv) > 2 else []

        try:
            if command == "start":
                self.cmd_start(args[0] if args else None)
            elif command == "test":
                self.cmd_test()
            elif command == "commit":
                self.cmd_commit(' '.join(args) if args else None)
            elif command == "finish":
                self.cmd_finish()
            elif command == "status":
                self.cmd_status()
            elif command == "list":
                self.cmd_list()
            elif command == "clean":
                self.cmd_clean()
            elif command == "requirement":
                if args and args[0] == "finish":
                    self.cmd_requirement_finish()
                elif args and args[0] == "list":
                    self.cmd_requirement_list()
                else:
                    # Parse flags: --sub-of, --depends-on, --blocks
                    req_name = args[0] if args else None
                    sub_of = None
                    depends_on = None
                    blocks = None
                    i = 1
                    while i < len(args):
                        if args[i] == '--sub-of' and i + 1 < len(args):
                            sub_of = args[i + 1]; i += 2
                        elif args[i] == '--depends-on' and i + 1 < len(args):
                            depends_on = args[i + 1]; i += 2
                        elif args[i] == '--blocks' and i + 1 < len(args):
                            blocks = args[i + 1]; i += 2
                        else:
                            i += 1
                    self.cmd_requirement(req_name, sub_of=sub_of, depends_on=depends_on, blocks=blocks)
            elif command in ["-h", "--help", "help"]:
                self.show_help()
            else:
                self.log(f"Unknown command: {command}", RED)
                print()
                self.show_help()
                sys.exit(1)
        except KeyboardInterrupt:
            print()
            self.log("Interrupted.", YELLOW)
            sys.exit(130)
        except Exception as e:
            self.log(f"Error: {e}", RED)
            sys.exit(1)


if __name__ == "__main__":
    manager = WorkflowManager()
    manager.main()
