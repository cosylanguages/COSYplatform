# Supabase Database Architecture & Migrations Guide

## Overview

This repository (`COSYplatform`) hosts the **single source of truth** for the shared Supabase database schema across the CosyLanguages ecosystem.

All database tables, columns, row-level security (RLS) policies, and role permissions for `COSYplatform`, `COSYevents`, and `COSYmanuals` are defined and maintained in the `supabase/migrations/` directory using sequential, numbered migration files.

---

## Migration Directory Structure

Migrations must be executed in numeric sequence on a fresh or existing Supabase project:

```
supabase/migrations/
├── 0001_core_profiles_and_lessons.sql
├── 0002_session_content.sql
└── 0003_manual_content.sql
```

### 1. `0001_core_profiles_and_lessons.sql`
* **Source:** Ported from COSYplatform core schema (`supabase/schema.sql`).
* **Tables Created:**
  * `public.profiles`: Core user profile data. Supports roles `'founder'`, `'host'`, `'teacher'`, and `'student'`, with `language_access` (text array) and `course_level`.
  * `public.lesson_content`: Interactive lesson markup (`xml_content`), indexed by `lesson_id`, `level`, and `language`.
* **Security & RLS Policies:**
  * RLS enabled on `profiles` and `lesson_content`.
  * Founders have full read access across profiles and lesson content.
  * Teachers and Students read entitled lesson content matching their profile `language_access` and `course_level`.

### 2. `0002_session_content.sql`
* **Source:** Ported from COSYevents schema (`scripts/schema.sql`).
* **Profile Extensions:**
  * Safely adds `enrolled_sessions` (`text[]`) and `hosted_sessions` (`text[]`) columns to `public.profiles`.
* **Tables Created:**
  * `public.session_content`: Stores live session notes (`full_notes`) and recordings (`recording_url`), keyed by `session_id`.
* **Security & RLS Policies:**
  * RLS enabled on `session_content`.
  * Founders can view, insert, and update all session content.
  * Hosts can view, insert, and update session content for sessions in their `hosted_sessions` array.
  * Students can view session content for sessions in their `enrolled_sessions` array.

### 3. `0003_manual_content.sql`
* **Source:** Ported from COSYmanuals schema (`scripts/schema.sql`).
* **Tables Created:**
  * `public.manual_content`: Stores full Markdown manual text (`markdown_content`), keyed by `manual_id`, `language`, and `level`.
* **Security & RLS Policies:**
  * RLS enabled on `manual_content`.
  * Authenticated users can select manual content.
  * Service role has full management access.

---

## Migration Execution Order & Dependency Chain

1. **`0001_core_profiles_and_lessons.sql` MUST run first.**
   It establishes the core `public.profiles` table with user role constraints.
2. **`0002_session_content.sql` MUST run after `0001`.**
   It executes `ALTER TABLE public.profiles` to add `enrolled_sessions` and `hosted_sessions` columns and creates RLS policies referencing `public.profiles`. Running `0002` before `0001` will fail because `public.profiles` does not exist.
3. **`0003_manual_content.sql` runs after `0001` & `0002`.**
   It creates `public.manual_content` independently.

All migration scripts are written idempotently (`CREATE TABLE IF NOT EXISTS`, PL/pgSQL column checks, `DROP POLICY IF EXISTS`) so they can be safely re-run.

---

## Guidelines for Ecosystem Repositories

* **Single Source of Truth:** `COSYevents` and `COSYmanuals` should **stop maintaining independent `schema.sql` files** in their respective repositories.
* **Schema Updates:** Any schema changes across the ecosystem must be submitted as a numbered migration file (e.g., `0004_...sql`) in `COSYplatform`'s `supabase/migrations/` directory.
* **References:**
  * COSYevents repository: [github.com/cosylanguages/COSYevents](https://github.com/cosylanguages/COSYevents)
  * COSYmanuals repository: [github.com/cosylanguages/COSYmanuals](https://github.com/cosylanguages/COSYmanuals)
  * COSYplatform migrations repository link: [github.com/cosylanguages/COSYplatform/tree/main/supabase/migrations](https://github.com/cosylanguages/COSYplatform/tree/main/supabase/migrations)

---

## Legacy File Deprecation Notice

* `supabase/schema.sql` in this repository is retained temporarily for backward compatibility while transition to the `supabase/migrations/` directory is confirmed across all environments.
