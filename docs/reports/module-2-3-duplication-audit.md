# Module 2 & Module 3 Duplication and Roadmap Audit Report

**Author:** Jules (Software Engineer)
**Date:** September 24, 2026
**Scope:** Investigation-Only Audit of Module 2 ("Family & Relationships" / "People & Relationships") and Module 3 ("Home & Living" / "Objects & Personal Space") across all five target languages (`en`, `fr`, `it`, `ru`, `el`).

---

## Executive Summary

PRs #31, #32, and #33 each merged content targeting Module 2 and Module 3 across five target languages. An investigation was conducted to audit whether duplicate files, conflicting lesson sequences, or broken roadmap links exist in the repository.

### Key Findings:
1. **On-Disk Lesson Inventory:** There are **NO duplicate or competing lesson JSON files on disk**. On-disk lesson files across all five languages (`en`, `fr`, `it`, `ru`, `el`) follow a single, unified 22-module CEFR Master Curriculum design:
   - **Module 2:** Exactly 7 lesson files per language (`m02-l01` through `m02-l07`).
   - **Module 3:** Exactly 6 lesson files per language (`m03-l01` through `m03-l06`).
2. **Cross-Language Alignment:** Lesson titles, can-do goals, and communicative sequences for Module 2 and Module 3 map **1:1 identically across all five target languages** on disk.
3. **Roadmap Discrepancy in English:**
   - `curriculums/{fr,it,ru,el}/general/A1.json` list the complete 7-lesson Module 2 sequence and 6-lesson Module 3 sequence.
   - `curriculums/en/general/A1.json` retains an **outdated 3-lesson scheme** for Unit 2 (2.1 Family, 2.2 Personal Appearance, 2.3 Personality) and Unit 3 (3.1 Everyday Objects, 3.2 Possessions, 3.3 Colours, Shapes).
4. **Orphaned File Status:**
   - In English (`lessons/general-english-a1/`), lessons `m02-l04` through `m02-l07` and `m03-l04` through `m03-l06` exist on disk but are currently unreferenced in `curriculums/en/general/A1.json` because Unit 2 and Unit 3 in that file were not updated to the 7-lesson and 6-lesson structure when Modules 16–22 were landed.
   - In `fr`, `it`, `ru`, and `el`, all 7 Module 2 lessons and 6 Module 3 lessons are referenced and live.
5. **Validation & Link Integrity:** Both `npm run validate` and `npm run check:links` pass with **100% success** (0 schema errors, 0 broken links across 833 lesson files).

---

## 1. Full Inventory of Module 2 & Module 3 Lesson Files on Disk

### English (`lessons/general-english-a1/`)
- **Module 2 (7 files):**
  - `m02-l01-family-members-and-tree.json` — *Family Members & Family Tree*
  - `m02-l02-describing-family-age-and-jobs.json` — *Describing Family: Age & Jobs*
  - `m02-l03-physical-appearance.json` — *Physical Appearance*
  - `m02-l04-personality-and-character.json` — *Personality & Character*
  - `m02-l05-social-relationships-friends-and-colleagues.json` — *Social Relationships: Friends & Colleagues*
  - `m02-l06-introducing-people-and-asking-about-family.json` — *Introducing People & Asking About Family*
  - `m02-l07-invitations-and-social-events.json` — *Invitations & Social Events*
- **Module 3 (6 files):**
  - `m03-l01-types-of-homes-and-location.json` — *Types of Homes & Location*
  - `m03-l02-rooms-in-a-home.json` — *Rooms in a Home*
  - `m03-l03-furniture-and-prepositions-of-place.json` — *Furniture & Prepositions of Place*
  - `m03-l04-household-actions-and-everyday-activities.json` — *Household Actions & Everyday Activities*
  - `m03-l05-describing-home-size-comfort-and-cost.json` — *Describing Home: Size, Comfort & Cost*
  - `m03-l06-renting-and-housewarming.json` — *Renting & Housewarming*

### French (`lessons/general-french-a1/`)
- **Module 2 (7 files):**
  - `m02-l01-membres-de-la-famille-et-arbre.json` — *Membres de la famille & Arbre généalogique*
  - `m02-l02-decrire-la-famille-age-et-professions.json` — *Décrire la famille : Âge & Métiers*
  - `m02-l03-apparence-physique.json` — *L'apparence physique*
  - `m02-l04-personnalite-et-caractere.json` — *Personnalité & Caractère*
  - `m02-l05-relations-sociales-amis-et-collegues.json` — *Relations sociales : Amis & Collègues*
  - `m02-l06-presenter-des-personnes-et-poser-des-questions.json` — *Présenter des personnes & Poser des questions*
  - `m02-l07-invitations-et-evenements-sociaux.json` — *Invitations & Événements sociaux*
- **Module 3 (6 files):**
  - `m03-l01-types-de-logements-et-emplacement.json` — *Types de logements & Emplacement*
  - `m03-l02-pieces-de-la-maison.json` — *Les pièces de la maison*
  - `m03-l03-meubles-et-prepositions-de-lieu.json` — *Les meubles & Prépositions de lieu*
  - `m03-l04-actions-menageres-et-activites.json` — *Actions ménagères & Activités*
  - `m03-l05-decrire-le-logement-confort-et-prix.json` — *Décrire le logement : Confort & Prix*
  - `m03-l06-location-et-cremaillere.json` — *Location & Crémaillère*

### Italian (`lessons/general-italian-a1/`)
- **Module 2 (7 files):**
  - `m02-l01-membri-della-famiglia-e-albero.json` — *Membri della famiglia & Albero genealogico*
  - `m02-l02-descrivere-la-famiglia-eta-e-lavori.json` — *Descrivere la famiglia: Età & Lavori*
  - `m02-l03-aspetto-fisico.json` — *L'aspetto fisico*
  - `m02-l04-personalita-e-carattere.json` — *Personalità & Carattere*
  - `m02-l05-relazioni-sociali-amici-e-colleghi.json` — *Relazioni sociali: Amici & Colleghi*
  - `m02-l06-presentare-persone-e-chiedere-della-famiglia.json` — *Presentare persone & Chiedere della famiglia*
  - `m02-l07-inviti-ed-eventi-sociali.json` — *Inviti ed eventi sociali*
- **Module 3 (6 files):**
  - `m03-l01-tipi-di-case-e-posizione.json` — *Tipi di case & Posizione*
  - `m03-l02-stanze-della-casa.json` — *Le stanze della casa*
  - `m03-l03-mobili-e-preposizioni-di-luogo.json` — *I mobili & Preposizioni di luogo*
  - `m03-l04-azioni-di-casa-e-attivita.json` — *Azioni di casa & Attività*
  - `m03-l05-descrivere-la-casa-comfort-e-costi.json` — *Descrivere la casa: Comfort & Costi*
  - `m03-l06-affitto-e-festa-di-inaugurazione.json` — *Affitto & Festa di inaugurazione*

### Russian (`lessons/general-russian-a1/`)
- **Module 2 (7 files):**
  - `m02-l01-chleny-semi-i-semeynoe-derevo.json` — *Члены семьи и семейное дерево*
  - `m02-l02-opisanie-semi-vozrast-i-professii.json` — *Описание семьи: возраст и профессии*
  - `m02-l03-vneshnost-i-vneshniy-vid.json` — *Внешность и внешний вид*
  - `m02-l04-harakter-i-lichnost.json` — *Характер и личность*
  - `m02-l05-socialnye-svyazi-druzya-i-kollegi.json` — *Социальные связи: друзья и коллеги*
  - `m02-l06-znakomstvo-ludey-i-voprosy-o-seme.json` — *Знакомство людей и вопросы о семье*
  - `m02-l07-priglasheniya-i-vstrechi.json` — *Приглашения и встречи*
- **Module 3 (6 files):**
  - `m03-l01-tipy-zhilya-i-raspolozhenie.json` — *Типы жилья и расположение*
  - `m03-l02-komnaty-v-dome.json` — *Комнаты в доме*
  - `m03-l03-mebel-i-predlogi-mesta.json` — *Мебель и предлоги места*
  - `m03-l04-domashnie-dela-i-deystviya.json` — *Домашние дела и действия*
  - `m03-l05-opisanie-doma-uyut-i-stoimost.json` — *Описание дома: уют и стоимость*
  - `m03-l06-arenda-i-novoselye.json` — *Аренда и новоселье*

### Greek (`lessons/general-greek-a1/`)
- **Module 2 (7 files):**
  - `m02-l01-meli-oikogeneias-kai-dendro.json` — *Μέλη της οικογένειας & Οικογενειακό δέντρο*
  - `m02-l02-perigrafi-oikogeneias-ilikia-kai-epaggelmata.json` — *Περιγραφή οικογένειας: Ηλικία & Επαγγέλματα*
  - `m02-l03-exoteriki-emfanisi.json` — *Εξωτερική εμφανιση*
  - `m02-l04-prosopikotita-kai-haraktiras.json` — *Προσωπικότητα & Χαρακτήρας*
  - `m02-l05-koinonikes-scheseis-filoi-kai-synadelfoi.json` — *Κοινωνικές σχέσεις: Φίλοι & Συνάδελφοι*
  - `m02-l06-systasi-anthropon-kai-erotiseis-gia-tin-oikogeneia.json` — *Σύσταση ανθρώπων & Ερωτήσεις για την οικογένεια*
  - `m02-l07-proskliseis-kai-ekdiloseis.json` — *Προσκλήσεις & Εκδηλώσεις*
- **Module 3 (6 files):**
  - `m03-l01-typoi-spition-kai-topothesia.json` — *Τύποι σπιτιών & Τοποθεσία*
  - `m03-l02-domatia-spitiou.json` — *Τα δωμάτια του σπιτιού*
  - `m03-l03-epipla-kai-prothesis-topou.json` — *Έπιπλα & Προθέσεις τόπου*
  - `m03-l04-oikiakes-energeies-kai-drastiriotites.json` — *Οικιακές ενέργειες & Δραστηριότητες*
  - `m03-l05-perigrafi-spitiou-anesi-kai-kostos.json` — *Περιγραφή σπιτιού: Άνεση & Κόστος*
  - `m03-l06-enoikiasi-kai-parti-egkainion.json` — *Ενοικίαση & Πάρτι εγκαινίων*

---

## 2. Cross-Language Alignment Analysis

1. **Duplicate Lesson Slots:** None. Across all 5 languages, there is exactly one file per lesson slot in Module 2 (`m02-l01` .. `m02-l07`) and Module 3 (`m03-l01` .. `m03-l06`). No duplicate files or competing PR files exist on disk.
2. **Lesson Counts:** Consistent across all 5 languages (7 lessons in Module 2, 6 lessons in Module 3).
3. **Topics & Can-Do Goals:** The lesson sequence and communicative goals are 1:1 aligned across all 5 languages. For example:
   - `m02-l01`: Naming immediate and extended family members and describing family tree.
   - `m02-l02`: Stating age, occupation, and residence of family members.
   - `m02-l03`: Describing physical appearance of family members and friends.
   - `m02-l04`: Describing personality traits and character.
   - `m02-l05`: Social relationships outside family (friends, colleagues, neighbours).
   - `m02-l06`: Introducing someone and asking about their family/social circle.
   - `m02-l07`: Inviting family/friends to an event and accepting/refusing invitations.

---

## 3. Curriculum Roadmap Reference Audit (`curriculums/{lang}/general/A1.json`)

| Language | Module 2 Units Listed in `A1.json` | Module 3 Units Listed in `A1.json` | Matches Disk Files? |
|---|---|---|---|
| **French (`fr`)** | 7 lessons (2.1 to 2.7) | 6 lessons (3.1 to 3.6) | **YES** |
| **Italian (`it`)** | 7 lessons (2.1 to 2.7) | 6 lessons (3.1 to 3.6) | **YES** |
| **Russian (`ru`)** | 7 lessons (2.1 to 2.7) | 6 lessons (3.1 to 3.6) | **YES** |
| **Greek (`el`)** | 7 lessons (2.1 to 2.7) | 6 lessons (3.1 to 3.6) | **YES** |
| **English (`en`)** | **3 lessons** (2.1 Family, 2.2 Appearance, 2.3 Personality) | **3 lessons** (3.1 Objects, 3.2 Possessions, 3.3 Colours) | **NO (Outdated)** |

### Discrepancy Detail for English (`curriculums/en/general/A1.json`)
`curriculums/en/general/A1.json` retains an earlier 3-lesson unit specification for Unit 2 and Unit 3. As a result:
- In English, lessons `m02-l04` through `m02-l07` and `m03-l04` through `m03-l06` exist on disk in `lessons/general-english-a1/` but are **not referenced** in `curriculums/en/general/A1.json`.
- In `fr`, `it`, `ru`, and `el`, all 7 lessons of Module 2 and 6 lessons of Module 3 are properly referenced in `A1.json`.

---

## 4. Automated Script Results

- **Validation Check (`npm run validate`):**
  ```
  Validating 112 json files in curriculums/...
  Successfully validated 112 curriculum files.
  Validating 833 json files in lessons/...
  Successfully validated 833 lesson files.
  ```
- **Link Integrity Check (`npm run check:links`):**
  ```
  Scanning 833 lesson file(s)...
  ✅ All links verified successfully! Zero broken references found.
  ```

---

## 5. Recommendations for Future Task (Cleanup / Alignment)

1. **Do NOT Delete Any Lesson JSON Files:** All 13 lesson files per language on disk (`m02-l01`..`m02-l07` and `m03-l01`..`m03-l06`) represent valid, complete, and localized content that forms the live 22-module CEFR A0-A1 Master Curriculum.
2. **Update `curriculums/en/general/A1.json`:** In a future task, update Unit 2 and Unit 3 in `curriculums/en/general/A1.json` (and `A1.js`) from the legacy 3-lesson scheme to the 7-lesson (Module 2) and 6-lesson (Module 3) scheme present in the other 4 languages (`fr`, `it`, `ru`, `el`). This will un-orphan `m02-l04`..`m02-l07` and `m03-l04`..`m03-l06` in English without affecting any existing files.
