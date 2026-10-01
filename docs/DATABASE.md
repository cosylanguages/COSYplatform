# Database & Schema Management

## Overview

The CosyLanguages ecosystem (`COSYplatform`, `COSYevents`, and `COSYmanuals`) shares a single Supabase backend project.

To maintain a strict single source of truth and eliminate schema drift across repositories, all database migrations are centralized in this repository (`COSYplatform`) within the [`supabase/migrations/`](../supabase/migrations/) directory.

## Schema Migrations

Database changes must be added as sequential migration files in [`supabase/migrations/`](../supabase/migrations/):

- **`0001_core_profiles_and_lessons.sql`**: Core user profiles (`public.profiles`) and lesson content (`public.lesson_content`) tables, along with Row-Level Security (RLS) policies.
- **`0002_session_content.sql`**: Extension for event sessions (`public.session_content`), adding `enrolled_sessions` and `hosted_sessions` columns to `public.profiles` and defining event-specific RLS policies.
- **`0003_manual_content.sql`**: Extension for manuals (`public.manual_content`) storing markdown manuals and defining RLS policies.
- **`0004_fix_profiles_policy_recursion.sql`**: Fixes infinite recursion in the `public.profiles` RLS policy by introducing a `SECURITY DEFINER` function `public.is_founder()`.
- **`0005_profile_onboarding_and_founder_updates.sql`**: Automatic profile onboarding trigger (`handle_new_user()`), backfill for existing auth users, and founder UPDATE RLS policy (`Founders can update profiles`).

## Repository Guidance

- **`COSYplatform`**: Maintains the canonical schema migration scripts in `supabase/migrations/`.
- **`COSYevents` & `COSYmanuals`**: Should **not** maintain separate `schema.sql` files. Instead, refer to `COSYplatform` (`supabase/migrations/`) as the authoritative source of truth for database schema definitions.

## Order of Execution

When provisioning or applying migrations to a fresh Supabase environment, execute the migrations in numerical order:
1. `0001_core_profiles_and_lessons.sql`
2. `0002_session_content.sql`
3. `0003_manual_content.sql`
4. `0004_fix_profiles_policy_recursion.sql`
5. `0005_profile_onboarding_and_founder_updates.sql`

This guarantees that base tables (e.g. `public.profiles`) exist prior to subsequent `ALTER TABLE` statements or policy references.
