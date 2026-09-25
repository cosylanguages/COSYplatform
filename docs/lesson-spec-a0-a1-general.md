# Locked A0–A1 General-Course Lesson Architecture

This document defines the canonical specification and locked format for A0–A1 general language course lessons across the platform. All lesson-authoring tasks reference this specification to ensure complete consistency in design, structure, slide sequencing, and cross-language delivery.

---

## 1. Format Checklist (10 Core Principles)

Every authored A0–A1 lesson must satisfy all 10 checklist items:

1. **Communication Goal as "I can..." Outcome**
   - Every lesson must state a single primary communicative outcome using the `"I can..."` format (e.g., *"I can greet people, say goodbye, introduce myself, and use basic classroom language"*).
   - The goal is prominently displayed on Slide 1 in both `teacherNotes` and slide `elements`.

2. **Vocabulary: Core Items + Essential Chunks**
   - **Core Active Vocabulary:** 10–20 active single words or base terms.
   - **Essential Chunks & Collocations:** 5–10 functional phrases or collocations, strictly avoiding bare words where a functional phrase is required (e.g., instead of bare *"name"*, author *"Hello, my name is..."*, *"What's your name?"*, *"Nice to meet you"*).
   - Functional notes in parenthetical annotations must clarify the communicative purpose of each chunk (e.g., `• Hello, my name is... (introducing oneself)`).

3. **Function-First Grammar Focus & Practice Progression**
   - **Communicative Framing:** Exactly one primary grammar point per lesson, framed by communicative function rather than isolated abstract rules (e.g., *"Use 'be' to state identity and role"*, or *"Questions with 'be' to ask for identity"*).
   - **Practice Progression:** Grammar practice must incorporate a four-tier practice structure:
     1. Controlled exercises (e.g., multiple choice, gap fill).
     2. Substitution drills (pattern practice).
     3. Question-answer practice.
     4. Personalised production.

4. **Vocabulary Practice Progression (5 Steps)**
   - Vocabulary instruction follows a structured 5-step sequence across the lesson slides:
     1. **Recognition:** Visual/contextual identification of new terms.
     2. **Pronunciation:** Echo drills, word stress, and phoneme practice.
     3. **Matching / Classification:** Categorising or pairing words with contexts.
     4. **Controlled Production:** Gap-filling, sentence building, and drill response.
     5. **Personalised Use:** Applying target vocabulary to real personal contexts.

5. **Four Skills Distribution**
   - Every lesson targets the four skills in fixed communicative proportions:
     - **Speaking (~70%):** Repetition, pair roleplays, information gaps, and interactive communicative tasks.
     - **Listening (~10%):** Audio prompts and comprehension checks embedded within dialogues and drills.
     - **Reading (~10%):** Short scripts, dialogue reading, and matching activities.
     - **Writing (~10%):** Short written responses (3–4 sentences) applying target chunks in workbooks/notebooks.

6. **Three Multi-Duration Versions (60 / 90 / 120 min)**
   - Every lesson details three timestamped flows building additively:
     - **60 min (Essential Flow):** Core warm-up, primary vocabulary/grammar input, essential speaking roleplay, cool-down.
     - **90 min (Expanded Flow):** Essential flow + expanded vocabulary drills, substitution practice, pair mingles, extended dialogue reading/listening.
     - **120 min (Full Workshop):** Expanded flow + pronunciation lab, group simulations, written profile building, and portfolio showcase.

7. **Two Delivery Adaptations (Individual & Group)**
   - Every lesson provides explicit delivery strategies:
     - **Individual Adaptation:** 1-on-1 teacher-student interaction, tailored phonetic error correction, teacher-led roleplay with variable roles.
     - **Group Adaptation:** Mingle activities, trio roleplays, speed-greeting drills, and group surveys.

8. **Explicit Recycling & Continuity**
   - No lesson exists in isolation.
   - **Prior Recycling:** Explicitly lists recycled vocabulary, grammar structures, and communicative functions from previous lessons.
   - **Next Lesson Preparation:** Explicitly lists how current lesson elements set up upcoming learning targets.

9. **Realistic Lesson Size & Single-Domain Focus**
   - Lessons must never combine unrelated numeric or functional domains (e.g., never combine numbers + dates + prices + phone numbers into one lesson).
   - Unrelated domains must be split into a sequential progression across module lessons (e.g., Module 1 splits into: L01 Greetings, L02 Names, L06 Numbers 0–20, L07 Age/Birthday, L08 Phone Numbers, L09 Numbers 20–100 & Prices).

10. **Standard Section Order (10-Slide Canonical Sequence)**
    - All lessons adhere strictly to a 10-slide standard structure:
      - **Slide 1:** Communication Goal & Overview
      - **Slide 2:** Recycling & Course Continuity
      - **Slide 3:** Vocabulary & Essential Chunks
      - **Slide 4:** Pronunciation Focus
      - **Slide 5:** Grammar Focus & Controlled Practice
      - **Slide 6:** Four Skills Distribution (Listening & Reading)
      - **Slide 7:** Speaking & Writing Production
      - **Slide 8:** Multi-Duration Lesson Flows (60 / 90 / 120 min)
      - **Slide 9:** Delivery Adaptations (Individual & Group)
      - **Slide 10:** Homework & Recycling Notes

---

## 2. Canonical 10-Slide JSON Structure

Authored JSON files map the 10 standard sections directly into 10 slide objects within the `slides` array. Below is the structural schema specification:

```json
{
  "id": "m01-l01-hello-first-contact",
  "title": "Hello! First Contact",
  "level": "A1",
  "language": "en",
  "defaultDuration": 50,
  "defaultMode": "all",
  "objectives": [
    "greet people, say goodbye, introduce myself, and use basic classroom language",
    "communicate effectively using Module 1 target language"
  ],
  "links": {
    "vocabulary": ["hello", "hi", "goodbye", "bye", "teacher", "student", "classroom", "book"],
    "grammar": [
      {
        "topic_id": "subject-pronouns-and-be",
        "manual_url": "https://cosylanguages.github.io/COSYmanuals/manuals/en/grammar/a1/topics/to-be.html"
      }
    ],
    "communication": [
      {
        "phrase_id": "en:general:greetings-and-introductions:hello-nice-to-meet-you",
        "manual_url": "https://cosylanguages.github.io/COSYmanuals/manuals/en/communication/a1/topics/greetings-and-introductions.html"
      }
    ],
    "phonetics": "en-pron-a1-01-alphabet"
  },
  "slides": [
    {
      "id": "m01-l01-hello-first-contact-slide-1",
      "title": "1. Communication Goal & Overview",
      "stage": "warm-up",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Lesson Metadata",
          "content": "Level: A1 | Mode: Individual / Pair / Group | Duration Options: 60 / 90 / 120 min"
        },
        {
          "type": "instruction",
          "title": "Communication Goal",
          "content": "I can greet people, say goodbye, introduce myself, and use basic classroom language."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Communication Goal: I can greet people, say goodbye, introduce myself, and use basic classroom language."
        },
        {
          "type": "blockquote",
          "content": "Lesson Overview:\n- Level: A1 General English\n- Duration: 60m (Essential) / 90m (Expanded) / 120m (Full Workshop)\n- Focus: Hello! First Contact"
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-2",
      "title": "2. Recycling & Continuity",
      "stage": "recycling",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Recycling from Prior Lesson",
          "content": "First lesson of A1 General Course — introduces core foundations."
        },
        {
          "type": "instruction",
          "title": "Preparation for Next Lesson",
          "content": "Greetings and subject pronouns recycled into Lesson 2 (asking names)."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Recycling & Course Continuity:"
        },
        {
          "type": "blockquote",
          "content": "Prior Lesson Recycling: First lesson of A1 General Course — introduces core foundations.\n\nNext Lesson Preparation: Greetings and subject pronouns recycled into Lesson 2 (asking names)."
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-3",
      "title": "3. Vocabulary & Essential Chunks",
      "stage": "input",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "5-Step Vocab Progression",
          "content": "1. Recognition -> 2. Pronunciation -> 3. Classification -> 4. Controlled Production -> 5. Personalised Use"
        },
        {
          "type": "instruction",
          "title": "Core Words",
          "content": "hello, hi, goodbye, bye, good morning, good afternoon, good evening, teacher, student, classroom, book, listen, read, write, speak"
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Core Active Vocabulary (10-20 items):"
        },
        {
          "type": "blockquote",
          "content": "hello, hi, goodbye, bye, good morning, good afternoon, good evening, teacher, student, classroom, book, listen, read, write, speak"
        },
        {
          "type": "instruction",
          "content": "Essential Chunks & Functional Collocations:"
        },
        {
          "type": "blockquote",
          "content": "• Hello, my name is... (introducing oneself)\n• Nice to meet you (polite response)\n• How are you? (social greeting)\n• I'm fine, thank you (answering social greeting)\n• Open your book, please (classroom instruction)\n• Can you repeat, please? (classroom request)"
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-4",
      "title": "4. Pronunciation Focus",
      "stage": "pronunciation",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Phonetic Aim",
          "content": "Alphabet Vowels & Word Stress: Short vowels /æ/ in 'cat', /e/ in 'pen', /ɪ/ in 'listen'. Falling intonation in greetings."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Pronunciation Focus:"
        },
        {
          "type": "blockquote",
          "content": "Alphabet Vowels & Word Stress: Short vowels /æ/ in 'cat', /e/ in 'pen', /ɪ/ in 'listen'. Falling intonation in greetings."
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-5",
      "title": "5. Grammar Focus & Controlled Practice",
      "stage": "grammar",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Function-First Grammar Rule",
          "content": "Subject Pronouns (I, you, he, she, it, we, they) + Verb 'be' affirmative (am, is, are). Use 'be' to state identity and role."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Grammar System & Functional Framing:"
        },
        {
          "type": "blockquote",
          "content": "Subject Pronouns (I, you, he, she, it, we, they) + Verb 'be' affirmative (am, is, are). Use 'be' to state identity and role."
        },
        {
          "type": "instruction",
          "content": "Examples:"
        },
        {
          "type": "test",
          "content": "• I am a student.\n• You are the teacher.\n• He is Alex.\n• She is Maria.\n• We are in class.",
          "options": ["I am a student.", "Incorrect distractor statement", "Invalid option"],
          "answers": ["I am a student."]
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-6",
      "title": "6. Four Skills Distribution (Listening & Reading)",
      "stage": "reading-listening",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Skills Focus",
          "content": "Listening (~10%) + Reading (~10%)"
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Reading Dialogue & Script:"
        },
        {
          "type": "blockquote",
          "content": "Script using target language:\nPerson A: Hello, my name is...\nPerson B: Nice to meet you"
        },
        {
          "type": "instruction",
          "content": "Listening Comprehension Prompt: Listen to the prompt and confirm understanding."
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-7",
      "title": "7. Speaking & Writing Production",
      "stage": "freer-practice",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Speaking Aim (~70%)",
          "content": "Pair roleplay, information gap, and personalized speaking task."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Communicative Speaking Task:"
        },
        {
          "type": "blockquote",
          "content": "Practice with your partner: I can greet people, say goodbye, introduce myself, and use basic classroom language."
        },
        {
          "type": "instruction",
          "content": "Short Writing Task (~10%): Write 3-4 sentences in your notebook applying target chunks."
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-8",
      "title": "8. Multi-Duration Lesson Flows",
      "stage": "adaptation",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Multi-Duration Strategy",
          "content": "Choose 60m, 90m, or 120m flow based on scheduled class length."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Timestamped Multi-Duration Flows:"
        },
        {
          "type": "blockquote",
          "content": "• 60 min Flow (Essential): 0-10m Warm-up & Goal; 10-25m Vocab & Classroom Language; 25-40m Grammar 'be' Affirmative; 40-55m Speaking Roleplay; 55-60m Cool-down & HW.\n\n• 90 min Flow (Expanded): 0-10m Warm-up; 10-30m Vocab & 5-step drills; 30-50m Grammar & Substitution Drills; 50-70m Pair Roleplays; 70-85m Writing & Reading; 85-90m Cool-down.\n\n• 120 min Flow (Full Workshop): 0-15m Warm-up & Icebreaker; 15-40m Vocab & Pronunciation Lab; 40-70m Grammar Workshop; 70-100m Group Classroom Simulation; 100-115m Portfolio Response; 115-120m Cool-down."
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-9",
      "title": "9. Delivery Adaptations",
      "stage": "adaptation",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Individual Adaptation",
          "content": "Focus on 1-on-1 repetition, tailored error correction on /æ/ sound, personalized roleplay with teacher."
        },
        {
          "type": "instruction",
          "title": "Group Adaptation",
          "content": "Pair speed-greeting drill, mingle activity where students collect 3 names and roles."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Individual Lesson Adaptation:"
        },
        {
          "type": "blockquote",
          "content": "Focus on 1-on-1 repetition, tailored error correction on /æ/ sound, personalized roleplay with teacher."
        },
        {
          "type": "instruction",
          "content": "Group Lesson Adaptation:"
        },
        {
          "type": "blockquote",
          "content": "Pair speed-greeting drill, mingle activity where students collect 3 names and roles."
        }
      ]
    },
    {
      "id": "m01-l01-hello-first-contact-slide-10",
      "title": "10. Homework & Recycling Notes",
      "stage": "cool-down",
      "duration": 50,
      "mode": "all",
      "teacherNotes": [
        {
          "type": "instruction",
          "title": "Homework Assignment",
          "content": "Write 5 sentences introducing yourself and asking 2 classroom questions. Practice greetings aloud."
        },
        {
          "type": "instruction",
          "title": "Recycling into Next Lesson",
          "content": "Greetings and subject pronouns recycled into Lesson 2 (asking names)."
        }
      ],
      "elements": [
        {
          "type": "instruction",
          "content": "Homework Assignment:"
        },
        {
          "type": "blockquote",
          "content": "Write 5 sentences introducing yourself and asking 2 classroom questions. Practice greetings aloud."
        },
        {
          "type": "instruction",
          "content": "Recycling into Next Lesson:"
        },
        {
          "type": "blockquote",
          "content": "Greetings and subject pronouns recycled into Lesson 2 (asking names)."
        }
      ]
    }
  ]
}
```

---

## 3. Target Languages & Native Authoring Principles

### Target Languages
The five supported course languages across the platform are:
- `en` (English)
- `fr` (French)
- `it` (Italian)
- `ru` (Russian)
- `el` (Greek)

### Native Authoring Rules
1. **No Word-for-Word Machine Translation:** Lessons in `fr`, `it`, `ru`, and `el` must be authored natively with idiomatic expressions, natural dialogues, and authentic culturally relevant names and scenarios (e.g., using typical native names, cities, and polite address forms per language).
2. **1:1 Cross-Language Course Mapping:** While cultural examples and target vocabulary words/phrases reflect authentic target language usage, the **communication goal**, **grammar functional focus**, and **skills distribution** remain strictly equivalent across all five target languages. This ensures 1:1 lesson-by-lesson mapping across courses.

### Language-Specific Grammar Realities
Authors must explicitly adapt grammar framing to respect target-language realities rather than forcing English syntactic structures onto other languages:

- **Russian (`ru`) — Zero Copula in Present Tense:**
  - Russian present tense has no copula verb "be" (e.g., English *"I am Alex"* = Russian *"Я Алекс"*; English *"She is a teacher"* = Russian *"Она учитель"*).
  - In Lesson 1, Russian grammar focus must target subject pronouns (`я`, `ты`, `он`, `она`, `мы`, `вы`, `они`) and zero-copula nominative identity statements, rather than attempting to introduce a non-existent present-tense verb "быть".

- **Gendered Adjective & Noun Agreement (`fr`, `it`, `ru`, `el`):**
  - French, Italian, Russian, and Greek all require explicit handling of grammatical gender in early lessons covering nationalities, professions, and possessives.
  - Examples:
    - **French:** *français / française*, *étudiant / étudiante*.
    - **Italian:** *italiano / italiana*, *professore / professoressa*.
    - **Russian:** *русский / русская*, *студент / студентка*.
    - **Greek:** *Έλληνας / Ελληνίδα* (nouns), *ελληνικός / ελληνική / ελληνικό* (adjectives).

- **French (`fr`) & Italian (`it`) Phonetics & Elision:**
  - Pronunciation and chunk sections must explicitly model phonetic elision, liaisons, and contractions (*Je m'appelle*, *C'est*, *Il s'appelle*, *Mi chiamo*, *Piacere*).

- **Greek (`el`) Alphabet & Basic Case Distinction:**
  - Initial lessons must guide learners through the Greek script, stress marks (tonos), and basic nominative/accusative article distinction (*o / η / το*, *τον / την / το*).

---

## 4. File, Directory, and Data Conventions

### Directory Path Pattern
Lessons are organized into directories using full English language names and level identifiers:
```
lessons/general-<language_name>-<level>/
```
Examples:
- `lessons/general-english-a1/`
- `lessons/general-french-a1/`
- `lessons/general-italian-a1/`
- `lessons/general-russian-a1/`
- `lessons/general-greek-a1/`

> **Note on Language Naming:** Directory names use full English language names (`general-english-a1`), **not** ISO codes in directory paths. Inside the JSON file, the `"language"` property strictly uses the 2-letter ISO 639-1 code (`"en"`, `"fr"`, `"it"`, `"ru"`, `"el"`).

### File Naming Convention
Lesson JSON files follow a structured module and lesson identifier:
```
m<XX>-l<YY>-<slug>.json
```
- `<XX>`: 2-digit module number (e.g., `01` to `22`).
- `<YY>`: 2-digit lesson number (e.g., `01` to `10` or `06`).
- `<slug>`: Kebab-case descriptive title (e.g., `m01-l01-hello-first-contact.json`).

### Schema Validation & Duration Enums
- **JSON Format:** Stored as JSON files (`.json`) validated against `schemas/lesson.schema.json`.
- **Duration Enum:** `"defaultDuration"` and slide `"duration"` fields are constrained to `[50, 80, 110]` representing active teaching time tiers corresponding to 60-minute, 90-minute, and 120-minute classroom slots (leaving time for breaks and transitions).

### Link Verification
Lesson JSON files reference external indexes and manual pages in the `"links"` object:
- `vocabulary`: Keys indexed in COSYdata vocabulary repositories.
- `grammar`: `topic_id` and canonical `manual_url` pointing to `https://cosylanguages.github.io/COSYmanuals/...`.
- `communication`: Functional phrase objects with `phrase_id` and `manual_url`.
- `phonetics`: Phonetic topic references.

All links are checked using `npm run check:links` (`scripts/check-links.mjs`). Schema validation is executed via `npm run validate` (`scripts/validate-lessons.js`).
