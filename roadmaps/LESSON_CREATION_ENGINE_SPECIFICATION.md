# COSYplatform - Visual Block-Based Lesson Creation Engine Architecture

## Executive Summary
This document specifies the complete **Block-Based Creation Engine** for COSYplatform (inspired by **ProgressMe**, **Edvibe / Vimbox**, and **Skyeng**). The engine empowers teachers and founders to build interactive, media-rich lessons (General Lessons & Speaking Club Sessions) visually without writing raw code or JSON.

---

## 1. Creation Engine Architecture & Layout Model

### Visual Workspace Layout (3-Pane Creation Studio)
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Top Bar: [← Catalog] [Lesson Title Input] [Level] [Lang] [Draft/Published] [👁️ Preview] │
├──────────────┬───────────────────────────────────────────────────────────┬──────────────┤
│ Left Panel   │ Middle Canvas: Interactive Slide & Block Builder           │ Right Panel  │
│ (Navigation) │                                                           │ (Block Library│
│              │ ┌───────────────────────────────────────────────────────┐ │ & Inspector) │
│ • Section 1  │ │ Slide Title: Warm-Up & Icebreaker Questions           │ │              │
│ • Section 2  │ ├───────────────────────────────────────────────────────┤ │ ➕ Text       │
│ • Section 3  │ │ [Block 1: Instruction Card]                           │ │ ➕ Vocab Card│
│ • Section 4  │ │ [Block 2: Discussion Cards (Icebreaker)]              │ │ ➕ Matching  │
│              │ │ [Block 3: Audio/Video Player Trigger]                 │ │ ➕ Fill-Blank│
│ ➕ Add Slide │ └───────────────────────────────────────────────────────┘ │ ➕ Debate    │
│              │ [➕ Add New Block Here]                                   │ ➕ Quiz/Test │
└──────────────┴───────────────────────────────────────────────────────────┴──────────────┘
```

---

## 2. Interactive Building Block Library

The engine provides 10 core modular building blocks. Teachers click or drag blocks into any slide.

### 1. 📝 Text & Heading Block (`type: "text"`)
- **Use**: Stage instructions, reading passages, quotes, or grammar rule explanations.
- **Fields**: Content (Rich text HTML/Markdown), Sub-type (`heading`, `instruction`, `quote`, `callout`).

### 2. 🎴 Interactive Vocabulary Block (`type: "vocab_cards"`)
- **Use**: Teaching target vocabulary with pronunciation, phonetic spelling, and examples.
- **Fields**:
  - `word`: Target word/phrase
  - `phonetic`: e.g. `/ˈcosy/`
  - `definition`: Definition
  - `example`: Context sentence
  - `audioUrl`: Pronunciation audio link (or auto TTS)
  - `image`: Visual image attachment

### 3. 🧩 Matching Pairs Block (`type: "matching"`)
- **Use**: Match words with definitions, synonyms, antonyms, or picture pairs.
- **Fields**: Array of `{ left: "word", right: "definition" }`. Evaluates automatically in class.

### 4. ✏️ Fill-in-the-Blanks Block (`type: "fill_blanks"`)
- **Use**: Controlled grammar and sentence practice.
- **Fields**: Text string with inline blank indicators, e.g. `"She [goes|went] to school yesterday."`

### 5. 🗣️ Discussion Cards Block (`type: "discussion_cards"`)
- **Use**: Speaking Club icebreakers and conversational rounds.
- **Fields**:
  - `roundTitle`: e.g. "Round 1: Personal Experiences"
  - `cards`: Array of questions (e.g. `["What's your favorite travel memory?", "How do you stay motivated?"]`)
  - `timerDefault`: Default timer per question (e.g., 60s).

### 6. ⚖️ Debates & Role-play Scenario Block (`type: "debate_roles"`)
- **Use**: Advanced Speaking Club rounds with conflicting viewpoints or assigned personas.
- **Fields**:
  - `topic`: Main motion or topic (e.g., "Is AI beneficial for education?")
  - `roles`: Array of persona cards (`Role A: Proponent`, `Role B: Skeptic`).

### 7. 🎬 Media Player Block (`type: "media"`)
- **Use**: Audio listening tasks, YouTube clips, or image galleries.
- **Fields**: `mediaType` (`audio` | `video` | `image`), `url`, `caption`, `timestamps` (optional section markers).

### 8. ❓ Multiple Choice / Quiz Block (`type: "quiz"`)
- **Use**: Rapid comprehension check or milestone tests.
- **Fields**: `questionText`, `options` (array), `correctIndex`, `explanation`.

### 9. 💡 Teacher Speech Script & Notes (`type: "teacher_notes"`)
- **Use**: Private guidance for teachers (hidden from students in live classroom mode).
- **Fields**: `type` (`instruction` | `speech` | `ccqs`), `content`.

### 10. 📝 Free Text / Essay / Audio Submission Task (`type: "submission_task"`)
- **Use**: Assignments requiring student text or audio response.
- **Fields**: `prompt`, `responseType` (`text` | `audio` | `both`), `wordCountLimit`.

---

## 3. Auto-Saving & State Management Engine

1. **Background Auto-Save Engine**:
   - Listens to input changes with a 2-second debounce timer (`setTimeout`).
   - Shows status indicator in top header: `[Saved ✓]`, `[Saving...]`, or `[Offline]`.
   - Saves to Supabase `lesson_content` table with `status: "draft"` or `status: "published"`.

2. **Local Backup Fallback**:
   - Saves to `localStorage['cosy_lesson_draft_<id>']` so work is never lost if the internet drops.

3. **Version History & Restore**:
   - Every publish creates a timestamped version snapshot in Supabase, allowing rollbacks.

---

## 4. Live Classroom Preview & Dual View Engine

1. **Instant Student / Teacher Preview Toggle**:
   - Teachers click **👁️ Live Preview** in the builder.
   - Switch between **Teacher View** (includes speech scripts, answer keys, teacher notes) and **Student View** (clean student interface with interactive inputs).

2. **Asset Upload Integration**:
   - Built-in drag-and-drop file dropzone for images and audio tracks.
   - Uploads directly to Supabase Storage bucket (`lesson-assets`) and returns a clean URL.

3. **Roadmap Auto-Linking**:
   - Newly published lessons automatically link to their respective roadmap curriculum (e.g. `curriculum-english-a1`).
