# Supabase Schema Consolidation Audit (COSYplatform, COSYevents, COSYmanuals)

> **Document Purpose**: Cross-repository comparative analysis of Supabase database schemas across `COSYplatform` (`supabase/schema.sql`), `COSYevents` (`scripts/schema.sql`), and `COSYmanuals` (`scripts/schema.sql`).

---

## Executive Summary

All three repositories (`COSYplatform`, `COSYevents`, and `COSYmanuals`) are designed to share a single Supabase backend project. However, their SQL schema scripts are maintained independently in separate codebases.

- **`COSYplatform` (`supabase/schema.sql`)** acts as the baseline core schema (defining `auth.users` references, primary `profiles` table, and `lesson_content`).
- **`COSYevents` (`scripts/schema.sql`)** acts as a schema extension (adding `session_content` and altering `profiles` to append `enrolled_sessions` and `hosted_sessions`).
- **`COSYmanuals` (`scripts/schema.sql`)** acts as a schema extension (adding `manual_content`).

This document catalogs table name collisions, schema definition differences, role check constraint conflicts, and implicit foreign key assumptions across the three repositories.

---

## 1. Table Inventory Across Repositories

| Repository | SQL Script Location | Target / Defined Tables | Schema Role |
| :--- | :--- | :--- | :--- |
| **`COSYplatform`** | `supabase/schema.sql` | `public.profiles`, `public.lesson_content` | Core Primary Schema |
| **`COSYevents`** | `scripts/schema.sql` | `public.profiles` (alters), `public.session_content` | Feature Extension |
| **`COSYmanuals`** | `scripts/schema.sql` | `public.manual_content` | Feature Extension |

---

## 2. Detailed Table Name Collisions & Shared Tables

### A. The `public.profiles` Table Collision & Inconsistency

`COSYplatform` defines the primary `profiles` table:
```sql
-- COSYplatform
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('founder', 'teacher', 'student')),
  language_access TEXT[] DEFAULT '{}',
  course_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

`COSYevents` alters `profiles` via procedural DDL statements:
```sql
-- COSYevents
ALTER TABLE public.profiles ADD COLUMN enrolled_sessions text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN hosted_sessions text[] DEFAULT '{}';
```

#### Collision / Conflict Points for `profiles`:

1. **Role CHECK Constraint Conflict**:
   - `COSYplatform` enforces `CHECK (role IN ('founder', 'teacher', 'student'))`.
   - `COSYevents` comments and RLS policies assume a `'host'` role exists on `profiles`:
     > *"Supported Profile Roles: 'founder', 'host', 'teacher', 'student'."*
   - **Issue**: Attempting to set `role = 'host'` in Supabase will fail with a Postgres `check constraint violation` unless `COSYplatform` updates its `role` CHECK constraint to include `'host'`.

2. **Column Divergence**:
   - `COSYplatform` schema lacks awareness of `enrolled_sessions` (`text[]`) and `hosted_sessions` (`text[]`).
   - If `COSYevents`'s `schema.sql` is not executed after `COSYplatform`'s `schema.sql`, `COSYevents` queries and RLS policies referencing these columns will throw runtime SQL errors.

3. **RLS Policy Assumptions on `profiles`**:
   - `COSYevents` policies query `profiles.role` for `'host'` and check `session_id = ANY(hosted_sessions)` or `session_id = ANY(enrolled_sessions)`.

---

## 3. Table Definitions & Cross-Repo Foreign Key Assumptions

### A. `public.lesson_content` (`COSYplatform`)
- **Primary Key**: `lesson_id TEXT`
- **Columns**: `level TEXT`, `language TEXT`, `xml_content TEXT NOT NULL`, `updated_at TIMESTAMPTZ`
- **RLS Policies**: Filtered by user's `profiles.language_access` and `profiles.course_level`.
- **Cross-Repo Dependencies**: Independent table; no foreign keys to events or manuals.

### B. `public.session_content` (`COSYevents`)
- **Primary Key**: `session_id TEXT`
- **Columns**: `full_notes TEXT`, `recording_url TEXT`, `updated_at TIMESTAMPTZ`
- **RLS Policies**:
  - `Founders can view all session content`: Checks `profiles.role = 'founder'`.
  - `Hosts can view their own hosted sessions`: Checks `profiles.role = 'host'` AND `session_content.session_id = ANY(profiles.hosted_sessions)`.
  - `Students can view their enrolled sessions`: Checks `profiles.role = 'student'` AND `session_content.session_id = ANY(profiles.enrolled_sessions)`.
- **Implicit Foreign Keys / Cross-Repo Dependencies**:
  - `session_id` implicitly matches lesson/session identifiers managed in `COSYevents` / `COSYplatform`.
  - RLS relies entirely on `profiles.id = auth.uid()` from `COSYplatform`'s primary `profiles` table.

### C. `public.manual_content` (`COSYmanuals`)
- **Primary Key**: `manual_id TEXT`
- **Columns**: `language TEXT NOT NULL`, `level TEXT NOT NULL`, `markdown_content TEXT NOT NULL`, `updated_at TIMESTAMPTZ`
- **RLS Policies**:
  - `Authenticated users can read manual content`: `USING (true)` for all authenticated users.
  - `Service role can manage manual content`: Full manage access for service role.
- **Implicit Foreign Keys / Cross-Repo Dependencies**:
  - Open read access for all authenticated users logged in via `COSYplatform` / Supabase auth.

---

## 4. Key Findings & Recommendations

1. **Role Constraint Unification**:
   - Update `COSYplatform`'s `supabase/schema.sql` to include `'host'` in the `profiles.role` CHECK constraint:
     `CHECK (role IN ('founder', 'host', 'teacher', 'student'))`.

2. **Centralized Schema Consolidation**:
   - Combine all database DDL into a unified migrations folder in `COSYplatform` or a shared `COSYdatabase` repository to ensure execution order is deterministic.

3. **Column Syncing**:
   - Include `enrolled_sessions` and `hosted_sessions` directly in the core `profiles` table definition or as explicit migration scripts.
