# Canonical Source of Truth

This document outlines the canonical source of truth for platform data assets and repository sync rules across the **COSY** ecosystem (**COSYdata**, **COSYlanguages**, **COSYgames**, **COSYtools**, **COSYworld**, **COSYmanuals**, and **COSYplatform**).

---

## Vocabulary Canon Authority

**COSYdata** is the **sole writable master** source of truth for the A0–A1 English vocabulary canon (`vocabulary/en/a0_a1/*.json`, comprising 33 theme files, ~1700 entries, and utilizing the canonical entry ID scheme `en:<slug>:<form>`).

All other repositories in the ecosystem consume vocabulary data as read-only mirrors:
- **COSYlanguages** (Read-only mirror)
- **COSYgames** (Read-only mirror)
- **COSYtools** (Read-only mirror)
- **COSYworld** (Read-only mirror)
- **COSYmanuals** (Read-only mirror)

No repository other than **COSYdata** may modify or maintain a separate writable copy of the vocabulary data files.

---

## Repository Roles & Sync Rules

- **COSYdata**: Sole writable master source for canonical vocabulary data, lexicon definitions, and schema authority.
- **COSYlanguages / COSYplatform**: Read-only mirror and consumer of vocabulary definitions for lesson interactive components and curriculum roadmaps.
- **COSYgames / COSYtools / COSYworld / COSYmanuals**: Read-only downstream mirrors consuming vocabulary data for interactive tools, practice modules, games, and teacher reference materials.
