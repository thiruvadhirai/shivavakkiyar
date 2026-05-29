#!/bin/bash
git add -A && git commit -m "$(cat <<'EOF'
$1
EOF
)"