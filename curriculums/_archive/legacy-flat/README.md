# Legacy Flat Curriculum Files Archive

This directory contains the legacy flat curriculum files (e.g. `general-english-a1.json`, `grammar-english-b1.json`, `spoken-english-a1.json`, etc.) that were formerly stored at the root of `/curriculums/`.

## Canonical Source of Truth

All courses are now defined in canonical nested curriculum files following the structure:

$$\text{curriculums/}\langle\text{iso}\rangle\text{/}\langle\text{track}\rangle\text{/}\langle\text{LEVEL}\rangle\text{.json}$$

For example:
- `curriculums/en/general/A1.json`
- `curriculums/en/spoken/A1.json`

## Curriculum Enrichment & Porting Log

All course-level metadata, section groupings, confidence-based lesson slugs, and unmapped draft lessons from these legacy flat files have been extracted, enriched, and merged into the canonical nested curriculum files.

For full details of the extraction, matching, and porting process, see:
- [`/docs/curriculum-enrichment-log.md`](../../../docs/curriculum-enrichment-log.md)

These legacy files are retained here as an archived historical record. They are no longer active in the runtime curriculum loader or schema validation suite.
