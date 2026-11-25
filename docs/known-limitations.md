# Known Limitations & Security Considerations

This document records the current security boundary of COSYplatform. It replaces the earlier `?key=` / `data/access-grants.json` description; that mechanism no longer exists.

---

## Authentication and authorisation

- **Authentication:** Supabase Auth. The browser holds a normal user session and an anon key. The anon key is public by design.
- **Authorisation:** Supabase Row Level Security (RLS) on `profiles`, `access_grants`, lesson content, progress, vocabulary and submissions. RLS is the security boundary.
- **Page guards:** `shared/js/auth-guard.js` and per-page role checks decide which UI a role may see. They are a usability layer, not a substitute for RLS. Never rely on a hidden button or a redirect as access control.
- **Founder mode:** the mode switcher only renders for `founder`. Students and teachers cannot call it, and direct URLs are still checked against their server-verified role.

---

## Current limitations

1. **The repository and GitHub Pages site are public.**
   - Every static file in the repository is readable by anyone, including `roadmaps/`, `curriculums/` and the committed `lessons/` source files.
   - The deployed app reads lesson bodies from Supabase for normal operation, but the source copies remain public.
   - Some committed lesson files still contain `teacher_notes` (teacher scripts, CCQs, adaptation notes). `scripts/check_protected_keys.js` treats that key as an advisory, not a hard failure, so it can remain in the repository.

2. **Static HTML cannot hide its own structure.**
   - Anyone can request `teacher.html`, `founder.html` or `lesson-studio.html`. They will see the page shell; data behind it is still subject to RLS.
   - There is no server-side session check before a static page is served.

3. **Client-side redirects are not a security control.**
   - Deep-link return and sign-in redirects are validated to stay inside the current app, but they only affect navigation.

---

## Required mitigation before adding new paid content

Do not treat this repository as a private store. Before adding new protected material:

1. Make the repository private, or move `lessons/`, `roadmaps/` and `curriculums/` source into a private content repository.
2. Publish sanitized student bodies to `lesson_student_content` and teacher/answer material to `lesson_protected`.
3. Keep only public previews in this repository.
4. Run `npm run check:protected` and review its advisory list.

If the repository must remain public, the content in Git history is already exposed and must be treated as public. Rotating keys does not remove that exposure.
