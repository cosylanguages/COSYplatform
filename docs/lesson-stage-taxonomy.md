# Lesson Stage Taxonomy & CELTA Reconciliation

This document establishes the unified lesson stage taxonomy across COSYplatform, reconciling the **CELTA 6-Stage Framework** (`schemas/lesson-stage.schema.json`) with the **Slide-Level Stage Vocabulary** (`schemas/lesson.schema.json`).

---

## 1. Architectural Alignment

COSYplatform supports two levels of stage representations:

1. **Unit-Level CELTA Structure (`schemas/lesson-stage.schema.json`)**:
   Used for grammar reference modules, CELTA unit plans, and structured 6-stage lesson definitions. Properties use `camelCase` naming conventions:
   - `leadIn`
   - `meaningCheck`
   - `form`
   - `pronunciation`
   - `controlledPractice`
   - `freerPractice`
   - `production`
   - `instructionCheck` (ICQs attached to practice stages)

2. **Slide-Level Stage Tagging (`schemas/lesson.schema.json`)**:
   Used on individual slide objects (`slide.stage`) within interactive lesson JSON/XML files. Attributes use `kebab-case` naming conventions.

---

## 2. Reconciled Mapping Table

| CELTA Unit Stage (`lesson-stage.schema.json`) | Canonical Slide `stage` Value (`lesson.schema.json`) | Alternate / Legacy Slide `stage` Values | Stage Pedagogical Aim |
| --- | --- | --- | --- |
| `leadIn` | `lead-in` | `warm-up` | Engage student interest, establish topic context, activate schema. |
| `meaningCheck` | `ccq-check` | `input`, `listening`, `reading-listening` | Concept checking questions (CCQs) verifying understanding of meaning. |
| `form` | `grammar` | `input`, `grammar-practice` | Formal structure analysis, sentence patterns, timeline diagrams. |
| `pronunciation` | `pronunciation` | — | Word/sentence stress, IPA phonetics, connected speech, drilling. |
| `controlledPractice` | `controlled-practice` | — | Restricted accuracy practice (gap-fills, choice items, sentence completion). |
| `freerPractice` | `freer-practice` | — | Guided communicative practice with choice or structured discussion. |
| `production` | `freer-practice` | `cool-down` | Independent communicative production, capstone roleplays, real-world tasks. |
| — | `recycling` | — | Systematic review and retrieval practice of prior lesson concepts. |
| — | `adaptation` | — | Extension activities, fast-finisher tasks, or level-differentiated material. |
| — | `cool-down` | — | Lesson reflection, error feedback summary, homework wrap-up. |

---

## 3. Standardized Slide Stage Enum

The following `kebab-case` stage identifiers form the standard `enum` for `slide.stage` in `schemas/lesson.schema.json`:

### Core CELTA & Communicative Stages
- `lead-in`: Context-setting, schema activation, warm-up questions.
- `warm-up`: General icebreaker or warm-up activity.
- `recycling`: Review and retrieval of previous target language.
- `input`: Target language exposure (text, listening, audio).
- `listening`: Receptive listening practice and audio exposure.
- `reading-listening`: Receptive skill practice and comprehension check.
- `ccq-check`: Explicit concept check questions (CCQs) testing meaning.
- `grammar`: Structure presentation, form analysis, grammar rule cards.
- `grammar-practice`: Focused grammatical exercises.
- `pronunciation`: Phonetics, stress, intonation, and pronunciation drills.
- `controlled-practice`: Restricted, accuracy-focused exercises.
- `freer-practice`: Fluency-focused speaking, writing, or roleplay tasks.
- `adaptation`: Extension material or level adaptation slides.
- `cool-down`: Reflection, recap, feedback, or lesson wrap-up.

### Diagnostic & Onboarding Stages (`lessons/introductory/`)
- `intro-greeting`: Welcome and introduction.
- `intro-icebreaker`: Initial warm-up icebreaker.
- `intro-goals`: Learning goal selection (Travel, Work, Personal, Study).
- `intro-learning-style`: Learning preference and methodology selection.
- `intro-diagnostic-speaking`: Diagnostic speaking evaluation task.
- `intro-course-recommendation`: Personalized course recommendation based on performance.
- `intro-summary`: Onboarding summary and next steps.
- `aloha-intro`: Introductory welcome slide.

### Utility & Template Stages
- `homework`: Homework assignment review or instructions.
- `teacher-guide`: Teacher-only orientation or pedagogical notes slide.
- `gabarit-core`: Pronunciation core template slide.
