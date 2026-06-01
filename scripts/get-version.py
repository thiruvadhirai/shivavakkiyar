#!/usr/bin/env python3
"""
Get version from VERSION file in various formats.

Usage:
  python3 scripts/get-version.py                # Plain version
  python3 scripts/get-version.py --plain        # Plain version
  python3 scripts/get-version.py --json         # JSON format
  python3 scripts/get-version.py --yaml         # YAML format
  python3 scripts/get-version.py --html         # HTML badge
"""

import sys
import json
import os
from pathlib import Path
from datetime import datetime

# Get project root from environment or use current directory
PROJECT_ROOT = Path(os.getenv('PROJECT_ROOT', os.getcwd()))
VERSION_FILE = PROJECT_ROOT / "VERSION"

def read_version():
    """Read version from VERSION file."""
    if not VERSION_FILE.exists():
        return None
    return VERSION_FILE.read_text().strip()

def format_plain(version):
    """Return plain version string."""
    return version

def format_json(version):
    """Return version as JSON."""
    return json.dumps({
        "version": version,
        "date": datetime.now().strftime("%Y-%m-%d")
    }, indent=2)

def format_yaml(version):
    """Return version as YAML."""
    return f"""version: "{version}"
date: "{datetime.now().strftime("%Y-%m-%d")}"
"""

def format_html(version):
    """Return version as HTML badge."""
    is_prerelease = "-" in version
    badge_class = "version-prerelease" if is_prerelease else "version-stable"
    return f'<span class="version-badge {badge_class}">v{version}</span>'

def main():
    version = read_version()

    if not version:
        print("Error: VERSION file not found", file=sys.stderr)
        sys.exit(1)

    # Determine output format
    fmt = "plain"
    if len(sys.argv) > 1:
        fmt = sys.argv[1].lstrip("--")

    # Output in requested format
    if fmt == "json":
        print(format_json(version))
    elif fmt == "yaml":
        print(format_yaml(version))
    elif fmt == "html":
        print(format_html(version))
    else:  # plain (default)
        print(format_plain(version))

if __name__ == "__main__":
    main()
