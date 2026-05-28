#!/usr/bin/env python3
"""
Deployment validation test - Check if website is running and pages load correctly.

Tests that the Jekyll dev server starts and serves the expected pages.

Usage:
  python3 tests/deployment/test_website_running.py [--host localhost] [--port 5080]

Environment:
  TARGET_HOST    - Server hostname (default: localhost)
  TARGET_PORT    - Server port (default: 5080)
  WAIT_TIMEOUT   - Max seconds to wait for server (default: 60)
"""

import sys
import time
import urllib.request
import urllib.error
import os
from urllib.parse import urljoin

class WebsiteDeploymentTest:
    def __init__(self, host="localhost", port=5080, timeout=60):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.base_url = f"http://{host}:{port}"
        self.pages = {
            "/panchanga/": "Panchanga Calculator",
            "/pradoshakalapooja/": "Pradosha",
            "/": "Home"
        }

    def wait_for_server(self):
        """Wait for server to be ready."""
        print(f"Waiting for server at {self.base_url}...")
        start_time = time.time()

        while time.time() - start_time < self.timeout:
            try:
                response = urllib.request.urlopen(f"{self.base_url}/", timeout=2)
                if response.status == 200:
                    print(f"✅ Server is ready (took {time.time() - start_time:.1f}s)")
                    return True
            except (urllib.error.URLError, urllib.error.HTTPError, Exception):
                elapsed = time.time() - start_time
                print(f"  Waiting... ({elapsed:.0f}s)", end="\r")
                time.sleep(1)

        print(f"\n❌ Server did not respond within {self.timeout}s")
        return False

    def test_page_loads(self, path, expected_text=None):
        """Test that a page loads and contains expected text."""
        url = urljoin(self.base_url, path)
        try:
            response = urllib.request.urlopen(url, timeout=5)
            content = response.read().decode('utf-8')

            if response.status != 200:
                print(f"❌ {path}: Got status {response.status}")
                return False

            if expected_text and expected_text not in content:
                print(f"❌ {path}: Missing expected text '{expected_text}'")
                return False

            print(f"✅ {path}: Loaded successfully")
            return True

        except urllib.error.HTTPError as e:
            print(f"❌ {path}: HTTP Error {e.code}")
            return False
        except Exception as e:
            print(f"❌ {path}: {type(e).__name__}: {e}")
            return False

    def test_widget_loads(self):
        """Test that widget JavaScript loads."""
        try:
            # Test panchanga calculator script
            url = urljoin(self.base_url, "/assets/js/panchanga-calculator.js")
            response = urllib.request.urlopen(url, timeout=5)

            if response.status == 200:
                print(f"✅ Widget script loaded")
                return True
            else:
                print(f"❌ Widget script returned status {response.status}")
                return False

        except Exception as e:
            print(f"❌ Widget script: {e}")
            return False

    def run(self):
        """Run all deployment tests."""
        print("=" * 60)
        print("Deployment Validation Tests")
        print("=" * 60)

        # Wait for server
        if not self.wait_for_server():
            return False

        # Test pages load
        print("\nTesting pages...")
        results = []
        for path, expected_text in self.pages.items():
            results.append(self.test_page_loads(path, expected_text))

        # Test widget loads
        print("\nTesting widgets...")
        results.append(self.test_widget_loads())

        # Summary
        print("\n" + "=" * 60)
        passed = sum(results)
        total = len(results)
        print(f"Results: {passed}/{total} tests passed")

        if passed == total:
            print("✅ All deployment tests passed!")
            return True
        else:
            print(f"❌ {total - passed} test(s) failed")
            return False


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Deployment validation test")
    parser.add_argument("--host", default=os.getenv("TARGET_HOST", "localhost"),
                       help="Server hostname")
    parser.add_argument("--port", type=int, default=int(os.getenv("TARGET_PORT", "5080")),
                       help="Server port")
    parser.add_argument("--timeout", type=int, default=int(os.getenv("WAIT_TIMEOUT", "60")),
                       help="Max seconds to wait for server")

    args = parser.parse_args()

    test = WebsiteDeploymentTest(args.host, args.port, args.timeout)
    success = test.run()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
