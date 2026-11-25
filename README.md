# COSYplatform

Web app for COSY Languages students, teachers and the founder: sign-in, profile, role workspaces, live classroom and lesson studio.

Part of the COSY Languages ecosystem: https://cosylanguages.github.io/COSYlanguages/

## Access model

- **Authentication:** Supabase Auth.
- **Authorisation:** `public.profiles.role` (`student`, `teacher`, `founder`) plus Supabase Row Level Security. Page-level role guards are UX only; they are not the security boundary.
- **Founder mode:** only the founder account can switch between student, teacher and founder workspaces.
- **Student data:** lesson answers, progress, vocabulary, submissions and grants live in Supabase and are filtered by RLS.

## Content source files

`curriculums/`, `roadmaps/`, `lessons/`, `activities/` and `schemas/` are source material for the publish pipeline. The deployed app reads lesson bodies from Supabase, not directly from `lessons/`.

This repository is public. Do not add answer keys, unpublished workbook masters, service-role keys or other protected material. See `docs/known-limitations.md`.

## Local checks

```bash
npm ci
npm run validate          # content integrity, languages, protected keys, stats, tests
npm run check:legacy-tables
npm run stats:build       # regenerate data/platform-stats.json after content changes
```

Live deployment: https://cosylanguages.github.io/COSYplatform/

Copyright (c) 2026 COSY Languages. All rights reserved.