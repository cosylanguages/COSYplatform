# CEFR Reference Infrastructure

## Purpose & File List

This directory serves as the canonical home of the project's Common European Framework of Reference for Languages (CEFR) reference system across all CosyLanguages repositories and products.

### Files
- `cefr/CEFR_Universal_Master.md`: Master reference specification (v1.1) defining level structures, descriptor scales, skills, communicative functions, and topic taxonomies.
- `cefr/docs/repo-comparison-2026-09-30.md`: Historical audit comparing the universal CEFR master with prior repository-specific implementations.
- `cefr/README.md`: Infrastructure documentation, usage rules, and authority guidelines.
- `cefr/CHANGELOG.md`: Version history and updates to the CEFR reference specification.

---

## Authority & Governance

> **Authority Statement:**
> **COSYplatform/cefr is the canonical source for the CEFR reference. Other repositories must treat copies as read-only mirrors and propose changes by Issue/PR here.**

---

## Status

- **Version:** v1.1
- **Descriptor Provenance:** Descriptors are written in project wording following the CEFR and Companion Volume structure ("CoE-aligned"). They are **not** verbatim Council of Europe text and have **not yet been verified** against the official Companion Volume (CV 2020).

---

## Level-Code Rules

Level storage and representation strictly follow section 0.2 of the master reference specification:

- **Stored Levels:** Valid `level` values in data are `A1`, `A2`, `B1`, `B2`, `C1`, and `C2`.
- **No A0 Level:** There is **NO** `A0` level in data. The starter stage is part of the combined **A0–A1** band.
- **A0–A1 Band Storage:** The A0–A1 band is stored as level `A1` with sublevel `"start"` (coded as `A1s` in reference tables).
- **Sublevel Values:** Valid `sublevel` values are `null`, `"start"` (for A0 starter content), and `"p"` (for plus levels such as `A2p`, `B1p`, `B2p`).
- **Display Label Only:** `"A0-A1"` is strictly a folder or UI display label (e.g., `a0_a1`). It must **never** be stored as a `level` field value in data.

| Field | Values | Meaning |
|---|---|---|
| `level` | `A1`, `A2`, `B1`, `B2`, `C1`, `C2` | Canonical CEFR level. The A0–A1 band is stored as `A1`. |
| `sublevel` | `null`, `"start"`, `"p"` | `"start"` = starter part of A0–A1 band (`A1s`). `"p"` = plus level (`A2p`, `B1p`, `B2p`). |
| `band` | `A0-A1` | UI display label or folder name only. Never stored as a `level` value. |

---

## ID Rules

- **Format:** All descriptor IDs are written in **lowercase** in data (e.g., `in-conv-b1`, `cmp-grm-a2`, `lis-ov-a1s`).
- **Cross-Repository References:** When referencing descriptor IDs from other repositories, prefix them with `cefr:` (e.g., `cefr:in-conv-b1`).

---

## Tag Taxonomy

The standard metadata tags defined in section 9.1 of the master specification are:

- `language`
- `level` (`A1`–`C2`)
- `sublevel` (`"start"` / `"p"` / `null`)
- `skill` (`lis`, `rd`, `in`, `sp`, `wr`, `med`)
- `scale` (e.g., `in-conv`)
- `descriptor_ids[]` (e.g., `cefr:in-conv-b1`)
- `theme_id` (`t01`–`t22`)
- `function_ids[]` (see section 5 of master)
- `use_domain` (`personal` / `public` / `occupational` / `educational`)
- `source`
- `verified_date`

> ℹ️ **Domain Clarification:**
> The `use_domain` field (`personal`, `public`, `occupational`, `educational`) represents the CEFR domain of language use. This is distinct from the existing `domain` field in repositories, which designates the course track (e.g., `general`, `spoken`, `exam`).

---

## Versioning Rules

Following section 9.4 of the master specification:
- Version updates follow standard decimal numbering (e.g., `1.0`, `1.1`).
- Every repository using the CEFR reference must store the version of the CEFR master it was tagged against.
- Re-tagging across repositories must be performed whenever the canonical master specification is updated.
