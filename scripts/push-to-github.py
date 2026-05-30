#!/usr/bin/env python3
"""
Push commits to GitHub repository

Usage:
    ./scripts/push-to-github.py
    # or
    python3 scripts/push-to-github.py

Pushes current branch to origin (remote).
For feature branches: pushes to feature/* on origin.
For main: pushes to main on origin.
"""

import sys
import subprocess
from pathlib import Path

# Colors
GREEN = '\033[0;32m'
BLUE = '\033[0;34m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
NC = '\033[0m'


def log(message, color=NC):
    """Print colored message."""
    print(f"{color}{message}{NC}")


def run_command(cmd, check=True, capture=False):
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
        log(f"❌ Command failed: {cmd}", RED)
        raise


def get_current_branch():
    """Get current git branch."""
    return run_command("git rev-parse --abbrev-ref HEAD", capture=True)


def main():
    """Push to GitHub."""
    log("Pushing to GitHub...", BLUE)
    print()

    current_branch = get_current_branch()
    log(f"Current branch: {current_branch}", BLUE)

    # Check if there's a remote
    remotes = run_command("git remote -v", capture=True)
    if "origin" not in remotes:
        log("❌ Error: No 'origin' remote found", RED)
        print("Configure remote with:")
        print("  git remote add origin https://github.com/your-username/your-repo.git")
        return 1

    print()
    print(f"Remote: origin")
    log(f"Pushing branch: {current_branch}", YELLOW)
    print()

    # Show what will be pushed
    try:
        commits = run_command(
            f"git log origin/{current_branch}..HEAD --oneline",
            capture=True,
            check=False
        )
        if commits:
            print("Commits to push:")
            for line in commits.split('\n'):
                if line:
                    print(f"  {line}")
            print()
    except Exception:
        pass

    # Push to remote
    try:
        run_command(f"git push origin {current_branch}")
        print()
        log(f"✅ Pushed {current_branch} to origin successfully!", GREEN)
        print()
        print("Next steps:")
        print(f"  1. Create pull request: https://github.com/your-username/your-repo")
        print(f"  2. Request code review")
        print(f"  3. Merge pull request")
        return 0

    except subprocess.CalledProcessError:
        print()
        log(f"❌ Push failed!", RED)
        print()
        print("Troubleshooting:")
        print("  1. Check remote URL: git remote -v")
        print("  2. Verify GitHub access (SSH key or token)")
        print("  3. Pull latest: git pull origin " + current_branch)
        print("  4. Retry: git push origin " + current_branch)
        return 1


if __name__ == "__main__":
    sys.exit(main())
