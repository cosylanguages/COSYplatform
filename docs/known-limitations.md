# Known Limitations & Security Considerations

This document outlines architectural constraints, known limitations, and security considerations inherent in the static-site design of COSYplatform.

---

## 🔒 Client-Side Access Control Model

### Overview
COSYplatform operates as a serverless static client-side web application. Access control is enforced via URL parameters (e.g., `?key=unique-token`) checked in the browser against `data/access-grants.json` by client-side JavaScript in `teacher.html` and `student.html`.

### Primary Limitations

1. **Public Visibility of Grants**:
   - `data/access-grants.json` is a publicly accessible static JSON file hosted on GitHub Pages (or equivalent static hosting).
   - Anyone who can open browser Developer Tools (Network/Sources tab) or view repository source code can inspect `data/access-grants.json`.

2. **Discoverability of Access Keys**:
   - Because `data/access-grants.json` contains all active access tokens (`key`), an actor with access to the source code or deployed static site bundle can retrieve valid keys for teachers and students.

3. **No Server-Side Session Enforcement**:
   - There is no server-side authentication, session state, token verification, or authorization proxy.
   - All role checks (`teacher` vs `student`) and course entitlements filtering take place strictly in the client-side JavaScript engine.

---

## 💡 Trade-Offs & Rationale

This access control model was selected deliberately to support:
- **Zero-Infrastructure Overhead**: Hosting entirely on static web servers (GitHub Pages / Netlify / Vercel CDN) with zero backend maintenance or database costs.
- **Frictionless Distribution**: Enabling teachers and founders to onboard students instantly via shareable direct links without forcing students to complete email signups or password resets.

---

## 🚀 Potential Future Mitigations

If stricter content protection or private user data security becomes necessary in future platform versions, the following upgrades may be considered:

1. **Edge Function Access Validation**:
   - Move `data/access-grants.json` behind a lightweight serverless edge function (e.g. Cloudflare Workers or Vercel Edge Middleware) that validates keys before serving lesson markup files.
2. **Encrypted Key Hashes**:
   - Store hashed tokens (`bcrypt` / `SHA-256`) rather than plaintext keys, preventing direct key harvesting from static file inspection.
3. **User Authentication Service**:
   - Implement OAuth / JWT authentication (e.g. Auth0, Firebase Authentication, or Supabase) for authenticating users server-side.
