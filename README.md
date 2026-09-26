# COSYplatform Content Repository

Welcome to the **COSYplatform Content Repository**! This repository hosts all interactive curriculums, roadmaps, teacher manuals, and lesson markup files used by the **CosyLanguages** teaching and learning ecosystem.

> ⚠️ **IMPORTANT CONTENT SECURITY WARNING:**
> All files under `lessons/**/*.xml` (and any real content in `manuals/`, `teacher-guides/`, `student-workbooks/`, `activities/`, `marathons/`, or `reference/`) committed to this public git repository MUST be treated as **pre-publish drafts only**.
>
> Production interactive lesson content (including teacher-notes, tapescripts, speech prompts, and answer keys) is gated and served live from Supabase. Final lesson materials must be published to Supabase using the local founder script:
> ```bash
> node scripts/publish_to_supabase.js
> ```

---

## 📁 Repository Structure

```
.
├── docs/                        # Platform architecture & markup specifications
│   ├── architecture.md          # Dual-page view, monolingual policy, group modes & timing models
│   ├── lesson-format-spec.md    # CosyLanguages (<cosy-*>) markup specification
│   └── teacher-catalog-guide.md # Teacher catalog structure, CCQ guide & multi-duration guide
├── schemas/                     # Formal validation schemas
│   └── lesson.schema.json       # JSON Schema supporting duration & classroom modes
├── curriculums/                 # High-level curriculum definitions
├── roadmaps/                    # Course maps and lesson sequences
├── manuals/                     # Teacher guides & onboarding instructions
│   └── teacher-guide-first-lesson.md # First lesson ("Aloha") setup & multi-duration guide
├── lessons/                     # Lesson interactive slides content
├── shared/                      # Shared JS/CSS modules
│   └── js/auth-guard.js         # Supabase Auth & RLS Role Guard Module
└── login.html                   # Authentication login portal
```

---

## 🔒 Access Control & Authentication (Supabase Auth + RLS)

COSYplatform uses **Supabase Auth** and **PostgreSQL Row Level Security (RLS)** as the single, platform-wide access control mechanism across all entry portals (`founder.html`, `teacher.html`, `student.html`, `index.html`).

### 1. Account Roles & Profiles Table
User permissions are tied to their authenticated account (`auth.users`) and their corresponding entry in the `profiles` table in Supabase:

* **`founder`**: Executive role with unrestricted access to all active language spaces, platform analytics, and full content streams.
* **`teacher`**: Access to dedicated teacher spaces, teacher notes, speech scripts, and lesson release controls for assigned languages (`language_access`) and levels (`course_level`).
* **`student`**: Access to student workspaces, interactive lesson slides, and released course roadmaps matching their assigned `language_access` and `course_level`.

### 2. Login Flow
Users log in at `login.html` using their email and password via Supabase Auth (`supabase.auth.signInWithPassword`). Account creation is managed directly by the founder/administrator via the Supabase dashboard. Upon successful login, users are automatically routed to their role's portal (`founder.html`, `teacher.html`, or `student.html`).

---

## 🚀 Live Deployment & GitHub Pages

This repository is automatically published via GitHub Actions on every push to `main` using `.github/workflows/pages.yml`.

- **Live Platform Catalog**: [https://cosylanguages.github.io/COSYplatform/](https://cosylanguages.github.io/COSYplatform/)
- **Login Portal**: [https://cosylanguages.github.io/COSYplatform/login.html](https://cosylanguages.github.io/COSYplatform/login.html)

---

## 🛠 Adding New Lessons & Publishing

1. Read the markup specification in [`docs/lesson-format-spec.md`](docs/lesson-format-spec.md).
2. Create a new `.json` file in `lessons/<course-id>/`.
3. Add the lesson entry to the corresponding roadmap in `roadmaps/<course-id>.json`.
4. Validate the lesson syntax:
   ```bash
   npm run validate
   ```
5. Publish updated lesson content to Supabase:
   ```bash
   node scripts/publish_to_supabase.js
   ```
