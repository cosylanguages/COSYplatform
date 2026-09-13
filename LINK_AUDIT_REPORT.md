# Link Audit Report

This document provides a comprehensive link and reference audit across the CosyLanguages repository. Every internal reference in scope was checked against existing files and directories. No code or content changes were made as part of this audit.

## Executive Summary

| Category | Total References Checked | Resolved | Unresolved | Resolution Rate |
| --- | --- | --- | --- | --- |
| 1. HTML relative `href` / `src` | 263 | 89 | 174 | 33.8% |
| 2. Markdown links (`.md`) | 3 | 2 | 1 | 66.7% |
| 3. Roadmap sequence `id` → Lesson files | 966 | 2 | 964 | 0.2% |
| 4. `curriculumId` in `curriculums/**/*.json` → `roadmaps/` | 0 | 0 | 0 | N/A* |
| 5. Course IDs in `data/access-grants.json` → `curriculums/` / `roadmaps/` | 9 | 9 | 0 | 100.0% |

* \*Note on Category 4: No JSON file under `curriculums/**/*.json` defines a `curriculumId` property (top-level curriculum files use `id` e.g. `curriculum-english-a0`). For top-level curriculum `id` attributes, 24/24 (100%) match existing roadmap files.

---

## Category 1: HTML Relative `href` / `src` References

- **Total References Checked:** 263
- **Resolved:** 89
- **Unresolved:** 174

### Unresolved HTML References by Source File

| Source File | Element Tag & Attribute | Referenced Link | Target Path Evaluated |
| --- | --- | --- | --- |
| `curriculums/el/general/A1.html` | `<link href>` | `../../images/cosylanguages.png` | `curriculums/images/cosylanguages.png` |
| `curriculums/el/general/A1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `curriculums/el/general/A1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `curriculums/el/general/A1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `curriculums/el/general/A1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `curriculums/el/general/A1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `curriculums/en/general/A1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `curriculums/en/general/A1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `curriculums/en/general/A1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `curriculums/en/general/A1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `curriculums/en/general/A1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `curriculums/fr/general/A1.html` | `<link href>` | `../../images/cosylanguages.png` | `curriculums/images/cosylanguages.png` |
| `curriculums/fr/general/A1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `curriculums/fr/general/A1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `curriculums/fr/general/A1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `curriculums/fr/general/A1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `curriculums/fr/general/A1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `curriculums/it/general/A1.html` | `<link href>` | `../../images/cosylanguages.png` | `curriculums/images/cosylanguages.png` |
| `curriculums/it/general/A1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `curriculums/it/general/A1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `curriculums/it/general/A1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `curriculums/it/general/A1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `curriculums/it/general/A1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `curriculums/ru/general/A1.html` | `<link href>` | `../../images/cosylanguages.png` | `curriculums/images/cosylanguages.png` |
| `curriculums/ru/general/A1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `curriculums/ru/general/A1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `curriculums/ru/general/A1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `curriculums/ru/general/A1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `curriculums/ru/general/A1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/tokens.css` | `shared/styles/tokens.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/base.css` | `shared/styles/base.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/components.css` | `shared/styles/components.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/layout.css` | `shared/styles/layout.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/lang-pages.css` | `shared/styles/lang-pages.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/lang-accents.css` | `shared/styles/lang-accents.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<link href>` | `../../shared/styles/mobile.css` | `shared/styles/mobile.css` |
| `marathons/pronunciation-bootcamp/index.html` | `<a href>` | `pronunciation.html` | `marathons/pronunciation-bootcamp/pronunciation.html` |
| `marathons/pronunciation-bootcamp/index.html` | `<a href>` | `pronunciation.html` | `marathons/pronunciation-bootcamp/pronunciation.html` |
| `marathons/pronunciation-bootcamp/index.html` | `<script src>` | `../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/index.html` | `<script src>` | `../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/index.html` | `<script src>` | `../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/index.html` | `<script src>` | `../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/tokens.css` | `css/tokens.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/base.css` | `css/base.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/layout.css` | `css/layout.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/lang-pages.css` | `css/lang-pages.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/lang-accents.css` | `css/lang-accents.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<link href>` | `../../../css/mobile.css` | `css/mobile.css` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/levels/a0-a1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/tokens.css` | `css/tokens.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/base.css` | `css/base.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/layout.css` | `css/layout.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/lang-pages.css` | `css/lang-pages.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/lang-accents.css` | `css/lang-accents.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<link href>` | `../../../css/mobile.css` | `css/mobile.css` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/levels/a2.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/tokens.css` | `css/tokens.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/base.css` | `css/base.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/layout.css` | `css/layout.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/lang-pages.css` | `css/lang-pages.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/lang-accents.css` | `css/lang-accents.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<link href>` | `../../../css/mobile.css` | `css/mobile.css` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/levels/b1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/tokens.css` | `css/tokens.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/base.css` | `css/base.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/layout.css` | `css/layout.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/lang-pages.css` | `css/lang-pages.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/lang-accents.css` | `css/lang-accents.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<link href>` | `../../../css/mobile.css` | `css/mobile.css` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/levels/b2.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/tokens.css` | `css/tokens.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/base.css` | `css/base.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/layout.css` | `css/layout.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/lang-pages.css` | `css/lang-pages.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/lang-accents.css` | `css/lang-accents.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<link href>` | `../../../css/mobile.css` | `css/mobile.css` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/levels/c1.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/tokens.css` | `css/tokens.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/base.css` | `css/base.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/components.css` | `css/components.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/layout.css` | `css/layout.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/lang-pages.css` | `css/lang-pages.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/lang-accents.css` | `css/lang-accents.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<link href>` | `../../../css/mobile.css` | `css/mobile.css` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<script src>` | `../../../js/data/languages.js` | `js/data/languages.js` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<script src>` | `../../../js/core/engine.js` | `js/core/engine.js` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<script src>` | `../../../js/core/i18n.js` | `js/core/i18n.js` |
| `marathons/pronunciation-bootcamp/levels/c2.html` | `<script src>` | `../../../js/core/ui.js` | `js/core/ui.js` |
| `shared/templates/curriculum-template.html` | `<a href>` | `unit-1.html` | `shared/templates/unit-1.html` |
| `shared/templates/curriculum-template.html` | `<a href>` | `unit-2.html` | `shared/templates/unit-2.html` |
| `shared/templates/unit-template.html` | `<a href>` | `index.html` | `shared/templates/index.html` |
| `shared/templates/unit-template.html` | `<a href>` | `unit-[X-1].html` | `shared/templates/unit-[X-1].html` |
| `shared/templates/unit-template.html` | `<a href>` | `index.html` | `shared/templates/index.html` |
| `shared/templates/unit-template.html` | `<a href>` | `unit-[X+1].html` | `shared/templates/unit-[X+1].html` |
| `templates/communication/index-template.html` | `<link href>` | `../../images/logos/cosylanguages.png` | `images/logos/cosylanguages.png` |
| `templates/communication/index-template.html` | `<link href>` | `../../css/tokens.css` | `css/tokens.css` |
| `templates/communication/index-template.html` | `<link href>` | `../../css/base.css` | `css/base.css` |
| `templates/communication/index-template.html` | `<link href>` | `../../css/components.css` | `css/components.css` |
| `templates/communication/index-template.html` | `<link href>` | `../../css/layout.css` | `css/layout.css` |
| `templates/communication/index-template.html` | `<a href>` | `en.html` | `templates/communication/en.html` |
| `templates/communication/index-template.html` | `<a href>` | `fr.html` | `templates/communication/fr.html` |
| `templates/communication/index-template.html` | `<a href>` | `it.html` | `templates/communication/it.html` |
| `templates/communication/index-template.html` | `<a href>` | `ru.html` | `templates/communication/ru.html` |
| `templates/communication/index-template.html` | `<a href>` | `el.html` | `templates/communication/el.html` |
| `templates/communication/index-template.html` | `<a href>` | `../manuals/english-a0-a1.html` | `templates/manuals/english-a0-a1.html` |
| `templates/communication/index-template.html` | `<a href>` | `communication/starting-unit.html` | `templates/communication/communication/starting-unit.html` |
| `templates/communication/index-template.html` | `<script src>` | `../../js/data/languages.js` | `js/data/languages.js` |
| `templates/communication/index-template.html` | `<script src>` | `../../js/core/engine.js` | `js/core/engine.js` |
| `templates/communication/index-template.html` | `<script src>` | `../../js/core/i18n.js` | `js/core/i18n.js` |
| `templates/communication/index-template.html` | `<script src>` | `../../js/core/ui.js` | `js/core/ui.js` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../images/logos/cosylanguages.png` | `../images/logos/cosylanguages.png` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../css/tokens.css` | `../css/tokens.css` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../css/base.css` | `../css/base.css` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../css/components.css` | `../css/components.css` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../css/layout.css` | `../css/layout.css` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../css/grammar.css` | `../css/grammar.css` |
| `templates/communication/unit-template.html` | `<link href>` | `../../../css/communication.css` | `../css/communication.css` |
| `templates/communication/unit-template.html` | `<a href>` | `../xx.html` | `templates/xx.html` |
| `templates/communication/unit-template.html` | `<a href>` | `../xx.html` | `templates/xx.html` |
| `templates/communication/unit-template.html` | `<a href>` | `../grammar/part-1.html` | `templates/grammar/part-1.html` |
| `templates/communication/unit-template.html` | `<a href>` | `../../vocabulary-manual/part-1.html` | `vocabulary-manual/part-1.html` |
| `templates/communication/unit-template.html` | `<script src>` | `../../js/data/languages.js` | `js/data/languages.js` |
| `templates/communication/unit-template.html` | `<script src>` | `../../js/core/engine.js` | `js/core/engine.js` |
| `templates/communication/unit-template.html` | `<script src>` | `../../js/core/i18n.js` | `js/core/i18n.js` |
| `templates/communication/unit-template.html` | `<script src>` | `../../js/core/ui.js` | `js/core/ui.js` |
| `templates/curriculum-template.html` | `<a href>` | `unit-1.html` | `templates/unit-1.html` |
| `templates/curriculum-template.html` | `<a href>` | `unit-2.html` | `templates/unit-2.html` |
| `templates/grammar/lesson-template.html` | `<link href>` | `../../../images/logos/cosylanguages.png` | `../images/logos/cosylanguages.png` |
| `templates/grammar/lesson-template.html` | `<link href>` | `../../../css/tokens.css` | `../css/tokens.css` |
| `templates/grammar/lesson-template.html` | `<link href>` | `../../../css/base.css` | `../css/base.css` |
| `templates/grammar/lesson-template.html` | `<link href>` | `../../../css/components.css` | `../css/components.css` |
| `templates/grammar/lesson-template.html` | `<link href>` | `../../../css/layout.css` | `../css/layout.css` |
| `templates/grammar/lesson-template.html` | `<link href>` | `../../../css/grammar.css` | `../css/grammar.css` |
| `templates/grammar/lesson-template.html` | `<a href>` | `../xx.html` | `templates/xx.html` |
| `templates/grammar/lesson-template.html` | `<a href>` | `../xx.html` | `templates/xx.html` |
| `templates/grammar/lesson-template.html` | `<script src>` | `../../js/data/languages.js` | `js/data/languages.js` |
| `templates/grammar/lesson-template.html` | `<script src>` | `../../js/core/engine.js` | `js/core/engine.js` |
| `templates/grammar/lesson-template.html` | `<script src>` | `../../js/core/i18n.js` | `js/core/i18n.js` |
| `templates/grammar/lesson-template.html` | `<script src>` | `../../js/core/ui.js` | `js/core/ui.js` |
| `templates/grammar/roadmap-template.html` | `<link href>` | `../../images/logos/cosylanguages.png` | `images/logos/cosylanguages.png` |
| `templates/grammar/roadmap-template.html` | `<link href>` | `../../css/tokens.css` | `css/tokens.css` |
| `templates/grammar/roadmap-template.html` | `<link href>` | `../../css/base.css` | `css/base.css` |
| `templates/grammar/roadmap-template.html` | `<link href>` | `../../css/components.css` | `css/components.css` |
| `templates/grammar/roadmap-template.html` | `<link href>` | `../../css/layout.css` | `css/layout.css` |
| `templates/grammar/roadmap-template.html` | `<a href>` | `../grammar-reference.html` | `templates/grammar-reference.html` |
| `templates/grammar/roadmap-template.html` | `<a href>` | `morphology/xx-lesson.html` | `templates/grammar/morphology/xx-lesson.html` |
| `templates/grammar/roadmap-template.html` | `<script src>` | `../../js/data/languages.js` | `js/data/languages.js` |
| `templates/grammar/roadmap-template.html` | `<script src>` | `../../js/core/engine.js` | `js/core/engine.js` |
| `templates/grammar/roadmap-template.html` | `<script src>` | `../../js/core/i18n.js` | `js/core/i18n.js` |
| `templates/grammar/roadmap-template.html` | `<script src>` | `../../js/core/ui.js` | `js/core/ui.js` |
| `templates/unit-template.html` | `<a href>` | `index.html` | `templates/index.html` |
| `templates/unit-template.html` | `<a href>` | `unit-[X-1].html` | `templates/unit-[X-1].html` |
| `templates/unit-template.html` | `<a href>` | `index.html` | `templates/index.html` |
| `templates/unit-template.html` | `<a href>` | `unit-[X+1].html` | `templates/unit-[X+1].html` |

---

## Category 2: Markdown Links in `.md` Files

- **Total References Checked:** 3
- **Resolved:** 2
- **Unresolved:** 1

### Unresolved Markdown References by Source File

| Source File | Reference Type | Referenced Link | Target Path Evaluated |
| --- | --- | --- | --- |
| `docs/lesson-format-spec.md` | `<cosy-iframe src>` | `...` | `docs/...` |

---

## Category 3: Roadmap Sequence IDs → Lesson Files

- **Total References Checked:** 966
- **Resolved:** 2
- **Unresolved:** 964

### Per-Roadmap Coverage Table

| Roadmap File | Total Lessons | Resolved | Unresolved | Coverage % |
| --- | --- | --- | --- | --- |
| `general-english-a0.json` | 46 | 0 | 46 | 0.0% |
| `general-english-a1.json` | 63 | 0 | 63 | 0.0% |
| `general-english-a2.json` | 71 | 0 | 71 | 0.0% |
| `general-english-b1.json` | 81 | 0 | 81 | 0.0% |
| `general-english-b2.json` | 72 | 0 | 72 | 0.0% |
| `general-english-c1.json` | 65 | 1 | 64 | 1.5% |
| `grammar-english-a0.json` | 42 | 0 | 42 | 0.0% |
| `grammar-english-a1.json` | 42 | 0 | 42 | 0.0% |
| `grammar-english-a2.json` | 34 | 0 | 34 | 0.0% |
| `grammar-english-b1.json` | 52 | 0 | 52 | 0.0% |
| `grammar-english-b2.json` | 53 | 0 | 53 | 0.0% |
| `grammar-english-c1.json` | 25 | 0 | 25 | 0.0% |
| `introductory-english.json` | 6 | 1 | 5 | 16.7% |
| `phrasal-verbs-english-a2.json` | 5 | 0 | 5 | 0.0% |
| `phrasal-verbs-english-b1.json` | 15 | 0 | 15 | 0.0% |
| `phrasal-verbs-english-b2.json` | 21 | 0 | 21 | 0.0% |
| `spoken-english-a1.json` | 22 | 0 | 22 | 0.0% |
| `spoken-english-a2.json` | 68 | 0 | 68 | 0.0% |
| `spoken-english-b1.json` | 80 | 0 | 80 | 0.0% |
| `spoken-english-b2.json` | 33 | 0 | 33 | 0.0% |
| `spoken-english-c1.json` | 32 | 0 | 32 | 0.0% |
| `vocabulary-english-a1.json` | 4 | 0 | 4 | 0.0% |
| `vocabulary-english-a2.json` | 32 | 0 | 32 | 0.0% |
| `vocabulary-english-b1.json` | 2 | 0 | 2 | 0.0% |

### Unresolved Lesson IDs by Source Roadmap File

| Source Roadmap File | Unresolved Lesson ID | Expected Lesson File Target |
| --- | --- | --- |
| `general-english-a0.json` | `ge-a0-more-about-the-course` | `lessons/*/ge-a0-more-about-the-course.(xml|json)` |
| `general-english-a0.json` | `ge-a0-pronunciation-topics` | `lessons/*/ge-a0-pronunciation-topics.(xml|json)` |
| `general-english-a0.json` | `ge-a0-grammar-topics` | `lessons/*/ge-a0-grammar-topics.(xml|json)` |
| `general-english-a0.json` | `ge-a0-vocabulary-topics` | `lessons/*/ge-a0-vocabulary-topics.(xml|json)` |
| `general-english-a0.json` | `hello-friend` | `lessons/*/hello-friend.(xml|json)` |
| `general-english-a0.json` | `pronouns-plus-to-be` | `lessons/*/pronouns-plus-to-be.(xml|json)` |
| `general-english-a0.json` | `young-and-beautiful` | `lessons/*/young-and-beautiful.(xml|json)` |
| `general-english-a0.json` | `time-to-show-off` | `lessons/*/time-to-show-off.(xml|json)` |
| `general-english-a0.json` | `its-my-family` | `lessons/*/its-my-family.(xml|json)` |
| `general-english-a0.json` | `how-do-you-feel-today` | `lessons/*/how-do-you-feel-today.(xml|json)` |
| `general-english-a0.json` | `my-little-friend` | `lessons/*/my-little-friend.(xml|json)` |
| `general-english-a0.json` | `i-know-you` | `lessons/*/i-know-you.(xml|json)` |
| `general-english-a0.json` | `ge-a0-progress-test-1` | `lessons/*/ge-a0-progress-test-1.(xml|json)` |
| `general-english-a0.json` | `where-is-my-phone-again` | `lessons/*/where-is-my-phone-again.(xml|json)` |
| `general-english-a0.json` | `whats-in-your-bag` | `lessons/*/whats-in-your-bag.(xml|json)` |
| `general-english-a0.json` | `what-do-you-use-every-day` | `lessons/*/what-do-you-use-every-day.(xml|json)` |
| `general-english-a0.json` | `pack-up` | `lessons/*/pack-up.(xml|json)` |
| `general-english-a0.json` | `my-daily-routine` | `lessons/*/my-daily-routine.(xml|json)` |
| `general-english-a0.json` | `who-does-it` | `lessons/*/who-does-it.(xml|json)` |
| `general-english-a0.json` | `a-man-of-100-faces` | `lessons/*/a-man-of-100-faces.(xml|json)` |
| `general-english-a0.json` | `temperament-matters` | `lessons/*/temperament-matters.(xml|json)` |
| `general-english-a0.json` | `ge-a0-progress-test-2` | `lessons/*/ge-a0-progress-test-2.(xml|json)` |
| `general-english-a0.json` | `ge-a0-midterm-exam` | `lessons/*/ge-a0-midterm-exam.(xml|json)` |
| `general-english-a0.json` | `whats-the-weather-like-today` | `lessons/*/whats-the-weather-like-today.(xml|json)` |
| `general-english-a0.json` | `perfect-hobby` | `lessons/*/perfect-hobby.(xml|json)` |
| `general-english-a0.json` | `holidays-are-coming` | `lessons/*/holidays-are-coming.(xml|json)` |
| `general-english-a0.json` | `top-presents` | `lessons/*/top-presents.(xml|json)` |
| `general-english-a0.json` | `we-need-a-flat` | `lessons/*/we-need-a-flat.(xml|json)` |
| `general-english-a0.json` | `furnish-it` | `lessons/*/furnish-it.(xml|json)` |
| `general-english-a0.json` | `housewarming-party` | `lessons/*/housewarming-party.(xml|json)` |
| `general-english-a0.json` | `difficulties-of-house-move` | `lessons/*/difficulties-of-house-move.(xml|json)` |
| `general-english-a0.json` | `ge-a0-progress-test-3` | `lessons/*/ge-a0-progress-test-3.(xml|json)` |
| `general-english-a0.json` | `all-sorts-of-diets` | `lessons/*/all-sorts-of-diets.(xml|json)` |
| `general-english-a0.json` | `try-this-shirt` | `lessons/*/try-this-shirt.(xml|json)` |
| `general-english-a0.json` | `shopping-day` | `lessons/*/shopping-day.(xml|json)` |
| `general-english-a0.json` | `shop-online` | `lessons/*/shop-online.(xml|json)` |
| `general-english-a0.json` | `live-long` | `lessons/*/live-long.(xml|json)` |
| `general-english-a0.json` | `remarkable-people` | `lessons/*/remarkable-people.(xml|json)` |
| `general-english-a0.json` | `how-i-met-my-friend` | `lessons/*/how-i-met-my-friend.(xml|json)` |
| `general-english-a0.json` | `what-a-record` | `lessons/*/what-a-record.(xml|json)` |
| `general-english-a0.json` | `ge-a0-progress-test-4` | `lessons/*/ge-a0-progress-test-4.(xml|json)` |
| `general-english-a0.json` | `ge-a0-final-exam-prep` | `lessons/*/ge-a0-final-exam-prep.(xml|json)` |
| `general-english-a0.json` | `final-exam-prep-mixed` | `lessons/*/final-exam-prep-mixed.(xml|json)` |
| `general-english-a0.json` | `ge-a0-final-exam` | `lessons/*/ge-a0-final-exam.(xml|json)` |
| `general-english-a0.json` | `final-exam-mixed` | `lessons/*/final-exam-mixed.(xml|json)` |
| `general-english-a0.json` | `ge-a0-final-feedback` | `lessons/*/ge-a0-final-feedback.(xml|json)` |
| `general-english-a1.json` | `ge-a1-more-about-the-course` | `lessons/*/ge-a1-more-about-the-course.(xml|json)` |
| `general-english-a1.json` | `ge-a1-grammar-topics` | `lessons/*/ge-a1-grammar-topics.(xml|json)` |
| `general-english-a1.json` | `grammar-translation` | `lessons/*/grammar-translation.(xml|json)` |
| `general-english-a1.json` | `ge-a1-pronunciation-topics` | `lessons/*/ge-a1-pronunciation-topics.(xml|json)` |
| `general-english-a1.json` | `ge-a1-vocabulary-topics` | `lessons/*/ge-a1-vocabulary-topics.(xml|json)` |
| `general-english-a1.json` | `nice-to-meet-you` | `lessons/*/nice-to-meet-you.(xml|json)` |
| `general-english-a1.json` | `more-about-me` | `lessons/*/more-about-me.(xml|json)` |
| `general-english-a1.json` | `family-exchange` | `lessons/*/family-exchange.(xml|json)` |
| `general-english-a1.json` | `world-of-people` | `lessons/*/world-of-people.(xml|json)` |
| `general-english-a1.json` | `where-do-real-heroes-work` | `lessons/*/where-do-real-heroes-work.(xml|json)` |
| `general-english-a1.json` | `daily-routine` | `lessons/*/daily-routine.(xml|json)` |
| `general-english-a1.json` | `lets-have-fun-together` | `lessons/*/lets-have-fun-together.(xml|json)` |
| `general-english-a1.json` | `corporate-culture` | `lessons/*/corporate-culture.(xml|json)` |
| `general-english-a1.json` | `ge-a1-progress-test-1` | `lessons/*/ge-a1-progress-test-1.(xml|json)` |
| `general-english-a1.json` | `where-i-live` | `lessons/*/where-i-live.(xml|json)` |
| `general-english-a1.json` | `what-a-mess` | `lessons/*/what-a-mess.(xml|json)` |
| `general-english-a1.json` | `making-it-cosy` | `lessons/*/making-it-cosy.(xml|json)` |
| `general-english-a1.json` | `a-room-for-two` | `lessons/*/a-room-for-two.(xml|json)` |
| `general-english-a1.json` | `on-cloud-nine` | `lessons/*/on-cloud-nine.(xml|json)` |
| `general-english-a1.json` | `join-a-group` | `lessons/*/join-a-group.(xml|json)` |
| `general-english-a1.json` | `no-limit` | `lessons/*/no-limit.(xml|json)` |
| `general-english-a1.json` | `the-art-of-doing-nothing` | `lessons/*/the-art-of-doing-nothing.(xml|json)` |
| `general-english-a1.json` | `ge-a1-progress-test-2` | `lessons/*/ge-a1-progress-test-2.(xml|json)` |
| `general-english-a1.json` | `whats-in-your-fridge` | `lessons/*/whats-in-your-fridge.(xml|json)` |
| `general-english-a1.json` | `ready-to-order` | `lessons/*/ready-to-order.(xml|json)` |
| `general-english-a1.json` | `happy-diet` | `lessons/*/happy-diet.(xml|json)` |
| `general-english-a1.json` | `eating-tasty` | `lessons/*/eating-tasty.(xml|json)` |
| `general-english-a1.json` | `biographies` | `lessons/*/biographies.(xml|json)` |
| `general-english-a1.json` | `history` | `lessons/*/history.(xml|json)` |
| `general-english-a1.json` | `odd-coincidences` | `lessons/*/odd-coincidences.(xml|json)` |
| `general-english-a1.json` | `the-power-of-storytelling` | `lessons/*/the-power-of-storytelling.(xml|json)` |
| `general-english-a1.json` | `ge-a1-progress-test-3` | `lessons/*/ge-a1-progress-test-3.(xml|json)` |
| `general-english-a1.json` | `ge-a1-midterm-exam` | `lessons/*/ge-a1-midterm-exam.(xml|json)` |
| `general-english-a1.json` | `how-do-i-look` | `lessons/*/how-do-i-look.(xml|json)` |
| `general-english-a1.json` | `clothes` | `lessons/*/clothes.(xml|json)` |
| `general-english-a1.json` | `world-fashion` | `lessons/*/world-fashion.(xml|json)` |
| `general-english-a1.json` | `wanted` | `lessons/*/wanted.(xml|json)` |
| `general-english-a1.json` | `let-it-snow` | `lessons/*/let-it-snow.(xml|json)` |
| `general-english-a1.json` | `weather-forecast` | `lessons/*/weather-forecast.(xml|json)` |
| `general-english-a1.json` | `going-to-the-zoo` | `lessons/*/going-to-the-zoo.(xml|json)` |
| `general-english-a1.json` | `amazing-water` | `lessons/*/amazing-water.(xml|json)` |
| `general-english-a1.json` | `ge-a1-progress-test-4` | `lessons/*/ge-a1-progress-test-4.(xml|json)` |
| `general-english-a1.json` | `at-a-shop` | `lessons/*/at-a-shop.(xml|json)` |
| `general-english-a1.json` | `im-just-looking` | `lessons/*/im-just-looking.(xml|json)` |
| `general-english-a1.json` | `black-friday` | `lessons/*/black-friday.(xml|json)` |
| `general-english-a1.json` | `best-present-ever` | `lessons/*/best-present-ever.(xml|json)` |
| `general-english-a1.json` | `medical-problems` | `lessons/*/medical-problems.(xml|json)` |
| `general-english-a1.json` | `doctors-advice` | `lessons/*/doctors-advice.(xml|json)` |
| `general-english-a1.json` | `are-you-ok` | `lessons/*/are-you-ok.(xml|json)` |
| `general-english-a1.json` | `not-a-disease` | `lessons/*/not-a-disease.(xml|json)` |
| `general-english-a1.json` | `ge-a1-progress-test-5` | `lessons/*/ge-a1-progress-test-5.(xml|json)` |
| `general-english-a1.json` | `the-best-place-ive-ever-seen` | `lessons/*/the-best-place-ive-ever-seen.(xml|json)` |
| `general-english-a1.json` | `not-only-sunbathing` | `lessons/*/not-only-sunbathing.(xml|json)` |
| `general-english-a1.json` | `the-rich-in-the-city` | `lessons/*/the-rich-in-the-city.(xml|json)` |
| `general-english-a1.json` | `work-or-travel` | `lessons/*/work-or-travel.(xml|json)` |
| `general-english-a1.json` | `how-can-i-get-to-the-hotel` | `lessons/*/how-can-i-get-to-the-hotel.(xml|json)` |
| `general-english-a1.json` | `air-or-water` | `lessons/*/air-or-water.(xml|json)` |
| `general-english-a1.json` | `you-must-behave` | `lessons/*/you-must-behave.(xml|json)` |
| `general-english-a1.json` | `for-better-or-for-worse` | `lessons/*/for-better-or-for-worse.(xml|json)` |
| `general-english-a1.json` | `ge-a1-progress-test-6` | `lessons/*/ge-a1-progress-test-6.(xml|json)` |
| `general-english-a1.json` | `ge-a1-final-exam-prep` | `lessons/*/ge-a1-final-exam-prep.(xml|json)` |
| `general-english-a1.json` | `ge-a1-final-exam` | `lessons/*/ge-a1-final-exam.(xml|json)` |
| `general-english-a1.json` | `ge-a1-final-feedback` | `lessons/*/ge-a1-final-feedback.(xml|json)` |
| `general-english-a2.json` | `a-person-in-three-words` | `lessons/*/a-person-in-three-words.(xml|json)` |
| `general-english-a2.json` | `first-impressions` | `lessons/*/first-impressions.(xml|json)` |
| `general-english-a2.json` | `are-you-a-hobbyist` | `lessons/*/are-you-a-hobbyist.(xml|json)` |
| `general-english-a2.json` | `find-me-online` | `lessons/*/find-me-online.(xml|json)` |
| `general-english-a2.json` | `out-of-gym` | `lessons/*/out-of-gym.(xml|json)` |
| `general-english-a2.json` | `sport-or-not` | `lessons/*/sport-or-not.(xml|json)` |
| `general-english-a2.json` | `the-21-day-challenge` | `lessons/*/the-21-day-challenge.(xml|json)` |
| `general-english-a2.json` | `new-olympic-sports` | `lessons/*/new-olympic-sports.(xml|json)` |
| `general-english-a2.json` | `ge-a2-progress-test-1` | `lessons/*/ge-a2-progress-test-1.(xml|json)` |
| `general-english-a2.json` | `stranger-on-the-train` | `lessons/*/stranger-on-the-train.(xml|json)` |
| `general-english-a2.json` | `an-unforgettable-meeting` | `lessons/*/an-unforgettable-meeting.(xml|json)` |
| `general-english-a2.json` | `class-reunion` | `lessons/*/class-reunion.(xml|json)` |
| `general-english-a2.json` | `a-dream-meeting` | `lessons/*/a-dream-meeting.(xml|json)` |
| `general-english-a2.json` | `no-man-is-an-island` | `lessons/*/no-man-is-an-island.(xml|json)` |
| `general-english-a2.json` | `looking-for-a-friend` | `lessons/*/looking-for-a-friend.(xml|json)` |
| `general-english-a2.json` | `friends-you-didnt-choose` | `lessons/*/friends-you-didnt-choose.(xml|json)` |
| `general-english-a2.json` | `old-new-friend` | `lessons/*/old-new-friend.(xml|json)` |
| `general-english-a2.json` | `ge-a2-progress-test-2` | `lessons/*/ge-a2-progress-test-2.(xml|json)` |
| `general-english-a2.json` | `old-jobs-new-jobs` | `lessons/*/old-jobs-new-jobs.(xml|json)` |
| `general-english-a2.json` | `working-conditions` | `lessons/*/working-conditions.(xml|json)` |
| `general-english-a2.json` | `get-interviewed` | `lessons/*/get-interviewed.(xml|json)` |
| `general-english-a2.json` | `working-abroad` | `lessons/*/working-abroad.(xml|json)` |
| `general-english-a2.json` | `healthy-working` | `lessons/*/healthy-working.(xml|json)` |
| `general-english-a2.json` | `job-burnout` | `lessons/*/job-burnout.(xml|json)` |
| `general-english-a2.json` | `medical-advice` | `lessons/*/medical-advice.(xml|json)` |
| `general-english-a2.json` | `talking-to-a-shrink` | `lessons/*/talking-to-a-shrink.(xml|json)` |
| `general-english-a2.json` | `ge-a2-progress-test-3` | `lessons/*/ge-a2-progress-test-3.(xml|json)` |
| `general-english-a2.json` | `to-rent-or-to-buy` | `lessons/*/to-rent-or-to-buy.(xml|json)` |
| `general-english-a2.json` | `too-young-to-have-children` | `lessons/*/too-young-to-have-children.(xml|json)` |
| `general-english-a2.json` | `trees-are-back-in-fashion` | `lessons/*/trees-are-back-in-fashion.(xml|json)` |
| `general-english-a2.json` | `new-goals-of-a-new-person` | `lessons/*/new-goals-of-a-new-person.(xml|json)` |
| `general-english-a2.json` | `the-future-we-all-fear` | `lessons/*/the-future-we-all-fear.(xml|json)` |
| `general-english-a2.json` | `innovations-to-change-the-world` | `lessons/*/innovations-to-change-the-world.(xml|json)` |
| `general-english-a2.json` | `do-predictions-really-work` | `lessons/*/do-predictions-really-work.(xml|json)` |
| `general-english-a2.json` | `lost-in-time` | `lessons/*/lost-in-time.(xml|json)` |
| `general-english-a2.json` | `ge-a2-progress-test-4` | `lessons/*/ge-a2-progress-test-4.(xml|json)` |
| `general-english-a2.json` | `ge-a2-midterm-exam` | `lessons/*/ge-a2-midterm-exam.(xml|json)` |
| `general-english-a2.json` | `tourists-are-not-welcome` | `lessons/*/tourists-are-not-welcome.(xml|json)` |
| `general-english-a2.json` | `staycation` | `lessons/*/staycation.(xml|json)` |
| `general-english-a2.json` | `unusual-destinations` | `lessons/*/unusual-destinations.(xml|json)` |
| `general-english-a2.json` | `travel-bucket-list` | `lessons/*/travel-bucket-list.(xml|json)` |
| `general-english-a2.json` | `new-life-in-a-village` | `lessons/*/new-life-in-a-village.(xml|json)` |
| `general-english-a2.json` | `not-like-others` | `lessons/*/not-like-others.(xml|json)` |
| `general-english-a2.json` | `expectation-vs-reality-popular-sights` | `lessons/*/expectation-vs-reality-popular-sights.(xml|json)` |
| `general-english-a2.json` | `in-search-of-a-better-place` | `lessons/*/in-search-of-a-better-place.(xml|json)` |
| `general-english-a2.json` | `ge-a2-progress-test-5` | `lessons/*/ge-a2-progress-test-5.(xml|json)` |
| `general-english-a2.json` | `holiday-shopping` | `lessons/*/holiday-shopping.(xml|json)` |
| `general-english-a2.json` | `food-delivery` | `lessons/*/food-delivery.(xml|json)` |
| `general-english-a2.json` | `online-shopping` | `lessons/*/online-shopping.(xml|json)` |
| `general-english-a2.json` | `i-need-some-details` | `lessons/*/i-need-some-details.(xml|json)` |
| `general-english-a2.json` | `things-that-matter` | `lessons/*/things-that-matter.(xml|json)` |
| `general-english-a2.json` | `doing-more-with-less` | `lessons/*/doing-more-with-less.(xml|json)` |
| `general-english-a2.json` | `born-in-the-same-year` | `lessons/*/born-in-the-same-year.(xml|json)` |
| `general-english-a2.json` | `travel-light` | `lessons/*/travel-light.(xml|json)` |
| `general-english-a2.json` | `ge-a2-progress-test-6` | `lessons/*/ge-a2-progress-test-6.(xml|json)` |
| `general-english-a2.json` | `people-who-changed-the-world` | `lessons/*/people-who-changed-the-world.(xml|json)` |
| `general-english-a2.json` | `life-crisis-is-that-a-thing` | `lessons/*/life-crisis-is-that-a-thing.(xml|json)` |
| `general-english-a2.json` | `things-i-didnt-have-to-change` | `lessons/*/things-i-didnt-have-to-change.(xml|json)` |
| `general-english-a2.json` | `my-life-in-a-movie` | `lessons/*/my-life-in-a-movie.(xml|json)` |
| `general-english-a2.json` | `put-your-shoes-on` | `lessons/*/put-your-shoes-on.(xml|json)` |
| `general-english-a2.json` | `marrying-a-different-culture` | `lessons/*/marrying-a-different-culture.(xml|json)` |
| `general-english-a2.json` | `language-and-colours` | `lessons/*/language-and-colours.(xml|json)` |
| `general-english-a2.json` | `culture-shock` | `lessons/*/culture-shock.(xml|json)` |
| `general-english-a2.json` | `progress-test-7` | `lessons/*/progress-test-7.(xml|json)` |
| `general-english-a2.json` | `global-warming` | `lessons/*/global-warming.(xml|json)` |
| `general-english-a2.json` | `wild-friends` | `lessons/*/wild-friends.(xml|json)` |
| `general-english-a2.json` | `distant-past` | `lessons/*/distant-past.(xml|json)` |
| `general-english-a2.json` | `returning-to-roots` | `lessons/*/returning-to-roots.(xml|json)` |
| `general-english-a2.json` | `ge-a2-final-exam-prep` | `lessons/*/ge-a2-final-exam-prep.(xml|json)` |
| `general-english-a2.json` | `ge-a2-final-exam` | `lessons/*/ge-a2-final-exam.(xml|json)` |
| `general-english-a2.json` | `ge-a2-final-feedback` | `lessons/*/ge-a2-final-feedback.(xml|json)` |
| `general-english-b1.json` | `the-art-of-rest` | `lessons/*/the-art-of-rest.(xml|json)` |
| `general-english-b1.json` | `work-life-balance` | `lessons/*/work-life-balance.(xml|json)` |
| `general-english-b1.json` | `21st-century-hobbies` | `lessons/*/21st-century-hobbies.(xml|json)` |
| `general-english-b1.json` | `charity-for-happiness` | `lessons/*/charity-for-happiness.(xml|json)` |
| `general-english-b1.json` | `modern-nomads` | `lessons/*/modern-nomads.(xml|json)` |
| `general-english-b1.json` | `gastro-tourism` | `lessons/*/gastro-tourism.(xml|json)` |
| `general-english-b1.json` | `upgraded-holidays` | `lessons/*/upgraded-holidays.(xml|json)` |
| `general-english-b1.json` | `how-to-survive-family-holidays` | `lessons/*/how-to-survive-family-holidays.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-1-simple` | `lessons/*/ge-b1-progress-test-1-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-1-full` | `lessons/*/ge-b1-progress-test-1-full.(xml|json)` |
| `general-english-b1.json` | `parental-control` | `lessons/*/parental-control.(xml|json)` |
| `general-english-b1.json` | `family-dynasty` | `lessons/*/family-dynasty.(xml|json)` |
| `general-english-b1.json` | `modern-families` | `lessons/*/modern-families.(xml|json)` |
| `general-english-b1.json` | `love-is-love-was` | `lessons/*/love-is-love-was.(xml|json)` |
| `general-english-b1.json` | `digital-trail` | `lessons/*/digital-trail.(xml|json)` |
| `general-english-b1.json` | `dna-testing` | `lessons/*/dna-testing.(xml|json)` |
| `general-english-b1.json` | `food-myths` | `lessons/*/food-myths.(xml|json)` |
| `general-english-b1.json` | `no-way-can-you-eat-this` | `lessons/*/no-way-can-you-eat-this.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-2-simple` | `lessons/*/ge-b1-progress-test-2-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-2-full` | `lessons/*/ge-b1-progress-test-2-full.(xml|json)` |
| `general-english-b1.json` | `you-can-be-too-healthy` | `lessons/*/you-can-be-too-healthy.(xml|json)` |
| `general-english-b1.json` | `professional-sports` | `lessons/*/professional-sports.(xml|json)` |
| `general-english-b1.json` | `body-positivity` | `lessons/*/body-positivity.(xml|json)` |
| `general-english-b1.json` | `changing-the-body` | `lessons/*/changing-the-body.(xml|json)` |
| `general-english-b1.json` | `be-trendier-shop-less` | `lessons/*/be-trendier-shop-less.(xml|json)` |
| `general-english-b1.json` | `internet-a-wise-manipulator` | `lessons/*/internet-a-wise-manipulator.(xml|json)` |
| `general-english-b1.json` | `advertising-you-dont-notice` | `lessons/*/advertising-you-dont-notice.(xml|json)` |
| `general-english-b1.json` | `the-power-of-influencers` | `lessons/*/the-power-of-influencers.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-3-simple` | `lessons/*/ge-b1-progress-test-3-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-3-full` | `lessons/*/ge-b1-progress-test-3-full.(xml|json)` |
| `general-english-b1.json` | `ge-b1-midterm-exam-simple` | `lessons/*/ge-b1-midterm-exam-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-midterm-exam-full` | `lessons/*/ge-b1-midterm-exam-full.(xml|json)` |
| `general-english-b1.json` | `emotional-intelligence` | `lessons/*/emotional-intelligence.(xml|json)` |
| `general-english-b1.json` | `skills-for-future-jobs` | `lessons/*/skills-for-future-jobs.(xml|json)` |
| `general-english-b1.json` | `millennials` | `lessons/*/millennials.(xml|json)` |
| `general-english-b1.json` | `self-branding` | `lessons/*/self-branding.(xml|json)` |
| `general-english-b1.json` | `lifelong-education` | `lessons/*/lifelong-education.(xml|json)` |
| `general-english-b1.json` | `guide-to-self-education` | `lessons/*/guide-to-self-education.(xml|json)` |
| `general-english-b1.json` | `protecting-languages` | `lessons/*/protecting-languages.(xml|json)` |
| `general-english-b1.json` | `bilingualism` | `lessons/*/bilingualism.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-4-simple` | `lessons/*/ge-b1-progress-test-4-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-4-full` | `lessons/*/ge-b1-progress-test-4-full.(xml|json)` |
| `general-english-b1.json` | `21st-century-addictions` | `lessons/*/21st-century-addictions.(xml|json)` |
| `general-english-b1.json` | `future-visits-to-a-doctor` | `lessons/*/future-visits-to-a-doctor.(xml|json)` |
| `general-english-b1.json` | `biohacking` | `lessons/*/biohacking.(xml|json)` |
| `general-english-b1.json` | `wellness-apps` | `lessons/*/wellness-apps.(xml|json)` |
| `general-english-b1.json` | `bad-days-happen` | `lessons/*/bad-days-happen.(xml|json)` |
| `general-english-b1.json` | `weve-got-bad-news-for-you` | `lessons/*/weve-got-bad-news-for-you.(xml|json)` |
| `general-english-b1.json` | `impact-of-technologies` | `lessons/*/impact-of-technologies.(xml|json)` |
| `general-english-b1.json` | `problems-with-tech` | `lessons/*/problems-with-tech.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-5-simple` | `lessons/*/ge-b1-progress-test-5-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-5-full` | `lessons/*/ge-b1-progress-test-5-full.(xml|json)` |
| `general-english-b1.json` | `where-to-live` | `lessons/*/where-to-live.(xml|json)` |
| `general-english-b1.json` | `living-small` | `lessons/*/living-small.(xml|json)` |
| `general-english-b1.json` | `city-rating` | `lessons/*/city-rating.(xml|json)` |
| `general-english-b1.json` | `sustainable-transport` | `lessons/*/sustainable-transport.(xml|json)` |
| `general-english-b1.json` | `climate-change` | `lessons/*/climate-change.(xml|json)` |
| `general-english-b1.json` | `weather-and-cultures` | `lessons/*/weather-and-cultures.(xml|json)` |
| `general-english-b1.json` | `eco-laws` | `lessons/*/eco-laws.(xml|json)` |
| `general-english-b1.json` | `eco-business` | `lessons/*/eco-business.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-6-simple` | `lessons/*/ge-b1-progress-test-6-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-progress-test-6-full` | `lessons/*/ge-b1-progress-test-6-full.(xml|json)` |
| `general-english-b1.json` | `lie-indicators` | `lessons/*/lie-indicators.(xml|json)` |
| `general-english-b1.json` | `social-media-addiction` | `lessons/*/social-media-addiction.(xml|json)` |
| `general-english-b1.json` | `manners` | `lessons/*/manners.(xml|json)` |
| `general-english-b1.json` | `sensitive-questions` | `lessons/*/sensitive-questions.(xml|json)` |
| `general-english-b1.json` | `is-this-art-horrible` | `lessons/*/is-this-art-horrible.(xml|json)` |
| `general-english-b1.json` | `ethics-of-entertainment` | `lessons/*/ethics-of-entertainment.(xml|json)` |
| `general-english-b1.json` | `breaking-the-law` | `lessons/*/breaking-the-law.(xml|json)` |
| `general-english-b1.json` | `solving-crimes` | `lessons/*/solving-crimes.(xml|json)` |
| `general-english-b1.json` | `progress-test-7-simple` | `lessons/*/progress-test-7-simple.(xml|json)` |
| `general-english-b1.json` | `progress-test-7-full` | `lessons/*/progress-test-7-full.(xml|json)` |
| `general-english-b1.json` | `accepting-failure` | `lessons/*/accepting-failure.(xml|json)` |
| `general-english-b1.json` | `elevator-pitch` | `lessons/*/elevator-pitch.(xml|json)` |
| `general-english-b1.json` | `managing-the-mind` | `lessons/*/managing-the-mind.(xml|json)` |
| `general-english-b1.json` | `success-stories` | `lessons/*/success-stories.(xml|json)` |
| `general-english-b1.json` | `ge-b1-final-exam-prep-simple` | `lessons/*/ge-b1-final-exam-prep-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-final-exam-prep-full` | `lessons/*/ge-b1-final-exam-prep-full.(xml|json)` |
| `general-english-b1.json` | `ge-b1-final-exam-simple` | `lessons/*/ge-b1-final-exam-simple.(xml|json)` |
| `general-english-b1.json` | `ge-b1-final-exam-full` | `lessons/*/ge-b1-final-exam-full.(xml|json)` |
| `general-english-b1.json` | `ge-b1-final-feedback` | `lessons/*/ge-b1-final-feedback.(xml|json)` |
| `general-english-b2.json` | `we-are-different` | `lessons/*/we-are-different.(xml|json)` |
| `general-english-b2.json` | `productive-routine` | `lessons/*/productive-routine.(xml|json)` |
| `general-english-b2.json` | `the-theory-of-laziness` | `lessons/*/the-theory-of-laziness.(xml|json)` |
| `general-english-b2.json` | `how-they-manipulate-us` | `lessons/*/how-they-manipulate-us.(xml|json)` |
| `general-english-b2.json` | `lets-tell-a-story` | `lessons/*/lets-tell-a-story.(xml|json)` |
| `general-english-b2.json` | `nonverbal-communication` | `lessons/*/nonverbal-communication.(xml|json)` |
| `general-english-b2.json` | `public-speaking` | `lessons/*/public-speaking.(xml|json)` |
| `general-english-b2.json` | `false-memories` | `lessons/*/false-memories.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-1-simple` | `lessons/*/ge-b2-progress-test-1-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-1-full` | `lessons/*/ge-b2-progress-test-1-full.(xml|json)` |
| `general-english-b2.json` | `superhumans` | `lessons/*/superhumans.(xml|json)` |
| `general-english-b2.json` | `esports` | `lessons/*/esports.(xml|json)` |
| `general-english-b2.json` | `going-cashless` | `lessons/*/going-cashless.(xml|json)` |
| `general-english-b2.json` | `pets-of-the-future` | `lessons/*/pets-of-the-future.(xml|json)` |
| `general-english-b2.json` | `connected-but-alone` | `lessons/*/connected-but-alone.(xml|json)` |
| `general-english-b2.json` | `communication-techniques` | `lessons/*/communication-techniques.(xml|json)` |
| `general-english-b2.json` | `language-of-social-media` | `lessons/*/language-of-social-media.(xml|json)` |
| `general-english-b2.json` | `how-social-media-affects-us` | `lessons/*/how-social-media-affects-us.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-2-simple` | `lessons/*/ge-b2-progress-test-2-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-2-full` | `lessons/*/ge-b2-progress-test-2-full.(xml|json)` |
| `general-english-b2.json` | `food-cult` | `lessons/*/food-cult.(xml|json)` |
| `general-english-b2.json` | `the-most-popular-diets` | `lessons/*/the-most-popular-diets.(xml|json)` |
| `general-english-b2.json` | `gastrodiplomacy` | `lessons/*/gastrodiplomacy.(xml|json)` |
| `general-english-b2.json` | `food-blogging` | `lessons/*/food-blogging.(xml|json)` |
| `general-english-b2.json` | `emotional-first-aid` | `lessons/*/emotional-first-aid.(xml|json)` |
| `general-english-b2.json` | `lucid-dreams` | `lessons/*/lucid-dreams.(xml|json)` |
| `general-english-b2.json` | `phobias-and-how-to-fight-them` | `lessons/*/phobias-and-how-to-fight-them.(xml|json)` |
| `general-english-b2.json` | `slow-life` | `lessons/*/slow-life.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-3-simple` | `lessons/*/ge-b2-progress-test-3-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-3-full` | `lessons/*/ge-b2-progress-test-3-full.(xml|json)` |
| `general-english-b2.json` | `ge-b2-midterm-exam-simple` | `lessons/*/ge-b2-midterm-exam-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-midterm-exam-full` | `lessons/*/ge-b2-midterm-exam-full.(xml|json)` |
| `general-english-b2.json` | `creative-vs-rational` | `lessons/*/creative-vs-rational.(xml|json)` |
| `general-english-b2.json` | `weve-got-talent` | `lessons/*/weve-got-talent.(xml|json)` |
| `general-english-b2.json` | `nature-of-genius` | `lessons/*/nature-of-genius.(xml|json)` |
| `general-english-b2.json` | `talented-or-insane` | `lessons/*/talented-or-insane.(xml|json)` |
| `general-english-b2.json` | `extreme-tourism` | `lessons/*/extreme-tourism.(xml|json)` |
| `general-english-b2.json` | `travel-and-volunteer` | `lessons/*/travel-and-volunteer.(xml|json)` |
| `general-english-b2.json` | `vr-changes-travelling` | `lessons/*/vr-changes-travelling.(xml|json)` |
| `general-english-b2.json` | `space-tourism` | `lessons/*/space-tourism.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-4-simple` | `lessons/*/ge-b2-progress-test-4-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-4-full` | `lessons/*/ge-b2-progress-test-4-full.(xml|json)` |
| `general-english-b2.json` | `conspiracy-theories` | `lessons/*/conspiracy-theories.(xml|json)` |
| `general-english-b2.json` | `universal-basic-income` | `lessons/*/universal-basic-income.(xml|json)` |
| `general-english-b2.json` | `first-world-problems` | `lessons/*/first-world-problems.(xml|json)` |
| `general-english-b2.json` | `can-we-say-no-to-violence` | `lessons/*/can-we-say-no-to-violence.(xml|json)` |
| `general-english-b2.json` | `do-celebrities-make-a-difference` | `lessons/*/do-celebrities-make-a-difference.(xml|json)` |
| `general-english-b2.json` | `fake-news` | `lessons/*/fake-news.(xml|json)` |
| `general-english-b2.json` | `freedom-of-speech` | `lessons/*/freedom-of-speech.(xml|json)` |
| `general-english-b2.json` | `filter-bubble` | `lessons/*/filter-bubble.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-5-simple` | `lessons/*/ge-b2-progress-test-5-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-5-full` | `lessons/*/ge-b2-progress-test-5-full.(xml|json)` |
| `general-english-b2.json` | `unique-education-systems` | `lessons/*/unique-education-systems.(xml|json)` |
| `general-english-b2.json` | `parenting-education` | `lessons/*/parenting-education.(xml|json)` |
| `general-english-b2.json` | `hyperpolyglot` | `lessons/*/hyperpolyglot.(xml|json)` |
| `general-english-b2.json` | `soft-skills-or-hard-skills` | `lessons/*/soft-skills-or-hard-skills.(xml|json)` |
| `general-english-b2.json` | `flexible-workplace` | `lessons/*/flexible-workplace.(xml|json)` |
| `general-english-b2.json` | `second-career` | `lessons/*/second-career.(xml|json)` |
| `general-english-b2.json` | `jobs-that-are-hard-to-explain` | `lessons/*/jobs-that-are-hard-to-explain.(xml|json)` |
| `general-english-b2.json` | `jump-off-the-career-ladder` | `lessons/*/jump-off-the-career-ladder.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-6-simple` | `lessons/*/ge-b2-progress-test-6-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-progress-test-6-full` | `lessons/*/ge-b2-progress-test-6-full.(xml|json)` |
| `general-english-b2.json` | `the-day-that-changed-my-life` | `lessons/*/the-day-that-changed-my-life.(xml|json)` |
| `general-english-b2.json` | `does-life-coaching-work` | `lessons/*/does-life-coaching-work.(xml|json)` |
| `general-english-b2.json` | `crisis-of-meaning` | `lessons/*/crisis-of-meaning.(xml|json)` |
| `general-english-b2.json` | `does-everybody-have-a-calling` | `lessons/*/does-everybody-have-a-calling.(xml|json)` |
| `general-english-b2.json` | `ge-b2-final-exam-prep-simple` | `lessons/*/ge-b2-final-exam-prep-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-final-exam-prep-full` | `lessons/*/ge-b2-final-exam-prep-full.(xml|json)` |
| `general-english-b2.json` | `ge-b2-final-exam-simple` | `lessons/*/ge-b2-final-exam-simple.(xml|json)` |
| `general-english-b2.json` | `ge-b2-final-exam-full` | `lessons/*/ge-b2-final-exam-full.(xml|json)` |
| `general-english-b2.json` | `productive-routine-extra` | `lessons/*/productive-routine-extra.(xml|json)` |
| `general-english-b2.json` | `ge-b2-final-feedback` | `lessons/*/ge-b2-final-feedback.(xml|json)` |
| `general-english-c1.json` | `gender-stereotypes` | `lessons/*/gender-stereotypes.(xml|json)` |
| `general-english-c1.json` | `tribal-or-cosmopolitan` | `lessons/*/tribal-or-cosmopolitan.(xml|json)` |
| `general-english-c1.json` | `intolerance-of-tolerance` | `lessons/*/intolerance-of-tolerance.(xml|json)` |
| `general-english-c1.json` | `wonders-of-life` | `lessons/*/wonders-of-life.(xml|json)` |
| `general-english-c1.json` | `smart-cities` | `lessons/*/smart-cities.(xml|json)` |
| `general-english-c1.json` | `sustainable-tourism` | `lessons/*/sustainable-tourism.(xml|json)` |
| `general-english-c1.json` | `on-top-of-the-world` | `lessons/*/on-top-of-the-world.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-1-simple` | `lessons/*/ge-c1-progress-test-1-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-1-full` | `lessons/*/ge-c1-progress-test-1-full.(xml|json)` |
| `general-english-c1.json` | `theory-of-happiness` | `lessons/*/theory-of-happiness.(xml|json)` |
| `general-english-c1.json` | `constructive-criticism` | `lessons/*/constructive-criticism.(xml|json)` |
| `general-english-c1.json` | `personal-space` | `lessons/*/personal-space.(xml|json)` |
| `general-english-c1.json` | `crisis-guidelines` | `lessons/*/crisis-guidelines.(xml|json)` |
| `general-english-c1.json` | `changing-professions` | `lessons/*/changing-professions.(xml|json)` |
| `general-english-c1.json` | `fear-of-ones-future` | `lessons/*/fear-of-ones-future.(xml|json)` |
| `general-english-c1.json` | `in-search-of-a-new-life` | `lessons/*/in-search-of-a-new-life.(xml|json)` |
| `general-english-c1.json` | `making-the-world-better` | `lessons/*/making-the-world-better.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-2-simple` | `lessons/*/ge-c1-progress-test-2-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-2-full` | `lessons/*/ge-c1-progress-test-2-full.(xml|json)` |
| `general-english-c1.json` | `man-made-nature` | `lessons/*/man-made-nature.(xml|json)` |
| `general-english-c1.json` | `future-food` | `lessons/*/future-food.(xml|json)` |
| `general-english-c1.json` | `editing-ones-body` | `lessons/*/editing-ones-body.(xml|json)` |
| `general-english-c1.json` | `want-to-live-forever` | `lessons/*/want-to-live-forever.(xml|json)` |
| `general-english-c1.json` | `male-and-female-language` | `lessons/*/male-and-female-language.(xml|json)` |
| `general-english-c1.json` | `talking-to-a-robot` | `lessons/*/talking-to-a-robot.(xml|json)` |
| `general-english-c1.json` | `globish` | `lessons/*/globish.(xml|json)` |
| `general-english-c1.json` | `diverse-voices` | `lessons/*/diverse-voices.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-3-simple` | `lessons/*/ge-c1-progress-test-3-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-3-full` | `lessons/*/ge-c1-progress-test-3-full.(xml|json)` |
| `general-english-c1.json` | `ge-c1-midterm-exam-simple` | `lessons/*/ge-c1-midterm-exam-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-midterm-exam-full` | `lessons/*/ge-c1-midterm-exam-full.(xml|json)` |
| `general-english-c1.json` | `handle-your-neighbours` | `lessons/*/handle-your-neighbours.(xml|json)` |
| `general-english-c1.json` | `under-one-roof` | `lessons/*/under-one-roof.(xml|json)` |
| `general-english-c1.json` | `generation-gap` | `lessons/*/generation-gap.(xml|json)` |
| `general-english-c1.json` | `self-partnership` | `lessons/*/self-partnership.(xml|json)` |
| `general-english-c1.json` | `time-keepers` | `lessons/*/time-keepers.(xml|json)` |
| `general-english-c1.json` | `hobby-vs-career` | `lessons/*/hobby-vs-career.(xml|json)` |
| `general-english-c1.json` | `too-risky-to-approve` | `lessons/*/too-risky-to-approve.(xml|json)` |
| `general-english-c1.json` | `too-much-free-time` | `lessons/*/too-much-free-time.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-4-simple` | `lessons/*/ge-c1-progress-test-4-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-4-full` | `lessons/*/ge-c1-progress-test-4-full.(xml|json)` |
| `general-english-c1.json` | `literature-bucket-list` | `lessons/*/literature-bucket-list.(xml|json)` |
| `general-english-c1.json` | `street-art` | `lessons/*/street-art.(xml|json)` |
| `general-english-c1.json` | `cinephilia` | `lessons/*/cinephilia.(xml|json)` |
| `general-english-c1.json` | `performance-art` | `lessons/*/performance-art.(xml|json)` |
| `general-english-c1.json` | `womens-political-progress` | `lessons/*/womens-political-progress.(xml|json)` |
| `general-english-c1.json` | `new-era-of-political-participation` | `lessons/*/new-era-of-political-participation.(xml|json)` |
| `general-english-c1.json` | `world-issues` | `lessons/*/world-issues.(xml|json)` |
| `general-english-c1.json` | `animal-rights` | `lessons/*/animal-rights.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-5-simple` | `lessons/*/ge-c1-progress-test-5-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-progress-test-5-full` | `lessons/*/ge-c1-progress-test-5-full.(xml|json)` |
| `general-english-c1.json` | `ideal-economic-model` | `lessons/*/ideal-economic-model.(xml|json)` |
| `general-english-c1.json` | `whats-wrong-with-monopolies` | `lessons/*/whats-wrong-with-monopolies.(xml|json)` |
| `general-english-c1.json` | `what-to-invest-in` | `lessons/*/what-to-invest-in.(xml|json)` |
| `general-english-c1.json` | `art-market` | `lessons/*/art-market.(xml|json)` |
| `general-english-c1.json` | `the-big-bang` | `lessons/*/the-big-bang.(xml|json)` |
| `general-english-c1.json` | `habitat-for-humanity` | `lessons/*/habitat-for-humanity.(xml|json)` |
| `general-english-c1.json` | `alien-life` | `lessons/*/alien-life.(xml|json)` |
| `general-english-c1.json` | `tech-to-live-on-other-planets` | `lessons/*/tech-to-live-on-other-planets.(xml|json)` |
| `general-english-c1.json` | `ge-c1-final-exam-prep-simple` | `lessons/*/ge-c1-final-exam-prep-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-final-exam-prep-full` | `lessons/*/ge-c1-final-exam-prep-full.(xml|json)` |
| `general-english-c1.json` | `ge-c1-final-exam-simple` | `lessons/*/ge-c1-final-exam-simple.(xml|json)` |
| `general-english-c1.json` | `ge-c1-final-exam-full` | `lessons/*/ge-c1-final-exam-full.(xml|json)` |
| `general-english-c1.json` | `ge-c1-final-feedback` | `lessons/*/ge-c1-final-feedback.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-pronouns-to-be-positive` | `lessons/*/ge-a0-pronouns-to-be-positive.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-to-be-negative-forms` | `lessons/*/ge-a0-to-be-negative-forms.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-to-be-questions-short-answers` | `lessons/*/ge-a0-to-be-questions-short-answers.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-article-a-an-with-jobs` | `lessons/*/ge-a0-article-a-an-with-jobs.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-possessive-adjectives` | `lessons/*/ge-a0-possessive-adjectives.(xml|json)` |
| `grammar-english-a0.json` | `have-got-a0` | `lessons/*/have-got-a0.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-numbers-1-12` | `lessons/*/ge-a0-numbers-1-12.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-plural-nouns` | `lessons/*/ge-a0-plural-nouns.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-present-simple-positive` | `lessons/*/ge-a0-present-simple-positive.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-present-simple-negative` | `lessons/*/ge-a0-present-simple-negative.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-present-simple-questions-answers` | `lessons/*/ge-a0-present-simple-questions-answers.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-imperative` | `lessons/*/ge-a0-imperative.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-objective-pronouns` | `lessons/*/ge-a0-objective-pronouns.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-word-order` | `lessons/*/ge-a0-word-order.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-adverbs-of-frequency` | `lessons/*/ge-a0-adverbs-of-frequency.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-determiners-this-that-these-those` | `lessons/*/ge-a0-determiners-this-that-these-those.(xml|json)` |
| `grammar-english-a0.json` | `prepositions-of-place-a0` | `lessons/*/prepositions-of-place-a0.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-there-is-there-are` | `lessons/*/ge-a0-there-is-there-are.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-numbers-cardinal-large` | `lessons/*/ge-a0-numbers-cardinal-large.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-ordinal-numbers` | `lessons/*/ge-a0-ordinal-numbers.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-possessive-s` | `lessons/*/ge-a0-possessive-s.(xml|json)` |
| `grammar-english-a0.json` | `present-continuous-a0` | `lessons/*/present-continuous-a0.(xml|json)` |
| `grammar-english-a0.json` | `present-simple-vs-present-continuous-a0` | `lessons/*/present-simple-vs-present-continuous-a0.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-would-like-to-verb` | `lessons/*/ge-a0-would-like-to-verb.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-like-love-hate-ving` | `lessons/*/ge-a0-like-love-hate-ving.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-would-like-vs-like` | `lessons/*/ge-a0-would-like-vs-like.(xml|json)` |
| `grammar-english-a0.json` | `prepositions-of-time-a0` | `lessons/*/prepositions-of-time-a0.(xml|json)` |
| `grammar-english-a0.json` | `uncountable-nouns-a0` | `lessons/*/uncountable-nouns-a0.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-some-any-no` | `lessons/*/ge-a0-some-any-no.(xml|json)` |
| `grammar-english-a0.json` | `articles-a-the-a0` | `lessons/*/articles-a-the-a0.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-to-be-past-forms` | `lessons/*/ge-a0-to-be-past-forms.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-past-simple-regular-verbs` | `lessons/*/ge-a0-past-simple-regular-verbs.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-past-simple-irregular-verbs` | `lessons/*/ge-a0-past-simple-irregular-verbs.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-can-for-abilities` | `lessons/*/ge-a0-can-for-abilities.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-linkers-and-but-or` | `lessons/*/ge-a0-linkers-and-but-or.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-comparative-degree` | `lessons/*/ge-a0-comparative-degree.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-superlative-degree` | `lessons/*/ge-a0-superlative-degree.(xml|json)` |
| `grammar-english-a0.json` | `degrees-of-comparison-a0` | `lessons/*/degrees-of-comparison-a0.(xml|json)` |
| `grammar-english-a0.json` | `future-simple-a0` | `lessons/*/future-simple-a0.(xml|json)` |
| `grammar-english-a0.json` | `to-be-going-to-a0` | `lessons/*/to-be-going-to-a0.(xml|json)` |
| `grammar-english-a0.json` | `ge-a0-present-perfect-basics` | `lessons/*/ge-a0-present-perfect-basics.(xml|json)` |
| `grammar-english-a0.json` | `mixed-tenses-a0-review` | `lessons/*/mixed-tenses-a0-review.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-pronouns-to-be-positive` | `lessons/*/ge-a1-pronouns-to-be-positive.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-to-be-negative-forms` | `lessons/*/ge-a1-to-be-negative-forms.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-to-be-questions-short-answers` | `lessons/*/ge-a1-to-be-questions-short-answers.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-article-a-an-with-jobs` | `lessons/*/ge-a1-article-a-an-with-jobs.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-possessive-adjectives` | `lessons/*/ge-a1-possessive-adjectives.(xml|json)` |
| `grammar-english-a1.json` | `have-got-a1` | `lessons/*/have-got-a1.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-numbers-1-12` | `lessons/*/ge-a1-numbers-1-12.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-plural-nouns` | `lessons/*/ge-a1-plural-nouns.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-present-simple-positive` | `lessons/*/ge-a1-present-simple-positive.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-present-simple-negative` | `lessons/*/ge-a1-present-simple-negative.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-present-simple-questions-answers` | `lessons/*/ge-a1-present-simple-questions-answers.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-imperative` | `lessons/*/ge-a1-imperative.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-objective-pronouns` | `lessons/*/ge-a1-objective-pronouns.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-word-order` | `lessons/*/ge-a1-word-order.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-adverbs-of-frequency` | `lessons/*/ge-a1-adverbs-of-frequency.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-determiners-this-that-these-those` | `lessons/*/ge-a1-determiners-this-that-these-those.(xml|json)` |
| `grammar-english-a1.json` | `prepositions-of-place-a1` | `lessons/*/prepositions-of-place-a1.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-there-is-there-are` | `lessons/*/ge-a1-there-is-there-are.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-numbers-cardinal-large` | `lessons/*/ge-a1-numbers-cardinal-large.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-ordinal-numbers` | `lessons/*/ge-a1-ordinal-numbers.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-possessive-s` | `lessons/*/ge-a1-possessive-s.(xml|json)` |
| `grammar-english-a1.json` | `present-continuous-a1` | `lessons/*/present-continuous-a1.(xml|json)` |
| `grammar-english-a1.json` | `present-simple-vs-present-continuous-a1` | `lessons/*/present-simple-vs-present-continuous-a1.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-would-like-to-verb` | `lessons/*/ge-a1-would-like-to-verb.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-like-love-hate-ving` | `lessons/*/ge-a1-like-love-hate-ving.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-would-like-vs-like` | `lessons/*/ge-a1-would-like-vs-like.(xml|json)` |
| `grammar-english-a1.json` | `prepositions-of-time-a1` | `lessons/*/prepositions-of-time-a1.(xml|json)` |
| `grammar-english-a1.json` | `uncountable-nouns-a1` | `lessons/*/uncountable-nouns-a1.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-some-any-no` | `lessons/*/ge-a1-some-any-no.(xml|json)` |
| `grammar-english-a1.json` | `articles-a-the-a1` | `lessons/*/articles-a-the-a1.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-to-be-past-forms` | `lessons/*/ge-a1-to-be-past-forms.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-past-simple-regular-verbs` | `lessons/*/ge-a1-past-simple-regular-verbs.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-past-simple-irregular-verbs` | `lessons/*/ge-a1-past-simple-irregular-verbs.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-can-for-abilities` | `lessons/*/ge-a1-can-for-abilities.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-linkers-and-but-or` | `lessons/*/ge-a1-linkers-and-but-or.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-comparative-degree` | `lessons/*/ge-a1-comparative-degree.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-superlative-degree` | `lessons/*/ge-a1-superlative-degree.(xml|json)` |
| `grammar-english-a1.json` | `degrees-of-comparison-a1` | `lessons/*/degrees-of-comparison-a1.(xml|json)` |
| `grammar-english-a1.json` | `future-simple-a1` | `lessons/*/future-simple-a1.(xml|json)` |
| `grammar-english-a1.json` | `to-be-going-to-a1` | `lessons/*/to-be-going-to-a1.(xml|json)` |
| `grammar-english-a1.json` | `ge-a1-present-perfect-basics` | `lessons/*/ge-a1-present-perfect-basics.(xml|json)` |
| `grammar-english-a1.json` | `mixed-tenses-a1-review` | `lessons/*/mixed-tenses-a1-review.(xml|json)` |
| `grammar-english-a2.json` | `present-simple` | `lessons/*/present-simple.(xml|json)` |
| `grammar-english-a2.json` | `present-continuous` | `lessons/*/present-continuous.(xml|json)` |
| `grammar-english-a2.json` | `stative-verbs` | `lessons/*/stative-verbs.(xml|json)` |
| `grammar-english-a2.json` | `pr-cont-going-to-future` | `lessons/*/pr-cont-going-to-future.(xml|json)` |
| `grammar-english-a2.json` | `future-simple` | `lessons/*/future-simple.(xml|json)` |
| `grammar-english-a2.json` | `ways-to-express-future` | `lessons/*/ways-to-express-future.(xml|json)` |
| `grammar-english-a2.json` | `past-simple` | `lessons/*/past-simple.(xml|json)` |
| `grammar-english-a2.json` | `irregular-verbs` | `lessons/*/irregular-verbs.(xml|json)` |
| `grammar-english-a2.json` | `past-continuous` | `lessons/*/past-continuous.(xml|json)` |
| `grammar-english-a2.json` | `past-simple-and-past-continuous` | `lessons/*/past-simple-and-past-continuous.(xml|json)` |
| `grammar-english-a2.json` | `used-to-a2` | `lessons/*/used-to-a2.(xml|json)` |
| `grammar-english-a2.json` | `types-of-questions` | `lessons/*/types-of-questions.(xml|json)` |
| `grammar-english-a2.json` | `subject-vs-object-questions` | `lessons/*/subject-vs-object-questions.(xml|json)` |
| `grammar-english-a2.json` | `prepositions-of-place-movement` | `lessons/*/prepositions-of-place-movement.(xml|json)` |
| `grammar-english-a2.json` | `present-perfect` | `lessons/*/present-perfect.(xml|json)` |
| `grammar-english-a2.json` | `present-perfect-for-since` | `lessons/*/present-perfect-for-since.(xml|json)` |
| `grammar-english-a2.json` | `present-perfect-already-just-yet` | `lessons/*/present-perfect-already-just-yet.(xml|json)` |
| `grammar-english-a2.json` | `past-simple-vs-present-perfect` | `lessons/*/past-simple-vs-present-perfect.(xml|json)` |
| `grammar-english-a2.json` | `uncountable-nouns-containers` | `lessons/*/uncountable-nouns-containers.(xml|json)` |
| `grammar-english-a2.json` | `indefinite-pronouns` | `lessons/*/indefinite-pronouns.(xml|json)` |
| `grammar-english-a2.json` | `quantifiers-a2` | `lessons/*/quantifiers-a2.(xml|json)` |
| `grammar-english-a2.json` | `degrees-of-comparison` | `lessons/*/degrees-of-comparison.(xml|json)` |
| `grammar-english-a2.json` | `adjectives-ed-ing` | `lessons/*/adjectives-ed-ing.(xml|json)` |
| `grammar-english-a2.json` | `adverbs-and-adjectives` | `lessons/*/adverbs-and-adjectives.(xml|json)` |
| `grammar-english-a2.json` | `articles-a2` | `lessons/*/articles-a2.(xml|json)` |
| `grammar-english-a2.json` | `articles-geographical-names` | `lessons/*/articles-geographical-names.(xml|json)` |
| `grammar-english-a2.json` | `such-and-so` | `lessons/*/such-and-so.(xml|json)` |
| `grammar-english-a2.json` | `modals-have-to-must` | `lessons/*/modals-have-to-must.(xml|json)` |
| `grammar-english-a2.json` | `modals-should-ought-to` | `lessons/*/modals-should-ought-to.(xml|json)` |
| `grammar-english-a2.json` | `modals-can-able-to` | `lessons/*/modals-can-able-to.(xml|json)` |
| `grammar-english-a2.json` | `present-past-passive` | `lessons/*/present-past-passive.(xml|json)` |
| `grammar-english-a2.json` | `prepositions-of-time` | `lessons/*/prepositions-of-time.(xml|json)` |
| `grammar-english-a2.json` | `first-conditional-a2` | `lessons/*/first-conditional-a2.(xml|json)` |
| `grammar-english-a2.json` | `second-conditional-vs-first` | `lessons/*/second-conditional-vs-first.(xml|json)` |
| `grammar-english-b1.json` | `present-perfect-continuous` | `lessons/*/present-perfect-continuous.(xml|json)` |
| `grammar-english-b1.json` | `pr-perf-vs-pr-perf-cont` | `lessons/*/pr-perf-vs-pr-perf-cont.(xml|json)` |
| `grammar-english-b1.json` | `all-present-tenses` | `lessons/*/all-present-tenses.(xml|json)` |
| `grammar-english-b1.json` | `past-perfect` | `lessons/*/past-perfect.(xml|json)` |
| `grammar-english-b1.json` | `used-to-be-used-to` | `lessons/*/used-to-be-used-to.(xml|json)` |
| `grammar-english-b1.json` | `would-vs-used-to` | `lessons/*/would-vs-used-to.(xml|json)` |
| `grammar-english-b1.json` | `ge-b1-narrative-tenses` | `lessons/*/ge-b1-narrative-tenses.(xml|json)` |
| `grammar-english-b1.json` | `expressing-the-future` | `lessons/*/expressing-the-future.(xml|json)` |
| `grammar-english-b1.json` | `to-be-about-to-plan-intend` | `lessons/*/to-be-about-to-plan-intend.(xml|json)` |
| `grammar-english-b1.json` | `mixed-tenses` | `lessons/*/mixed-tenses.(xml|json)` |
| `grammar-english-b1.json` | `first-and-second-conditionals` | `lessons/*/first-and-second-conditionals.(xml|json)` |
| `grammar-english-b1.json` | `i-wish-if-only-past-simple-would` | `lessons/*/i-wish-if-only-past-simple-would.(xml|json)` |
| `grammar-english-b1.json` | `nouns-singularia-and-pluralia-tantum` | `lessons/*/nouns-singularia-and-pluralia-tantum.(xml|json)` |
| `grammar-english-b1.json` | `articles-a-the-zero` | `lessons/*/articles-a-the-zero.(xml|json)` |
| `grammar-english-b1.json` | `use-of-to-v` | `lessons/*/use-of-to-v.(xml|json)` |
| `grammar-english-b1.json` | `use-of-gerunds` | `lessons/*/use-of-gerunds.(xml|json)` |
| `grammar-english-b1.json` | `gerund-or-infinitive` | `lessons/*/gerund-or-infinitive.(xml|json)` |
| `grammar-english-b1.json` | `gerund-and-infinitive-difference-in-meaning` | `lessons/*/gerund-and-infinitive-difference-in-meaning.(xml|json)` |
| `grammar-english-b1.json` | `reflexive-pronouns` | `lessons/*/reflexive-pronouns.(xml|json)` |
| `grammar-english-b1.json` | `modals-of-advice` | `lessons/*/modals-of-advice.(xml|json)` |
| `grammar-english-b1.json` | `modals-of-obligation` | `lessons/*/modals-of-obligation.(xml|json)` |
| `grammar-english-b1.json` | `modals-of-request` | `lessons/*/modals-of-request.(xml|json)` |
| `grammar-english-b1.json` | `modals-of-speculation-present` | `lessons/*/modals-of-speculation-present.(xml|json)` |
| `grammar-english-b1.json` | `modals-of-speculation-present-vs-past` | `lessons/*/modals-of-speculation-present-vs-past.(xml|json)` |
| `grammar-english-b1.json` | `defining-and-non-defining-relative-clauses` | `lessons/*/defining-and-non-defining-relative-clauses.(xml|json)` |
| `grammar-english-b1.json` | `passive-voice-b1` | `lessons/*/passive-voice-b1.(xml|json)` |
| `grammar-english-b1.json` | `passive-voice-2` | `lessons/*/passive-voice-2.(xml|json)` |
| `grammar-english-b1.json` | `active-or-passive` | `lessons/*/active-or-passive.(xml|json)` |
| `grammar-english-b1.json` | `other-another-the-other` | `lessons/*/other-another-the-other.(xml|json)` |
| `grammar-english-b1.json` | `every-and-each` | `lessons/*/every-and-each.(xml|json)` |
| `grammar-english-b1.json` | `so-and-neither-agreement` | `lessons/*/so-and-neither-agreement.(xml|json)` |
| `grammar-english-b1.json` | `complex-object-b1` | `lessons/*/complex-object-b1.(xml|json)` |
| `grammar-english-b1.json` | `as-or-like` | `lessons/*/as-or-like.(xml|json)` |
| `grammar-english-b1.json` | `indirect-questions` | `lessons/*/indirect-questions.(xml|json)` |
| `grammar-english-b1.json` | `adjectives-ending-ing-ed` | `lessons/*/adjectives-ending-ing-ed.(xml|json)` |
| `grammar-english-b1.json` | `types-of-the-infinitive` | `lessons/*/types-of-the-infinitive.(xml|json)` |
| `grammar-english-b1.json` | `verbs-followed-by-prepositions` | `lessons/*/verbs-followed-by-prepositions.(xml|json)` |
| `grammar-english-b1.json` | `adjectives-followed-by-prepositions` | `lessons/*/adjectives-followed-by-prepositions.(xml|json)` |
| `grammar-english-b1.json` | `nouns-followed-by-prepositions` | `lessons/*/nouns-followed-by-prepositions.(xml|json)` |
| `grammar-english-b1.json` | `reported-speech-statements` | `lessons/*/reported-speech-statements.(xml|json)` |
| `grammar-english-b1.json` | `sequence-of-tenses` | `lessons/*/sequence-of-tenses.(xml|json)` |
| `grammar-english-b1.json` | `reporting-verbs-b1` | `lessons/*/reporting-verbs-b1.(xml|json)` |
| `grammar-english-b1.json` | `future-continuous` | `lessons/*/future-continuous.(xml|json)` |
| `grammar-english-b1.json` | `future-perfect` | `lessons/*/future-perfect.(xml|json)` |
| `grammar-english-b1.json` | `future-tenses-review` | `lessons/*/future-tenses-review.(xml|json)` |
| `grammar-english-b1.json` | `have-something-done` | `lessons/*/have-something-done.(xml|json)` |
| `grammar-english-b1.json` | `both-either-neither-all-every` | `lessons/*/both-either-neither-all-every.(xml|json)` |
| `grammar-english-b1.json` | `though-in-spite-of-despite` | `lessons/*/though-in-spite-of-despite.(xml|json)` |
| `grammar-english-b1.json` | `participial-clauses` | `lessons/*/participial-clauses.(xml|json)` |
| `grammar-english-b1.json` | `say-vs-tell` | `lessons/*/say-vs-tell.(xml|json)` |
| `grammar-english-b1.json` | `so-such-and-other-intensifiers` | `lessons/*/so-such-and-other-intensifiers.(xml|json)` |
| `grammar-english-b1.json` | `too-and-enough` | `lessons/*/too-and-enough.(xml|json)` |
| `grammar-english-b2.json` | `past-perf-vs-past-perf-cont` | `lessons/*/past-perf-vs-past-perf-cont.(xml|json)` |
| `grammar-english-b2.json` | `ge-b2-narrative-tenses` | `lessons/*/ge-b2-narrative-tenses.(xml|json)` |
| `grammar-english-b2.json` | `be-get-used-to-would` | `lessons/*/be-get-used-to-would.(xml|json)` |
| `grammar-english-b2.json` | `past-intentions` | `lessons/*/past-intentions.(xml|json)` |
| `grammar-english-b2.json` | `future-cont-vs-future-perf` | `lessons/*/future-cont-vs-future-perf.(xml|json)` |
| `grammar-english-b2.json` | `future-tenses` | `lessons/*/future-tenses.(xml|json)` |
| `grammar-english-b2.json` | `other-means-express-future` | `lessons/*/other-means-express-future.(xml|json)` |
| `grammar-english-b2.json` | `passive-voice` | `lessons/*/passive-voice.(xml|json)` |
| `grammar-english-b2.json` | `impersonal-passive-constructions` | `lessons/*/impersonal-passive-constructions.(xml|json)` |
| `grammar-english-b2.json` | `causatives-have-get-make` | `lessons/*/causatives-have-get-make.(xml|json)` |
| `grammar-english-b2.json` | `complex-object` | `lessons/*/complex-object.(xml|json)` |
| `grammar-english-b2.json` | `gerund-forms-and-usage` | `lessons/*/gerund-forms-and-usage.(xml|json)` |
| `grammar-english-b2.json` | `gerund-vs-infinitive` | `lessons/*/gerund-vs-infinitive.(xml|json)` |
| `grammar-english-b2.json` | `modal-verbs-of-obligation` | `lessons/*/modal-verbs-of-obligation.(xml|json)` |
| `grammar-english-b2.json` | `modals-of-deduction-present-past` | `lessons/*/modals-of-deduction-present-past.(xml|json)` |
| `grammar-english-b2.json` | `would-rather-had-better-its-time` | `lessons/*/would-rather-had-better-its-time.(xml|json)` |
| `grammar-english-b2.json` | `third-conditional` | `lessons/*/third-conditional.(xml|json)` |
| `grammar-english-b2.json` | `mixed-conditionals` | `lessons/*/mixed-conditionals.(xml|json)` |
| `grammar-english-b2.json` | `alternatives-to-if` | `lessons/*/alternatives-to-if.(xml|json)` |
| `grammar-english-b2.json` | `i-wish-if-only` | `lessons/*/i-wish-if-only.(xml|json)` |
| `grammar-english-b2.json` | `relative-clauses` | `lessons/*/relative-clauses.(xml|json)` |
| `grammar-english-b2.json` | `gerund-vs-infinitive-verbs` | `lessons/*/gerund-vs-infinitive-verbs.(xml|json)` |
| `grammar-english-b2.json` | `all-tenses-revision` | `lessons/*/all-tenses-revision.(xml|json)` |
| `grammar-english-b2.json` | `present-participle-clause` | `lessons/*/present-participle-clause.(xml|json)` |
| `grammar-english-b2.json` | `complex-subject` | `lessons/*/complex-subject.(xml|json)` |
| `grammar-english-b2.json` | `various-degrees-of-likelihood` | `lessons/*/various-degrees-of-likelihood.(xml|json)` |
| `grammar-english-b2.json` | `supposed-to-meant-to` | `lessons/*/supposed-to-meant-to.(xml|json)` |
| `grammar-english-b2.json` | `would-rather-had-better-repeat` | `lessons/*/would-rather-had-better-repeat.(xml|json)` |
| `grammar-english-b2.json` | `reporting-verbs` | `lessons/*/reporting-verbs.(xml|json)` |
| `grammar-english-b2.json` | `should-have-v3-regrets` | `lessons/*/should-have-v3-regrets.(xml|json)` |
| `grammar-english-b2.json` | `comparatives-including-modifiers` | `lessons/*/comparatives-including-modifiers.(xml|json)` |
| `grammar-english-b2.json` | `reporting-with-passives` | `lessons/*/reporting-with-passives.(xml|json)` |
| `grammar-english-b2.json` | `first-second-conditionals-conjunctions` | `lessons/*/first-second-conditionals-conjunctions.(xml|json)` |
| `grammar-english-b2.json` | `adjectives-and-adverbs` | `lessons/*/adjectives-and-adverbs.(xml|json)` |
| `grammar-english-b2.json` | `quantifiers-and-determiners` | `lessons/*/quantifiers-and-determiners.(xml|json)` |
| `grammar-english-b2.json` | `present-and-future-modals` | `lessons/*/present-and-future-modals.(xml|json)` |
| `grammar-english-b2.json` | `all-conditionals` | `lessons/*/all-conditionals.(xml|json)` |
| `grammar-english-b2.json` | `past-modals` | `lessons/*/past-modals.(xml|json)` |
| `grammar-english-b2.json` | `subject-predicate-agreement` | `lessons/*/subject-predicate-agreement.(xml|json)` |
| `grammar-english-b2.json` | `clauses-conjunctions-contrast` | `lessons/*/clauses-conjunctions-contrast.(xml|json)` |
| `grammar-english-b2.json` | `clauses-conjunctions-concession` | `lessons/*/clauses-conjunctions-concession.(xml|json)` |
| `grammar-english-b2.json` | `clauses-conjunctions-purpose` | `lessons/*/clauses-conjunctions-purpose.(xml|json)` |
| `grammar-english-b2.json` | `reason-and-result-clauses` | `lessons/*/reason-and-result-clauses.(xml|json)` |
| `grammar-english-b2.json` | `not-either-neither-nor-both` | `lessons/*/not-either-neither-nor-both.(xml|json)` |
| `grammar-english-b2.json` | `suffixes` | `lessons/*/suffixes.(xml|json)` |
| `grammar-english-b2.json` | `perfect-participle-clause` | `lessons/*/perfect-participle-clause.(xml|json)` |
| `grammar-english-b2.json` | `as-if-as-though-present-past` | `lessons/*/as-if-as-though-present-past.(xml|json)` |
| `grammar-english-b2.json` | `prefixes-enhancing-meaning` | `lessons/*/prefixes-enhancing-meaning.(xml|json)` |
| `grammar-english-b2.json` | `gerund-and-perfect-gerund` | `lessons/*/gerund-and-perfect-gerund.(xml|json)` |
| `grammar-english-b2.json` | `reported-speech` | `lessons/*/reported-speech.(xml|json)` |
| `grammar-english-b2.json` | `fronting-to-be-and-normal-verbs` | `lessons/*/fronting-to-be-and-normal-verbs.(xml|json)` |
| `grammar-english-b2.json` | `subjunctive-mood` | `lessons/*/subjunctive-mood.(xml|json)` |
| `grammar-english-b2.json` | `participle-clauses-both` | `lessons/*/participle-clauses-both.(xml|json)` |
| `grammar-english-c1.json` | `continuous-aspect` | `lessons/*/continuous-aspect.(xml|json)` |
| `grammar-english-c1.json` | `perfect-aspect` | `lessons/*/perfect-aspect.(xml|json)` |
| `grammar-english-c1.json` | `linking-verbs-and-phrases` | `lessons/*/linking-verbs-and-phrases.(xml|json)` |
| `grammar-english-c1.json` | `modal-verbs-obligation-necessity-advice` | `lessons/*/modal-verbs-obligation-necessity-advice.(xml|json)` |
| `grammar-english-c1.json` | `will-and-would-certainty-habit` | `lessons/*/will-and-would-certainty-habit.(xml|json)` |
| `grammar-english-c1.json` | `often-confused-adverbs` | `lessons/*/often-confused-adverbs.(xml|json)` |
| `grammar-english-c1.json` | `future-tenses-lexical-means` | `lessons/*/future-tenses-lexical-means.(xml|json)` |
| `grammar-english-c1.json` | `infinitive-complexes` | `lessons/*/infinitive-complexes.(xml|json)` |
| `grammar-english-c1.json` | `gerundial-constructions` | `lessons/*/gerundial-constructions.(xml|json)` |
| `grammar-english-c1.json` | `emphasis` | `lessons/*/emphasis.(xml|json)` |
| `grammar-english-c1.json` | `emphasis-clefting-and-fronting` | `lessons/*/emphasis-clefting-and-fronting.(xml|json)` |
| `grammar-english-c1.json` | `ellipsis` | `lessons/*/ellipsis.(xml|json)` |
| `grammar-english-c1.json` | `inversion` | `lessons/*/inversion.(xml|json)` |
| `grammar-english-c1.json` | `passive-transitive-intransitive` | `lessons/*/passive-transitive-intransitive.(xml|json)` |
| `grammar-english-c1.json` | `substitution` | `lessons/*/substitution.(xml|json)` |
| `grammar-english-c1.json` | `english-punctuation-commas` | `lessons/*/english-punctuation-commas.(xml|json)` |
| `grammar-english-c1.json` | `english-punctuation-dashes-semicolons` | `lessons/*/english-punctuation-dashes-semicolons.(xml|json)` |
| `grammar-english-c1.json` | `all-tenses-review` | `lessons/*/all-tenses-review.(xml|json)` |
| `grammar-english-c1.json` | `reported-speech-reporting-verbs` | `lessons/*/reported-speech-reporting-verbs.(xml|json)` |
| `grammar-english-c1.json` | `conditionals-all-types-mixed` | `lessons/*/conditionals-all-types-mixed.(xml|json)` |
| `grammar-english-c1.json` | `reduced-conditionals` | `lessons/*/reduced-conditionals.(xml|json)` |
| `grammar-english-c1.json` | `different-types-of-clauses` | `lessons/*/different-types-of-clauses.(xml|json)` |
| `grammar-english-c1.json` | `reduced-relative-clauses` | `lessons/*/reduced-relative-clauses.(xml|json)` |
| `grammar-english-c1.json` | `participles` | `lessons/*/participles.(xml|json)` |
| `grammar-english-c1.json` | `participle-clauses` | `lessons/*/participle-clauses.(xml|json)` |
| `introductory-english.json` | `introductory-a0-a1` | `lessons/*/introductory-a0-a1.(xml|json)` |
| `introductory-english.json` | `introductory-a2` | `lessons/*/introductory-a2.(xml|json)` |
| `introductory-english.json` | `introductory-b2` | `lessons/*/introductory-b2.(xml|json)` |
| `introductory-english.json` | `introductory-c1` | `lessons/*/introductory-c1.(xml|json)` |
| `introductory-english.json` | `introductory-c2` | `lessons/*/introductory-c2.(xml|json)` |
| `phrasal-verbs-english-a2.json` | `phrasal-verbs-a2-lesson-1` | `lessons/*/phrasal-verbs-a2-lesson-1.(xml|json)` |
| `phrasal-verbs-english-a2.json` | `phrasal-verbs-a2-lesson-2` | `lessons/*/phrasal-verbs-a2-lesson-2.(xml|json)` |
| `phrasal-verbs-english-a2.json` | `phrasal-verbs-a2-lesson-3` | `lessons/*/phrasal-verbs-a2-lesson-3.(xml|json)` |
| `phrasal-verbs-english-a2.json` | `phrasal-verbs-a2-lesson-4` | `lessons/*/phrasal-verbs-a2-lesson-4.(xml|json)` |
| `phrasal-verbs-english-a2.json` | `phrasal-verbs-a2-lesson-5` | `lessons/*/phrasal-verbs-a2-lesson-5.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-1` | `lessons/*/phrasal-verbs-b1-lesson-1.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-2` | `lessons/*/phrasal-verbs-b1-lesson-2.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-3` | `lessons/*/phrasal-verbs-b1-lesson-3.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-4` | `lessons/*/phrasal-verbs-b1-lesson-4.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-5` | `lessons/*/phrasal-verbs-b1-lesson-5.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-6` | `lessons/*/phrasal-verbs-b1-lesson-6.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-7` | `lessons/*/phrasal-verbs-b1-lesson-7.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-8` | `lessons/*/phrasal-verbs-b1-lesson-8.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-9` | `lessons/*/phrasal-verbs-b1-lesson-9.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-10` | `lessons/*/phrasal-verbs-b1-lesson-10.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-11` | `lessons/*/phrasal-verbs-b1-lesson-11.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-12` | `lessons/*/phrasal-verbs-b1-lesson-12.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-13` | `lessons/*/phrasal-verbs-b1-lesson-13.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-14` | `lessons/*/phrasal-verbs-b1-lesson-14.(xml|json)` |
| `phrasal-verbs-english-b1.json` | `phrasal-verbs-b1-lesson-15` | `lessons/*/phrasal-verbs-b1-lesson-15.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-1` | `lessons/*/phrasal-verbs-b2-lesson-1.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-2` | `lessons/*/phrasal-verbs-b2-lesson-2.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-3` | `lessons/*/phrasal-verbs-b2-lesson-3.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-4` | `lessons/*/phrasal-verbs-b2-lesson-4.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-5` | `lessons/*/phrasal-verbs-b2-lesson-5.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-6` | `lessons/*/phrasal-verbs-b2-lesson-6.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-7` | `lessons/*/phrasal-verbs-b2-lesson-7.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-8` | `lessons/*/phrasal-verbs-b2-lesson-8.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-9` | `lessons/*/phrasal-verbs-b2-lesson-9.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-10` | `lessons/*/phrasal-verbs-b2-lesson-10.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-11` | `lessons/*/phrasal-verbs-b2-lesson-11.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-12` | `lessons/*/phrasal-verbs-b2-lesson-12.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-13` | `lessons/*/phrasal-verbs-b2-lesson-13.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-14` | `lessons/*/phrasal-verbs-b2-lesson-14.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-15` | `lessons/*/phrasal-verbs-b2-lesson-15.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-16` | `lessons/*/phrasal-verbs-b2-lesson-16.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-17` | `lessons/*/phrasal-verbs-b2-lesson-17.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-18` | `lessons/*/phrasal-verbs-b2-lesson-18.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-19` | `lessons/*/phrasal-verbs-b2-lesson-19.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-20` | `lessons/*/phrasal-verbs-b2-lesson-20.(xml|json)` |
| `phrasal-verbs-english-b2.json` | `phrasal-verbs-b2-lesson-21` | `lessons/*/phrasal-verbs-b2-lesson-21.(xml|json)` |
| `spoken-english-a1.json` | `lifehacks-language-barrier` | `lessons/*/lifehacks-language-barrier.(xml|json)` |
| `spoken-english-a1.json` | `small-talk-stranger` | `lessons/*/small-talk-stranger.(xml|json)` |
| `spoken-english-a1.json` | `small-talk-neighbour` | `lessons/*/small-talk-neighbour.(xml|json)` |
| `spoken-english-a1.json` | `small-talk-office` | `lessons/*/small-talk-office.(xml|json)` |
| `spoken-english-a1.json` | `types-of-holidays` | `lessons/*/types-of-holidays.(xml|json)` |
| `spoken-english-a1.json` | `ways-of-travelling` | `lessons/*/ways-of-travelling.(xml|json)` |
| `spoken-english-a1.json` | `asking-for-recommendations` | `lessons/*/asking-for-recommendations.(xml|json)` |
| `spoken-english-a1.json` | `giving-recommendations` | `lessons/*/giving-recommendations.(xml|json)` |
| `spoken-english-a1.json` | `checking-in-out-hotel` | `lessons/*/checking-in-out-hotel.(xml|json)` |
| `spoken-english-a1.json` | `people-activities-hotel` | `lessons/*/people-activities-hotel.(xml|json)` |
| `spoken-english-a1.json` | `solving-problems-hotel` | `lessons/*/solving-problems-hotel.(xml|json)` |
| `spoken-english-a1.json` | `means-of-transport-city` | `lessons/*/means-of-transport-city.(xml|json)` |
| `spoken-english-a1.json` | `navigating-public-transport` | `lessons/*/navigating-public-transport.(xml|json)` |
| `spoken-english-a1.json` | `places-around-home` | `lessons/*/places-around-home.(xml|json)` |
| `spoken-english-a1.json` | `renting-flat` | `lessons/*/renting-flat.(xml|json)` |
| `spoken-english-a1.json` | `plumber-electrician` | `lessons/*/plumber-electrician.(xml|json)` |
| `spoken-english-a1.json` | `coffee-shop` | `lessons/*/coffee-shop.(xml|json)` |
| `spoken-english-a1.json` | `getting-bank-card` | `lessons/*/getting-bank-card.(xml|json)` |
| `spoken-english-a1.json` | `mental-health-relaxation` | `lessons/*/mental-health-relaxation.(xml|json)` |
| `spoken-english-a1.json` | `memes-in-english` | `lessons/*/memes-in-english.(xml|json)` |
| `spoken-english-a1.json` | `se-a1-revise-and-check` | `lessons/*/se-a1-revise-and-check.(xml|json)` |
| `spoken-english-a1.json` | `se-a1-spoken-exam` | `lessons/*/se-a1-spoken-exam.(xml|json)` |
| `spoken-english-a2.json` | `planning-a-route` | `lessons/*/planning-a-route.(xml|json)` |
| `spoken-english-a2.json` | `what-a-journey` | `lessons/*/what-a-journey.(xml|json)` |
| `spoken-english-a2.json` | `money-matters-travelling` | `lessons/*/money-matters-travelling.(xml|json)` |
| `spoken-english-a2.json` | `public-transport-how-to-use` | `lessons/*/public-transport-how-to-use.(xml|json)` |
| `spoken-english-a2.json` | `paying-for-public-transport` | `lessons/*/paying-for-public-transport.(xml|json)` |
| `spoken-english-a2.json` | `etiquette-on-public-transport` | `lessons/*/etiquette-on-public-transport.(xml|json)` |
| `spoken-english-a2.json` | `using-the-subway` | `lessons/*/using-the-subway.(xml|json)` |
| `spoken-english-a2.json` | `taking-a-taxi` | `lessons/*/taking-a-taxi.(xml|json)` |
| `spoken-english-a2.json` | `types-of-stores` | `lessons/*/types-of-stores.(xml|json)` |
| `spoken-english-a2.json` | `at-the-bakery` | `lessons/*/at-the-bakery.(xml|json)` |
| `spoken-english-a2.json` | `at-the-grocery-store` | `lessons/*/at-the-grocery-store.(xml|json)` |
| `spoken-english-a2.json` | `cereals-you-forget` | `lessons/*/cereals-you-forget.(xml|json)` |
| `spoken-english-a2.json` | `at-the-butchers` | `lessons/*/at-the-butchers.(xml|json)` |
| `spoken-english-a2.json` | `at-the-checkout` | `lessons/*/at-the-checkout.(xml|json)` |
| `spoken-english-a2.json` | `understanding-online-shops` | `lessons/*/understanding-online-shops.(xml|json)` |
| `spoken-english-a2.json` | `avito-smart-shopping-a2` | `lessons/*/avito-smart-shopping-a2.(xml|json)` |
| `spoken-english-a2.json` | `talking-to-a-delivery-person` | `lessons/*/talking-to-a-delivery-person.(xml|json)` |
| `spoken-english-a2.json` | `making-complaints-returns` | `lessons/*/making-complaints-returns.(xml|json)` |
| `spoken-english-a2.json` | `grounds-for-complaint` | `lessons/*/grounds-for-complaint.(xml|json)` |
| `spoken-english-a2.json` | `buying-small-gifts` | `lessons/*/buying-small-gifts.(xml|json)` |
| `spoken-english-a2.json` | `presents` | `lessons/*/presents.(xml|json)` |
| `spoken-english-a2.json` | `pet-shop-vocabulary` | `lessons/*/pet-shop-vocabulary.(xml|json)` |
| `spoken-english-a2.json` | `inside-a-car` | `lessons/*/inside-a-car.(xml|json)` |
| `spoken-english-a2.json` | `office-stationery-words` | `lessons/*/office-stationery-words.(xml|json)` |
| `spoken-english-a2.json` | `skin-care-treatments` | `lessons/*/skin-care-treatments.(xml|json)` |
| `spoken-english-a2.json` | `shower-talk` | `lessons/*/shower-talk.(xml|json)` |
| `spoken-english-a2.json` | `bedsheets-pillows-sleep` | `lessons/*/bedsheets-pillows-sleep.(xml|json)` |
| `spoken-english-a2.json` | `baby-stuff` | `lessons/*/baby-stuff.(xml|json)` |
| `spoken-english-a2.json` | `gardening-tools` | `lessons/*/gardening-tools.(xml|json)` |
| `spoken-english-a2.json` | `cleaning-without-clean` | `lessons/*/cleaning-without-clean.(xml|json)` |
| `spoken-english-a2.json` | `laundry-day-kit` | `lessons/*/laundry-day-kit.(xml|json)` |
| `spoken-english-a2.json` | `at-the-beauty-salon` | `lessons/*/at-the-beauty-salon.(xml|json)` |
| `spoken-english-a2.json` | `at-the-hairdressers` | `lessons/*/at-the-hairdressers.(xml|json)` |
| `spoken-english-a2.json` | `at-the-pharmacy` | `lessons/*/at-the-pharmacy.(xml|json)` |
| `spoken-english-a2.json` | `if-youve-got-a-cold` | `lessons/*/if-youve-got-a-cold.(xml|json)` |
| `spoken-english-a2.json` | `post-office-talk` | `lessons/*/post-office-talk.(xml|json)` |
| `spoken-english-a2.json` | `in-the-fridge` | `lessons/*/in-the-fridge.(xml|json)` |
| `spoken-english-a2.json` | `throwing-a-party` | `lessons/*/throwing-a-party.(xml|json)` |
| `spoken-english-a2.json` | `planning-a-bbq` | `lessons/*/planning-a-bbq.(xml|json)` |
| `spoken-english-a2.json` | `table-manners-utensils` | `lessons/*/table-manners-utensils.(xml|json)` |
| `spoken-english-a2.json` | `tea-coffee-time` | `lessons/*/tea-coffee-time.(xml|json)` |
| `spoken-english-a2.json` | `runs-in-the-family` | `lessons/*/runs-in-the-family.(xml|json)` |
| `spoken-english-a2.json` | `love-stories` | `lessons/*/love-stories.(xml|json)` |
| `spoken-english-a2.json` | `friendship` | `lessons/*/friendship.(xml|json)` |
| `spoken-english-a2.json` | `good-neighbours` | `lessons/*/good-neighbours.(xml|json)` |
| `spoken-english-a2.json` | `it-drives-me-crazy` | `lessons/*/it-drives-me-crazy.(xml|json)` |
| `spoken-english-a2.json` | `honest-or-diplomatic` | `lessons/*/honest-or-diplomatic.(xml|json)` |
| `spoken-english-a2.json` | `its-embarrassing` | `lessons/*/its-embarrassing.(xml|json)` |
| `spoken-english-a2.json` | `avito-carbon-footprint-a2` | `lessons/*/avito-carbon-footprint-a2.(xml|json)` |
| `spoken-english-a2.json` | `avito-lending-helping-hand-a2` | `lessons/*/avito-lending-helping-hand-a2.(xml|json)` |
| `spoken-english-a2.json` | `avito-helping-stray-animals-a2` | `lessons/*/avito-helping-stray-animals-a2.(xml|json)` |
| `spoken-english-a2.json` | `life-cycle-of-a-bottle` | `lessons/*/life-cycle-of-a-bottle.(xml|json)` |
| `spoken-english-a2.json` | `avito-selling-services-freelance-a2` | `lessons/*/avito-selling-services-freelance-a2.(xml|json)` |
| `spoken-english-a2.json` | `starting-your-business-online` | `lessons/*/starting-your-business-online.(xml|json)` |
| `spoken-english-a2.json` | `the-world-of-work` | `lessons/*/the-world-of-work.(xml|json)` |
| `spoken-english-a2.json` | `benefits-of-music` | `lessons/*/benefits-of-music.(xml|json)` |
| `spoken-english-a2.json` | `just-do-it` | `lessons/*/just-do-it.(xml|json)` |
| `spoken-english-a2.json` | `if-you-ask-advice` | `lessons/*/if-you-ask-advice.(xml|json)` |
| `spoken-english-a2.json` | `technology-addiction` | `lessons/*/technology-addiction.(xml|json)` |
| `spoken-english-a2.json` | `social-engineering-a2` | `lessons/*/social-engineering-a2.(xml|json)` |
| `spoken-english-a2.json` | `country-in-the-city` | `lessons/*/country-in-the-city.(xml|json)` |
| `spoken-english-a2.json` | `borrowing-and-lending` | `lessons/*/borrowing-and-lending.(xml|json)` |
| `spoken-english-a2.json` | `get-ready-for-exam` | `lessons/*/get-ready-for-exam.(xml|json)` |
| `spoken-english-a2.json` | `exam-opt` | `lessons/*/exam-opt.(xml|json)` |
| `spoken-english-a2.json` | `reflection-on-exam` | `lessons/*/reflection-on-exam.(xml|json)` |
| `spoken-english-a2.json` | `se-a2-revise-and-check` | `lessons/*/se-a2-revise-and-check.(xml|json)` |
| `spoken-english-a2.json` | `se-a2-spoken-exam` | `lessons/*/se-a2-spoken-exam.(xml|json)` |
| `spoken-english-a2.json` | `avito-women-in-business` | `lessons/*/avito-women-in-business.(xml|json)` |
| `spoken-english-b1.json` | `travelling-by-plane` | `lessons/*/travelling-by-plane.(xml|json)` |
| `spoken-english-b1.json` | `travelling-by-train` | `lessons/*/travelling-by-train.(xml|json)` |
| `spoken-english-b1.json` | `travelling-by-car` | `lessons/*/travelling-by-car.(xml|json)` |
| `spoken-english-b1.json` | `travelling-by-ship` | `lessons/*/travelling-by-ship.(xml|json)` |
| `spoken-english-b1.json` | `packing-virtual-suitcase-paris` | `lessons/*/packing-virtual-suitcase-paris.(xml|json)` |
| `spoken-english-b1.json` | `packing-virtual-suitcase-bangkok` | `lessons/*/packing-virtual-suitcase-bangkok.(xml|json)` |
| `spoken-english-b1.json` | `packing-virtual-suitcase-maldives` | `lessons/*/packing-virtual-suitcase-maldives.(xml|json)` |
| `spoken-english-b1.json` | `using-transportation-apps` | `lessons/*/using-transportation-apps.(xml|json)` |
| `spoken-english-b1.json` | `holidays-from-hell` | `lessons/*/holidays-from-hell.(xml|json)` |
| `spoken-english-b1.json` | `booking-hotels` | `lessons/*/booking-hotels.(xml|json)` |
| `spoken-english-b1.json` | `situations-at-the-hotel` | `lessons/*/situations-at-the-hotel.(xml|json)` |
| `spoken-english-b1.json` | `joining-sports-club` | `lessons/*/joining-sports-club.(xml|json)` |
| `spoken-english-b1.json` | `exercise-instructions-gym` | `lessons/*/exercise-instructions-gym.(xml|json)` |
| `spoken-english-b1.json` | `healthy-lifestyle-opt` | `lessons/*/healthy-lifestyle-opt.(xml|json)` |
| `spoken-english-b1.json` | `smart-home` | `lessons/*/smart-home.(xml|json)` |
| `spoken-english-b1.json` | `repair-your-home` | `lessons/*/repair-your-home.(xml|json)` |
| `spoken-english-b1.json` | `utilities-home-services` | `lessons/*/utilities-home-services.(xml|json)` |
| `spoken-english-b1.json` | `where-do-we-live` | `lessons/*/where-do-we-live.(xml|json)` |
| `spoken-english-b1.json` | `what-is-there-in-your-home` | `lessons/*/what-is-there-in-your-home.(xml|json)` |
| `spoken-english-b1.json` | `lets-redecorate-dream-house` | `lessons/*/lets-redecorate-dream-house.(xml|json)` |
| `spoken-english-b1.json` | `finding-renting-home` | `lessons/*/finding-renting-home.(xml|json)` |
| `spoken-english-b1.json` | `neighbours-from-hell` | `lessons/*/neighbours-from-hell.(xml|json)` |
| `spoken-english-b1.json` | `tenant-rights-problems` | `lessons/*/tenant-rights-problems.(xml|json)` |
| `spoken-english-b1.json` | `cleaning-service` | `lessons/*/cleaning-service.(xml|json)` |
| `spoken-english-b1.json` | `yummy-food` | `lessons/*/yummy-food.(xml|json)` |
| `spoken-english-b1.json` | `whats-in-your-kitchen` | `lessons/*/whats-in-your-kitchen.(xml|json)` |
| `spoken-english-b1.json` | `cook-at-home-easy-smart` | `lessons/*/cook-at-home-easy-smart.(xml|json)` |
| `spoken-english-b1.json` | `understand-talk-recipes` | `lessons/*/understand-talk-recipes.(xml|json)` |
| `spoken-english-b1.json` | `dining-out-friends-family` | `lessons/*/dining-out-friends-family.(xml|json)` |
| `spoken-english-b1.json` | `gastro-tour-around-world` | `lessons/*/gastro-tour-around-world.(xml|json)` |
| `spoken-english-b1.json` | `ordering-food-drinks-special-menus` | `lessons/*/ordering-food-drinks-special-menus.(xml|json)` |
| `spoken-english-b1.json` | `is-it-right-eat-meat` | `lessons/*/is-it-right-eat-meat.(xml|json)` |
| `spoken-english-b1.json` | `budgeting-everyday-life` | `lessons/*/budgeting-everyday-life.(xml|json)` |
| `spoken-english-b1.json` | `money-poison` | `lessons/*/money-poison.(xml|json)` |
| `spoken-english-b1.json` | `saving-future-investing` | `lessons/*/saving-future-investing.(xml|json)` |
| `spoken-english-b1.json` | `banking-basics` | `lessons/*/banking-basics.(xml|json)` |
| `spoken-english-b1.json` | `understanding-credit` | `lessons/*/understanding-credit.(xml|json)` |
| `spoken-english-b1.json` | `paying-bills-subscriptions` | `lessons/*/paying-bills-subscriptions.(xml|json)` |
| `spoken-english-b1.json` | `slangy-words` | `lessons/*/slangy-words.(xml|json)` |
| `spoken-english-b1.json` | `memes` | `lessons/*/memes.(xml|json)` |
| `spoken-english-b1.json` | `preschool-childcare` | `lessons/*/preschool-childcare.(xml|json)` |
| `spoken-english-b1.json` | `school-system` | `lessons/*/school-system.(xml|json)` |
| `spoken-english-b1.json` | `smacking-or-petting` | `lessons/*/smacking-or-petting.(xml|json)` |
| `spoken-english-b1.json` | `communicating-with-teachers` | `lessons/*/communicating-with-teachers.(xml|json)` |
| `spoken-english-b1.json` | `school-meals-allergies` | `lessons/*/school-meals-allergies.(xml|json)` |
| `spoken-english-b1.json` | `school-events-volunteering` | `lessons/*/school-events-volunteering.(xml|json)` |
| `spoken-english-b1.json` | `ai-daily-life` | `lessons/*/ai-daily-life.(xml|json)` |
| `spoken-english-b1.json` | `ai-summer-smart-travel` | `lessons/*/ai-summer-smart-travel.(xml|json)` |
| `spoken-english-b1.json` | `inventions-changed-world` | `lessons/*/inventions-changed-world.(xml|json)` |
| `spoken-english-b1.json` | `technologies-at-home` | `lessons/*/technologies-at-home.(xml|json)` |
| `spoken-english-b1.json` | `youve-got-mail` | `lessons/*/youve-got-mail.(xml|json)` |
| `spoken-english-b1.json` | `avito-carbon-footprint-b1` | `lessons/*/avito-carbon-footprint-b1.(xml|json)` |
| `spoken-english-b1.json` | `avito-lending-helping-hand-b1` | `lessons/*/avito-lending-helping-hand-b1.(xml|json)` |
| `spoken-english-b1.json` | `avito-helping-stray-animals-b1` | `lessons/*/avito-helping-stray-animals-b1.(xml|json)` |
| `spoken-english-b1.json` | `environment-who-cares` | `lessons/*/environment-who-cares.(xml|json)` |
| `spoken-english-b1.json` | `online-shopping-b1` | `lessons/*/online-shopping-b1.(xml|json)` |
| `spoken-english-b1.json` | `shopping-smart-needs-wants` | `lessons/*/shopping-smart-needs-wants.(xml|json)` |
| `spoken-english-b1.json` | `avito-smart-shopping-b1` | `lessons/*/avito-smart-shopping-b1.(xml|json)` |
| `spoken-english-b1.json` | `starting-business-online-b1` | `lessons/*/starting-business-online-b1.(xml|json)` |
| `spoken-english-b1.json` | `avito-selling-services-freelance-b1` | `lessons/*/avito-selling-services-freelance-b1.(xml|json)` |
| `spoken-english-b1.json` | `ideal-workplace` | `lessons/*/ideal-workplace.(xml|json)` |
| `spoken-english-b1.json` | `avito-women-in-business-b1` | `lessons/*/avito-women-in-business-b1.(xml|json)` |
| `spoken-english-b1.json` | `soft-and-self-skills` | `lessons/*/soft-and-self-skills.(xml|json)` |
| `spoken-english-b1.json` | `incredible-stories` | `lessons/*/incredible-stories.(xml|json)` |
| `spoken-english-b1.json` | `fashion` | `lessons/*/fashion.(xml|json)` |
| `spoken-english-b1.json` | `telling-lies` | `lessons/*/telling-lies.(xml|json)` |
| `spoken-english-b1.json` | `are-we-all-criminals` | `lessons/*/are-we-all-criminals.(xml|json)` |
| `spoken-english-b1.json` | `taboo-questions` | `lessons/*/taboo-questions.(xml|json)` |
| `spoken-english-b1.json` | `bans-and-boycotts` | `lessons/*/bans-and-boycotts.(xml|json)` |
| `spoken-english-b1.json` | `appearances` | `lessons/*/appearances.(xml|json)` |
| `spoken-english-b1.json` | `why-get-married` | `lessons/*/why-get-married.(xml|json)` |
| `spoken-english-b1.json` | `survivors` | `lessons/*/survivors.(xml|json)` |
| `spoken-english-b1.json` | `to-tip-or-not-to-tip` | `lessons/*/to-tip-or-not-to-tip.(xml|json)` |
| `spoken-english-b1.json` | `social-engineering-b1` | `lessons/*/social-engineering-b1.(xml|json)` |
| `spoken-english-b1.json` | `education-reflection` | `lessons/*/education-reflection.(xml|json)` |
| `spoken-english-b1.json` | `exam-prep-opt` | `lessons/*/exam-prep-opt.(xml|json)` |
| `spoken-english-b1.json` | `exam-opt-b1` | `lessons/*/exam-opt-b1.(xml|json)` |
| `spoken-english-b1.json` | `revise-and-check-b1` | `lessons/*/revise-and-check-b1.(xml|json)` |
| `spoken-english-b1.json` | `spoken-exam-b1` | `lessons/*/spoken-exam-b1.(xml|json)` |
| `spoken-english-b1.json` | `avito-women-in-business-translation` | `lessons/*/avito-women-in-business-translation.(xml|json)` |
| `spoken-english-b2.json` | `visa-interview` | `lessons/*/visa-interview.(xml|json)` |
| `spoken-english-b2.json` | `on-my-way-to-usa` | `lessons/*/on-my-way-to-usa.(xml|json)` |
| `spoken-english-b2.json` | `place-to-call-home` | `lessons/*/place-to-call-home.(xml|json)` |
| `spoken-english-b2.json` | `hello-neighbors` | `lessons/*/hello-neighbors.(xml|json)` |
| `spoken-english-b2.json` | `weekend-rush` | `lessons/*/weekend-rush.(xml|json)` |
| `spoken-english-b2.json` | `why-should-we-hire-you` | `lessons/*/why-should-we-hire-you.(xml|json)` |
| `spoken-english-b2.json` | `clean-bill-of-health` | `lessons/*/clean-bill-of-health.(xml|json)` |
| `spoken-english-b2.json` | `office-etiquette` | `lessons/*/office-etiquette.(xml|json)` |
| `spoken-english-b2.json` | `dating-issues` | `lessons/*/dating-issues.(xml|json)` |
| `spoken-english-b2.json` | `a-month-in-america` | `lessons/*/a-month-in-america.(xml|json)` |
| `spoken-english-b2.json` | `lets-go-to-movies` | `lessons/*/lets-go-to-movies.(xml|json)` |
| `spoken-english-b2.json` | `what-do-you-do-with-money` | `lessons/*/what-do-you-do-with-money.(xml|json)` |
| `spoken-english-b2.json` | `we-the-people` | `lessons/*/we-the-people.(xml|json)` |
| `spoken-english-b2.json` | `professional-haggling` | `lessons/*/professional-haggling.(xml|json)` |
| `spoken-english-b2.json` | `my-dinner-smells-off` | `lessons/*/my-dinner-smells-off.(xml|json)` |
| `spoken-english-b2.json` | `biohacking-training` | `lessons/*/biohacking-training.(xml|json)` |
| `spoken-english-b2.json` | `business-networking` | `lessons/*/business-networking.(xml|json)` |
| `spoken-english-b2.json` | `thats-sad-indeed` | `lessons/*/thats-sad-indeed.(xml|json)` |
| `spoken-english-b2.json` | `bedtime-stories` | `lessons/*/bedtime-stories.(xml|json)` |
| `spoken-english-b2.json` | `a-year-in-america` | `lessons/*/a-year-in-america.(xml|json)` |
| `spoken-english-b2.json` | `true-detective` | `lessons/*/true-detective.(xml|json)` |
| `spoken-english-b2.json` | `jury-duty` | `lessons/*/jury-duty.(xml|json)` |
| `spoken-english-b2.json` | `business-presentation` | `lessons/*/business-presentation.(xml|json)` |
| `spoken-english-b2.json` | `handling-a-conflict` | `lessons/*/handling-a-conflict.(xml|json)` |
| `spoken-english-b2.json` | `weekend-in-usa` | `lessons/*/weekend-in-usa.(xml|json)` |
| `spoken-english-b2.json` | `stereotypes-we-believe` | `lessons/*/stereotypes-we-believe.(xml|json)` |
| `spoken-english-b2.json` | `in-sickness-and-in-health` | `lessons/*/in-sickness-and-in-health.(xml|json)` |
| `spoken-english-b2.json` | `the-future-is-today` | `lessons/*/the-future-is-today.(xml|json)` |
| `spoken-english-b2.json` | `lets-do-good` | `lessons/*/lets-do-good.(xml|json)` |
| `spoken-english-b2.json` | `come-back-home` | `lessons/*/come-back-home.(xml|json)` |
| `spoken-english-b2.json` | `big-game` | `lessons/*/big-game.(xml|json)` |
| `spoken-english-b2.json` | `final-exam-b2` | `lessons/*/final-exam-b2.(xml|json)` |
| `spoken-english-b2.json` | `alternative-exam-spoken-jsl` | `lessons/*/alternative-exam-spoken-jsl.(xml|json)` |
| `spoken-english-c1.json` | `introduce-self-presentation` | `lessons/*/introduce-self-presentation.(xml|json)` |
| `spoken-english-c1.json` | `burnout-experience` | `lessons/*/burnout-experience.(xml|json)` |
| `spoken-english-c1.json` | `workation` | `lessons/*/workation.(xml|json)` |
| `spoken-english-c1.json` | `new-ways-of-networking` | `lessons/*/new-ways-of-networking.(xml|json)` |
| `spoken-english-c1.json` | `intercultural-communication` | `lessons/*/intercultural-communication.(xml|json)` |
| `spoken-english-c1.json` | `psychology-mental-health` | `lessons/*/psychology-mental-health.(xml|json)` |
| `spoken-english-c1.json` | `fast-living-vs-slow-living` | `lessons/*/fast-living-vs-slow-living.(xml|json)` |
| `spoken-english-c1.json` | `content-today` | `lessons/*/content-today.(xml|json)` |
| `spoken-english-c1.json` | `quality-content` | `lessons/*/quality-content.(xml|json)` |
| `spoken-english-c1.json` | `traveling-trends` | `lessons/*/traveling-trends.(xml|json)` |
| `spoken-english-c1.json` | `future-of-traveling` | `lessons/*/future-of-traveling.(xml|json)` |
| `spoken-english-c1.json` | `language-learning-attitudes` | `lessons/*/language-learning-attitudes.(xml|json)` |
| `spoken-english-c1.json` | `fluent-or-advanced` | `lessons/*/fluent-or-advanced.(xml|json)` |
| `spoken-english-c1.json` | `lifelong-learning` | `lessons/*/lifelong-learning.(xml|json)` |
| `spoken-english-c1.json` | `soft-skills-c1` | `lessons/*/soft-skills-c1.(xml|json)` |
| `spoken-english-c1.json` | `road-so-far-1` | `lessons/*/road-so-far-1.(xml|json)` |
| `spoken-english-c1.json` | `technophobes-vs-technophiles` | `lessons/*/technophobes-vs-technophiles.(xml|json)` |
| `spoken-english-c1.json` | `mad-science` | `lessons/*/mad-science.(xml|json)` |
| `spoken-english-c1.json` | `contradictions-of-tolerance` | `lessons/*/contradictions-of-tolerance.(xml|json)` |
| `spoken-english-c1.json` | `political-correctness` | `lessons/*/political-correctness.(xml|json)` |
| `spoken-english-c1.json` | `what-is-a-family` | `lessons/*/what-is-a-family.(xml|json)` |
| `spoken-english-c1.json` | `community-and-loneliness` | `lessons/*/community-and-loneliness.(xml|json)` |
| `spoken-english-c1.json` | `big-city-life` | `lessons/*/big-city-life.(xml|json)` |
| `spoken-english-c1.json` | `survive-in-wilderness` | `lessons/*/survive-in-wilderness.(xml|json)` |
| `spoken-english-c1.json` | `appearances-deceptive` | `lessons/*/appearances-deceptive.(xml|json)` |
| `spoken-english-c1.json` | `beauty-across-cultures` | `lessons/*/beauty-across-cultures.(xml|json)` |
| `spoken-english-c1.json` | `joking-around` | `lessons/*/joking-around.(xml|json)` |
| `spoken-english-c1.json` | `international-comedy` | `lessons/*/international-comedy.(xml|json)` |
| `spoken-english-c1.json` | `serving-a-noble-cause` | `lessons/*/serving-a-noble-cause.(xml|json)` |
| `spoken-english-c1.json` | `sustainable-living-c1` | `lessons/*/sustainable-living-c1.(xml|json)` |
| `spoken-english-c1.json` | `road-so-far-2` | `lessons/*/road-so-far-2.(xml|json)` |
| `spoken-english-c1.json` | `spoken-final-exam-c1` | `lessons/*/spoken-final-exam-c1.(xml|json)` |
| `vocabulary-english-a1.json` | `time-a1` | `lessons/*/time-a1.(xml|json)` |
| `vocabulary-english-a1.json` | `dates-a1` | `lessons/*/dates-a1.(xml|json)` |
| `vocabulary-english-a1.json` | `numerals-a1` | `lessons/*/numerals-a1.(xml|json)` |
| `vocabulary-english-a1.json` | `countries-nationalities-a1` | `lessons/*/countries-nationalities-a1.(xml|json)` |
| `vocabulary-english-a2.json` | `toast-or-roast-1` | `lessons/*/toast-or-roast-1.(xml|json)` |
| `vocabulary-english-a2.json` | `toast-or-roast-british-other-versions` | `lessons/*/toast-or-roast-british-other-versions.(xml|json)` |
| `vocabulary-english-a2.json` | `what-english-studying` | `lessons/*/what-english-studying.(xml|json)` |
| `vocabulary-english-a2.json` | `british-or-american-english` | `lessons/*/british-or-american-english.(xml|json)` |
| `vocabulary-english-a2.json` | `national-stereotypes` | `lessons/*/national-stereotypes.(xml|json)` |
| `vocabulary-english-a2.json` | `british-humour` | `lessons/*/british-humour.(xml|json)` |
| `vocabulary-english-a2.json` | `canadian-english` | `lessons/*/canadian-english.(xml|json)` |
| `vocabulary-english-a2.json` | `australian-slang` | `lessons/*/australian-slang.(xml|json)` |
| `vocabulary-english-a2.json` | `accents-and-dialects` | `lessons/*/accents-and-dialects.(xml|json)` |
| `vocabulary-english-a2.json` | `globish-final-test` | `lessons/*/globish-final-test.(xml|json)` |
| `vocabulary-english-a2.json` | `bring-take` | `lessons/*/bring-take.(xml|json)` |
| `vocabulary-english-a2.json` | `go-come` | `lessons/*/go-come.(xml|json)` |
| `vocabulary-english-a2.json` | `teach-learn` | `lessons/*/teach-learn.(xml|json)` |
| `vocabulary-english-a2.json` | `make-do` | `lessons/*/make-do.(xml|json)` |
| `vocabulary-english-a2.json` | `listen-hear` | `lessons/*/listen-hear.(xml|json)` |
| `vocabulary-english-a2.json` | `see-watch-look` | `lessons/*/see-watch-look.(xml|json)` |
| `vocabulary-english-a2.json` | `lend-borrow` | `lessons/*/lend-borrow.(xml|json)` |
| `vocabulary-english-a2.json` | `speak-say-tell` | `lessons/*/speak-say-tell.(xml|json)` |
| `vocabulary-english-a2.json` | `lie-lay` | `lessons/*/lie-lay.(xml|json)` |
| `vocabulary-english-a2.json` | `remember-remind-recall` | `lessons/*/remember-remind-recall.(xml|json)` |
| `vocabulary-english-a2.json` | `loose-lose` | `lessons/*/loose-lose.(xml|json)` |
| `vocabulary-english-a2.json` | `rise-raise-arise` | `lessons/*/rise-raise-arise.(xml|json)` |
| `vocabulary-english-a2.json` | `except-besides` | `lessons/*/except-besides.(xml|json)` |
| `vocabulary-english-a2.json` | `zodiac-signs` | `lessons/*/zodiac-signs.(xml|json)` |
| `vocabulary-english-a2.json` | `chat-language` | `lessons/*/chat-language.(xml|json)` |
| `vocabulary-english-a2.json` | `sms-english` | `lessons/*/sms-english.(xml|json)` |
| `vocabulary-english-a2.json` | `common-english-proverbs` | `lessons/*/common-english-proverbs.(xml|json)` |
| `vocabulary-english-a2.json` | `common-binomial-expressions` | `lessons/*/common-binomial-expressions.(xml|json)` |
| `vocabulary-english-a2.json` | `homophones-in-english` | `lessons/*/homophones-in-english.(xml|json)` |
| `vocabulary-english-a2.json` | `office-slang` | `lessons/*/office-slang.(xml|json)` |
| `vocabulary-english-a2.json` | `common-food-idioms` | `lessons/*/common-food-idioms.(xml|json)` |
| `vocabulary-english-a2.json` | `animal-idioms` | `lessons/*/animal-idioms.(xml|json)` |
| `vocabulary-english-b1.json` | `blending-b1` | `lessons/*/blending-b1.(xml|json)` |
| `vocabulary-english-b1.json` | `clipping-b1` | `lessons/*/clipping-b1.(xml|json)` |

---

## Category 4: `curriculumId` in `curriculums/**/*.json` → `roadmaps/`

- **Total References Checked:** 0
- **Resolved:** 0
- **Unresolved:** 0

### Audit Details

No JSON file under `curriculums/**/*.json` defines a `curriculumId` property.
The 24 top-level curriculum files in `curriculums/*.json` use the `id` property (e.g., `curriculum-english-a0`), all 24 of which correspond to matching roadmap files in `roadmaps/`.

### Unresolved List

None. No `curriculumId` references were found.

---

## Category 5: Access Grants Course IDs → `curriculums/` or `roadmaps/`

- **Total References Checked:** 9
- **Resolved:** 9
- **Unresolved:** 0

### Access Grants References Audit

| Source File | User Role / Grant Key | Course ID | Matching Location | Status |
| --- | --- | --- | --- | --- |
| `data/access-grants.json` | `founder-key` (founder) | `*` | Wildcard All Access | Resolved |
| `data/access-grants.json` | `demo-teacher-1` (teacher) | `*` | Wildcard All Access | Resolved |
| `data/access-grants.json` | `teacher-english-key` (teacher) | `*` | Wildcard All Access | Resolved |
| `data/access-grants.json` | `teacher-french-key` (teacher) | `*` | Wildcard All Access | Resolved |
| `data/access-grants.json` | `teacher-russian-key` (teacher) | `*` | Wildcard All Access | Resolved |
| `data/access-grants.json` | `demo-student-1` (student) | `general-english-a1` | `curriculums/general-english-a1.json` & `roadmaps/general-english-a1.json` | Resolved |
| `data/access-grants.json` | `demo-student-2` (student) | `general-english-b2` | `curriculums/general-english-b2.json` & `roadmaps/general-english-b2.json` | Resolved |
| `data/access-grants.json` | `demo-student-2` (student) | `spoken-english-b2` | `curriculums/spoken-english-b2.json` & `roadmaps/spoken-english-b2.json` | Resolved |
| `data/access-grants.json` | `demo-student-2` (student) | `introductory-english` | `curriculums/introductory-english.json` & `roadmaps/introductory-english.json` | Resolved |

### Unresolved Access Grants List

None. All course IDs referenced in `data/access-grants.json` resolve to existing curriculums and roadmaps.

---

## Summary of Resolutions & Audit Remediation

Following the audit, the repository references were resolved according to platform architectural policies and verified requirements:

### 1. Design Tokens Stylesheet Standardization (Fixed)
- **Action Taken:** Replaced all broken external CSS stylesheet links (`css/tokens.css`, `css/components.css`, `css/base.css`, `css/layout.css`, `css/lang-pages.css`, `css/lang-accents.css`, `css/mobile.css`, `css/grammar.css`, `css/communication.css`) across `curriculums/**`, `marathons/**`, and `templates/**` (16 HTML files in total) with the pinned design tokens link:
  ```html
  <!-- Pinned to commit f59a291e8929a116b0c7d96505d67da7c16b287a; re-pin if COSYlanguages releases a tag -->
  <link rel="stylesheet" href="https://raw.githubusercontent.com/cosylanguages/COSYlanguages/f59a291e8929a116b0c7d96505d67da7c16b287a/css/cosy-tokens.css">
  ```
- **Rationale:** Adheres strictly to the token policy documented in `cosylanguages/COSYlanguages/docs/design-tokens.md`. Links are pinned to verified commit SHA `f59a291e8929a116b0c7d96505d67da7c16b287a` with a code comment instructing re-pinning when release tags are cut. All locally-defined `<style>` blocks were preserved.

### 2. Dead JavaScript Tag Removal (Removed)
- **Action Taken:** Removed all 64 `<script src="...">` tags referencing `js/core/engine.js`, `js/core/i18n.js`, `js/core/ui.js`, and `js/data/languages.js` across `curriculums/**`, `marathons/**`, and `templates/**` (16 HTML files in total).
- **Rationale:** Verified across the entire COSYlanguages ecosystem that these script files do not exist and are dead references. Code inspection confirmed inline scripts in these pages function independently using local DOM manipulation and `localStorage`, with zero dependency on the removed scripts.

### 3. Roadmap Lesson Availability Explicit Status (Fixed / Machine-Readable Gaps)
- **Action Taken:** Updated all 24 `roadmaps/*.json` files to add `"status": "planned"` to every sequence item (964 items total) that does not yet have a matching lesson file in `lessons/`. Sequence items with existing lesson files (e.g. `opposites-attract` in `general-english-c1.json` and `introductory-b1` in `introductory-english.json`) remain unchanged without `"status": "planned"`.
- **Rationale:** Makes content gaps explicit and machine-readable in roadmap JSON files without inventing empty placeholder lesson files.

### 4. Navigation & Template Link Cleanup (Fixed)
- **Action Taken:** Updated non-existent internal page links in `marathons/pronunciation-bootcamp/index.html` (e.g. `pronunciation.html`) to valid section anchors (`#niveaux`).
- **Rationale:** Ensures clean internal navigation within marathon hub pages.
