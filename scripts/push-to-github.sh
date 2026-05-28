#!/bin/bash
# Push changes to GitHub (run after UI testing is complete)

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              PUSH TO GITHUB - FINAL CONFIRMATION              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ ERROR: Not on main branch!"
  echo "   Current branch: $CURRENT_BRANCH"
  echo ""
  echo "Switch to main first:"
  echo "  git checkout main"
  exit 1
fi

echo "📊 PUSH DETAILS:"
echo "─────────────────────────────────────────────────────────────────"
echo ""
echo "Current branch: $CURRENT_BRANCH"
echo ""

echo "Commits to push:"
git log --oneline -3 | sed 's/^/  /'

echo ""
echo "📈 Changes summary:"
git diff origin/main...HEAD --stat | tail -1 | sed 's/^/  /'

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""

# Confirm before pushing
read -p "Continue with push to GitHub? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "🚀 PUSHING TO GITHUB..."
git push origin main

echo ""
echo "✅ PUSH COMPLETE!"
echo ""
echo "View on GitHub:"
echo "  https://github.com/vairakkumaar/shivavakkiyar"
