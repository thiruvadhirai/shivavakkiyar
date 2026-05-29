#!/usr/bin/env python3
"""
Test script for version hook logic.

Tests the version increment logic that the post-commit hook uses.
Useful for validating hook behavior without running git.

Usage:
  python3 scripts/test-version-hook.py 1.0.0-beta.5
  python3 scripts/test-version-hook.py 1.2.3
  python3 scripts/test-version-hook.py 2.0.0-alpha.1
"""

import sys
import re

def validate_version(version):
    """Validate version format: MAJOR.MINOR.PATCH[-STAGE.NUM]"""
    pattern = r'^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z]+\.[0-9]+)?$'
    return re.match(pattern, version) is not None

def increment_version(current):
    """
    Increment version using same logic as post-commit hook.

    Format: X.Y.Z or X.Y.Z-STAGE.NUM
    Examples:
      1.0.0-beta.5 → 1.0.0-beta.6
      1.0.0 → 1.0.0-beta.1
    """

    # Validate
    if not validate_version(current):
        return None, f"Invalid format: {current}"

    # Check if stage version (has dash)
    if "-" in current:
        # Split on dash: "1.0.0" and "beta.5"
        version_nums, stage_part = current.rsplit("-", 1)

        # Split stage on dot: "beta" and "5"
        stage, num_str = stage_part.rsplit(".", 1)

        try:
            num = int(num_str)
            new_num = num + 1
            new_version = f"{version_nums}-{stage}.{new_num}"
            return new_version, "Stage version incremented"
        except ValueError:
            return None, f"Invalid stage number: {num_str}"
    else:
        # Not a stage version - add beta.1
        new_version = f"{current}-beta.1"
        return new_version, "Converted to beta version"

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    version = sys.argv[1]

    print(f"Input:  {version}")
    print(f"Valid:  {validate_version(version)}")

    new_version, msg = increment_version(version)
    if new_version:
        print(f"Output: {new_version}")
        print(f"Reason: {msg}")
    else:
        print(f"Error:  {msg}")
        sys.exit(1)

if __name__ == "__main__":
    main()
