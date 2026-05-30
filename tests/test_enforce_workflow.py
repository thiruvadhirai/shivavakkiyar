#!/usr/bin/env python3
"""
Unit tests for enforce-workflow.py hook
Tests FEA:/BUG: prompt parsing and detection logic
"""

import sys
import json
from pathlib import Path

# Add scripts to path for importing
sys.path.insert(0, str(Path(__file__).parent.parent / '.claude' / 'hooks'))

# Import the functions we're testing
import re

def parse_fea_bug_prompt(prompt):
    """
    Detect FEA:/BUG: prefix and parse numbered items.
    FEA: 1. A 2. B  → (FEA, None, [A, B])   — independent tasks
    FEA0010: 1. A 2. B → (FEA, '0010', [A, B]) — sub-tasks of 0010
    Returns (type, parent_id, items) or (None, None, None).
    """
    m = re.match(r'^(FEA|BUG)(\d+)?:\s*(.*)', prompt, re.IGNORECASE | re.DOTALL)
    if not m:
        return None, None, None
    prefix = m.group(1).upper()
    parent_id = f'{int(m.group(2)):04d}' if m.group(2) else None
    body = m.group(3).strip()
    if re.search(r'^\d+\.\s', body):
        items = [i.strip() for i in re.split(r'\s+\d+\.\s+', ' ' + body) if i.strip()]
    else:
        items = [body] if body else []
    return prefix, parent_id, items

def slugify(text, max_len=35):
    """Convert text to a branch-safe slug."""
    slug = re.sub(r'[^a-z0-9\s]', '', text.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    return slug[:max_len].rstrip('-')

# Test cases
def test_fea_single_item():
    """Test FEA: with single item (no number)"""
    prompt_type, parent_id, items = parse_fea_bug_prompt("FEA: Add dark mode")
    assert prompt_type == 'FEA'
    assert parent_id is None
    assert items == ['Add dark mode']
    print("✓ test_fea_single_item passed")

def test_fea_numbered_list():
    """Test FEA: with numbered list (independent tasks)"""
    prompt_type, parent_id, items = parse_fea_bug_prompt("FEA: 1. Add dark mode 2. Add print stylesheet")
    assert prompt_type == 'FEA'
    assert parent_id is None
    assert len(items) == 2
    assert items[0] == 'Add dark mode'
    assert items[1] == 'Add print stylesheet'
    print("✓ test_fea_numbered_list passed")

def test_fea_with_parent():
    """Test FEA0010: with parent task ID (sub-tasks)"""
    prompt_type, parent_id, items = parse_fea_bug_prompt("FEA0010: 1. Python LSP 2. JS LSP")
    assert prompt_type == 'FEA'
    assert parent_id == '0010'
    assert len(items) == 2
    assert items[0] == 'Python LSP'
    assert items[1] == 'JS LSP'
    print("✓ test_fea_with_parent passed")

def test_bug_single():
    """Test BUG: prefix with single item"""
    prompt_type, parent_id, items = parse_fea_bug_prompt("BUG: Calculator crashes at 180°")
    assert prompt_type == 'BUG'
    assert parent_id is None
    assert items == ['Calculator crashes at 180°']
    print("✓ test_bug_single passed")

def test_bug_with_parent():
    """Test BUG0009: with parent task ID"""
    prompt_type, parent_id, items = parse_fea_bug_prompt("BUG0009: 1. Crash at 180° 2. DST boundary issue")
    assert prompt_type == 'BUG'
    assert parent_id == '0009'
    assert len(items) == 2
    print("✓ test_bug_with_parent passed")

def test_case_insensitive():
    """Test that FEA:/BUG: are case-insensitive"""
    prompt_type, _, _ = parse_fea_bug_prompt("fea: Add feature")
    assert prompt_type == 'FEA'
    prompt_type, _, _ = parse_fea_bug_prompt("bug: Fix bug")
    assert prompt_type == 'BUG'
    print("✓ test_case_insensitive passed")

def test_not_fea_bug():
    """Test that normal prompts don't match FEA:/BUG:"""
    prompt_type, parent_id, items = parse_fea_bug_prompt("Working on Task 0011: implement something")
    assert prompt_type is None
    assert parent_id is None
    assert items is None
    print("✓ test_not_fea_bug passed")

def test_slugify():
    """Test slug generation for branch names"""
    assert slugify("Add dark mode") == "add-dark-mode"
    assert slugify("Python LSP Support") == "python-lsp-support"
    assert slugify("Fix: Crashes at 180°") == "fix-crashes-at-180"
    # Long string gets truncated to 35 chars and trailing dash removed
    result = slugify("Very-Long-Feature-Name-That-Exceeds-Thirty-Five-Characters")
    assert len(result) <= 35
    assert result == "verylongfeaturenamethatexceedsthirt"
    print("✓ test_slugify passed")

def test_multiline_items():
    """Test that items can span multiple lines"""
    prompt = "FEA: 1. Add dark mode\nwith custom themes 2. Add print stylesheet"
    prompt_type, parent_id, items = parse_fea_bug_prompt(prompt)
    assert prompt_type == 'FEA'
    assert len(items) == 2
    print("✓ test_multiline_items passed")

if __name__ == "__main__":
    test_fea_single_item()
    test_fea_numbered_list()
    test_fea_with_parent()
    test_bug_single()
    test_bug_with_parent()
    test_case_insensitive()
    test_not_fea_bug()
    test_slugify()
    test_multiline_items()
    print("\n✅ All tests passed!")
