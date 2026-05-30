#!/bin/bash

# Find and display all JSON files in .claude folder and root

ls -la /home/jsnadmin/apps/shivavakkiyar/.claude/*.json /home/jsnadmin/apps/shivavakkiyar/*.json 2>/dev/null | awk '{print $NF}' | xargs -I {} sh -c 'echo "=== {} ==="; head -20 {}'
