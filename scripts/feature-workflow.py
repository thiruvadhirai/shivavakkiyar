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

Commands:
    start <name>    - Create and switch to feature/name branch
    status          - Show current branch and version
    test            - Run unit tests in container
    commit <msg>    - Commit changes (auto-increments version via hook)
    list            - List all feature branches
    finish          - Merge feature to main and delete feature branch
    clean           - Delete all feature branches except current
"""

import os
import sys
import subprocess
from pathlib import Path

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
        full_message = f"{message}\n\nCo-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
        try:
            self.run_command(f'git commit -m "{full_message}"')
        except subprocess.CalledProcessError:
            self.log("Commit failed", RED)
            sys.exit(1)

        # Show new version
        new_version = self.get_current_version()
        print()
        self.log("✅ Commit successful!", GREEN)
        self.log(f"   New version: {new_version}")

    def cmd_finish(self):
        """Finish feature branch."""
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
