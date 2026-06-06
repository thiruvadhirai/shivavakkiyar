---
id: 0040
title: Fix Yoga Sanskrit names with correct mapping
description: Correct the yoga (auspicious combinations) Sanskrit names in panchangam-languages.js. Current mapping has incorrect names and ordering for all 27 yogas.
status: in-progress
priority: high
complexity: low
created: 2026-06-06
---

## Problem Statement

The yoga names in `panchangam-languages.js` are incorrect. The current file has:
- First 3 entries (1-3) all labeled "Vaidhriti" (wrong)
- Entries 4-27 shifted by 3 positions
- Missing: Vishakumbha, Preeti, Aayushman at positions 1-3

**Impact**: Users see incorrect yoga names and descriptions (all 27 yogas are misaligned)

## Correct Yoga Mapping (1-27)

1. Vishakumbha - Triumphant
2. Preeti - Happy
3. Aayushman - Well-rooted
4. Saubhagya - Good Wealth
5. Shobhana - Beautiful
6. Atiganda - Danger
7. Sukarma - Plentiful
8. Dhriti - Enjoyment
9. Shoola - Argumentative
10. Ganda - Worrying
11. Vriddhi - Perspicacity
12. Dhruva - Persistent, Dependable
13. Vyaghaata - Violent
14. Harshana - Pleasure, Blissful
15. Vajra - Power Burst
16. Siddhi - Victory
17. Vyatipaata - Difficulty
18. Variyaana - Luxurious comfort
19. Parigha - Hindrance
20. Shiva - Benevolent
21. Siddha - Talented
22. Saaddhya - Mediation
23. Shubha - Favorable
24. Shukla - Bright focus
25. Brahma - Responsible
26. Indra - Headship
27. Vaidhriti - Divisive

## Acceptance Criteria

- [ ] All 27 yoga names corrected and in proper sequence
- [ ] Sanskrit names match the provided list exactly
- [ ] All tests pass (calculator tests validate names)
- [ ] Widget displays correct yoga name for calculated date

## Files to Modify

- `assets/js/panchangam-languages.js` - Update YOGA static property (lines 86-114)
