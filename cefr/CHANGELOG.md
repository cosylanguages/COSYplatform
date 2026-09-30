# CEFR Reference Changelog

All notable changes to the CEFR Universal Master Reference specification will be documented in this file.

## [1.1] - 2026-09-30

### Changed
- **A0 Level Consolidation:** Merged separate A0 level into the combined A0–A1 band. In data, starter levels are stored as level `A1` with `sublevel: "start"` (represented as `A1s` in reference tables). `"A0-A1"` is strictly a folder/display label.
- **Domain Field Renaming:** Renamed the CEFR domain field to `use_domain` (`personal`, `public`, `occupational`, `educational`) to avoid collision with the existing `domain` field used for course tracks (`general`, `spoken`, `exam`, etc.).
- **Lowercase Descriptor IDs:** Enforced lowercase formatting for all descriptor IDs in data (e.g. `in-conv-b1`, `lis-ov-a1s`) and established cross-repository syntax (`cefr:<id>`).
- **Coverage Table Update:** Updated language and level coverage tables across project layers.

### Added
- **Appendix B Theme Crosswalk:** Added theme crosswalk mapping master communicative topics (`t01`–`t22`) to repository lexical field and word class structures.
