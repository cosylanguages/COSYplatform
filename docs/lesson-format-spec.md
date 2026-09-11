# CosyLanguages Lesson Format Specification

This specification defines the markup tags used in CosyLanguages lesson files (`.xml`). The format supports interactive student workspace interaction, real-time teacher guidance, multi-duration scaling (50m, 80m, 110m active minutes), monolingual instruction, and individual vs. group lesson adaptations.

## Monolingual Principle

CosyLanguages follows a **100% monolingual policy**. All slide text, vocabulary definitions, grammar rules, exercises, and teacher speech notes must be written in English. Translation exercises are replaced with English Concept Check Questions (CCQs) and communicative speaking practice.

---

## Root & Slide Structure

A lesson consists of ordered slides/stages with mode and duration tags.

```xml
<cosy-lesson id="lesson-id" level="B2" language="en" title="Relaxation and Hygge" default-duration="50" default-mode="all">
  <cosy-slide id="slide-1" stage="warm-up" duration="50|80|110" mode="individual|group|all">
    <!-- Slide content -->
  </cosy-slide>
</cosy-lesson>
```

---

## Slide Filtering Attributes

- `duration="50|80|110"`:
  - `50`: Included in standard 60-min lesson (50 min active time).
  - `80`: Included in 90-min lesson (80 min active time).
  - `110`: Included in 120-min lesson (110 min active time).
- `mode="individual|group|all"`:
  - `individual`: Displayed specifically in 1-on-1 tutoring sessions.
  - `group`: Displayed specifically in group classes (e.g. breakout prompts, pair work).
  - `all`: Universal slides rendered for both classroom formats.

---

## Core Content Tags

### 1. Instructions & Text
- `<cosy-instruction>`: Core task instruction visible to student and teacher.
  ```xml
  <cosy-instruction>Lesson objectives:</cosy-instruction>
  ```
- `<cosy-group-instruction>`: Specific instructions rendered when class is in group/pair mode.
  ```xml
  <cosy-group-instruction>In pairs, discuss these two questions for 3 minutes:</cosy-group-instruction>
  ```
- `<cosy-text type="strong|em">`: Text formatting helpers.
- `<cosy-blockquote importance="basic|low|medium|high">`: Highlighted content boxes or quote blocks.
- `<cosy-spoiler>`: Collapsible informational block with `<cosy-spoiler-title>` and `<cosy-spoiler-content>`.

---

## Introductory First Lesson Components

### 2. Goal & Interest Selectors
- `<cosy-goal-select>`: Interactive selector for primary learning goals (Travelling, Work, Personal, Studying) and target timeframes.
- `<cosy-choice-image>`: Selectable grid of student interests (Movies, Tech, Business, Art, Animals, Food) used to customize future lesson warm-ups.

---

## Dual-View Tags (Teacher Page vs. Student Page)

### 3. Teacher Notes (`<cosy-teacher-notes>`)
Teacher notes are rendered **strictly on the teacher's screen** during live lessons.
- Attributes:
  - `type="instruction"`: Stage aims, pedagogical recommendations.
  - `type="speech"`: Suggested wording/script for teacher to read or adapt (including CCQs).
  - `type="additional"`: Optional extra exercises if time allows.
  - `type="tapescript"`: Video/Audio transcripts with timing cues.
  - `title="Stage aim"`: Optional custom title header.
  - `is-expanded="true|false"`: Initial collapse state.

```xml
<cosy-teacher-notes type="instruction">
  <p><cosy-text type="strong">Stage aim:</cosy-text> to check understanding using Concept Check Questions (CCQs).</p>
</cosy-teacher-notes>

<cosy-teacher-notes type="speech">
  <p>Ask CCQ: If someone is prone to forgetting things, do they forget often or rarely?</p>
</cosy-teacher-notes>
```

---

## Interactive Student Workspace Elements

### 4. Inputs & Fill-in-the-gaps (`<cosy-input>`)
```xml
<cosy-input placeholder="to keep">
  <cosy-input-answers>
    <cosy-input-item>keep forgetting</cosy-input-item>
  </cosy-input-answers>
  <cosy-input-info>Hint or sample answer</cosy-input-info>
</cosy-input>
```

### 5. Multiple Choice & Select (`<cosy-select>`, `<cosy-test>`)
- `<cosy-select>`: Dropdown selection inside sentences or lists.
  ```xml
  <cosy-select>
    <cosy-select-answers>
      <cosy-select-item><cosy-select-item-title>wrong option</cosy-select-item-title></cosy-select-item>
      <cosy-select-item correct="true"><cosy-select-item-title>correct option</cosy-select-item-title></cosy-select-item>
    </cosy-select-answers>
  </cosy-select>
  ```
- `<cosy-test>`: Standard multiple choice question block with support for single or multiple selection (`multiple="true"`).

### 6. Drag and Drop Text (`<cosy-dnd-text>`)
```xml
<cosy-dnd-text>
  <cosy-dnd-text-drags>
    <cosy-dnd-text-drag id="1">key ingredient</cosy-dnd-text-drag>
    <cosy-dnd-text-drag id="2">cosiness</cosy-dnd-text-drag>
  </cosy-dnd-text-drags>
  <cosy-dnd-text-content>
    <ol>
      <li>The <cosy-dnd-text-drop drag-ids="2"></cosy-dnd-text-drop> of the room.</li>
    </ol>
  </cosy-dnd-text-content>
</cosy-dnd-text>
```

### 7. Matching Groups (`<cosy-groups>`)
For matching definitions, synonyms, or collocations in English.
```xml
<cosy-groups>
  <cosy-groups-row>
    <cosy-groups-item>cozy</cosy-groups-item>
    <cosy-groups-item>giving a feeling of comfort and warmth</cosy-groups-item>
  </cosy-groups-row>
</cosy-groups>
```

### 8. Choice Tabs & Options (`<cosy-choice>`)
Presents options/tabs for discussion topics, grammar hints, or alternative tasks.
```xml
<cosy-choice>
  <cosy-choice-option>
    <cosy-choice-option-title>Wordlist</cosy-choice-option-title>
    <cosy-choice-option-content>
      <!-- Content -->
    </cosy-choice-option-content>
  </cosy-choice-option>
</cosy-choice>
```

---

## Vocabulary, Grammar & Media

### 9. Vocabulary Items (`<cosy-vocabulary>`)
Integrates with student dictionary and mobile app vocabulary trainer.
```xml
<cosy-vocabulary>
  <cosy-vocabulary-item meaning-id="105868" word="cozy" definition="giving a feeling of comfort" />
</cosy-vocabulary>
```

### 10. Grammar Material (`<cosy-grammar-material>`)
Renders interactive English grammar rule cards.
```xml
<cosy-grammar-material id="862" title="Speaking about the present habits" />
```

### 11. Audio/Video & Media
- `<cosy-image resource-id="..." alt="...">`
- `<cosy-iframe src="..." height="382" />`
- `<cosy-record time="120" counts="5">`: Audio recorder component for student speech practice.
- `<cosy-essay max-length="900">`: Long text response submission widget.
