# CosyLanguages Lesson Format Specification

This specification defines the markup tags used in CosyLanguages lesson files (`.xml`). The format builds upon modern interactive ESL platform standards to support rich student interaction and real-time teacher guidance.

## Root & Slide Structure

A lesson consists of ordered slides/stages.

```xml
<cosy-lesson id="lesson-id" level="B2" language="en" title="Relaxation and Hygge">
  <cosy-slide id="slide-1" stage="warm-up">
    <!-- Slide content -->
  </cosy-slide>
</cosy-lesson>
```

---

## Core Content Tags

### 1. Instructions & Text
- `<cosy-instruction>`: Core task instruction visible to student and teacher.
  ```xml
  <cosy-instruction>Lesson objectives:</cosy-instruction>
  ```
- `<cosy-text type="strong|em">`: Text formatting helpers.
- `<cosy-blockquote importance="basic|low|medium|high">`: Highlighted content boxes or quote blocks.
- `<cosy-spoiler>`: Collapsible informational block with `<cosy-spoiler-title>` and `<cosy-spoiler-content>`.

### 2. Teacher Notes (`<cosy-teacher-notes>`)
Teacher notes are rendered strictly on the teacher's screen during live lessons.
- Attributes:
  - `type="instruction"`: Stage aims, pedagogical recommendations.
  - `type="speech"`: Suggested wording/script for teacher to read or adapt.
  - `type="additional"`: Optional extra exercises if time allows.
  - `type="tapescript"`: Video/Audio transcripts with timing cues.
  - `title="Stage aim"`: Optional custom title header.
  - `is-expanded="true|false"`: Initial collapse state.

```xml
<cosy-teacher-notes type="instruction">
  <p><cosy-text type="strong">Stage aim:</cosy-text> to introduce target vocabulary.</p>
</cosy-teacher-notes>

<cosy-teacher-notes type="speech">
  <p>How do you usually relax after a difficult week?</p>
</cosy-teacher-notes>
```

---

## Interactive Exercise Elements

### 3. Inputs & Fill-in-the-gaps (`<cosy-input>`)
```xml
<cosy-input placeholder="to keep">
  <cosy-input-answers>
    <cosy-input-item>keep forgetting</cosy-input-item>
  </cosy-input-answers>
  <cosy-input-info>Hint or sample answer</cosy-input-info>
</cosy-input>
```

### 4. Multiple Choice & Select (`<cosy-select>`, `<cosy-test>`)
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

### 5. Drag and Drop Text (`<cosy-dnd-text>`)
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

### 6. Matching Groups (`<cosy-groups>`)
For matching definitions, synonyms, or collocations.
```xml
<cosy-groups>
  <cosy-groups-row>
    <cosy-groups-item>cozy</cosy-groups-item>
    <cosy-groups-item>giving a feeling of comfort and warmth</cosy-groups-item>
  </cosy-groups-row>
</cosy-groups>
```

### 7. Choice Tabs & Options (`<cosy-choice>`)
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

### 8. Image Choices (`<cosy-choice-image>`)
Grid of selectable images for warming up and goal setting.
```xml
<cosy-choice-image>
  <cosy-choice-image-option resource-id="690033"><p>Travelling</p></cosy-choice-image-option>
  <cosy-choice-image-option resource-id="690031"><p>Films and serials</p></cosy-choice-image-option>
</cosy-choice-image>
```

---

## Vocabulary, Grammar & Media

### 9. Vocabulary Items (`<cosy-vocabulary>`)
Integrates with platform dictionary.
```xml
<cosy-vocabulary>
  <cosy-vocabulary-item meaning-id="105868" word="cozy" definition="giving a feeling of comfort" />
</cosy-vocabulary>
```

### 10. Grammar Material (`<cosy-grammar-material>`)
Renders interactive grammar rule cards.
```xml
<cosy-grammar-material id="862" title="Speaking about the present habits" />
```

### 11. Audio/Video & Media
- `<cosy-image resource-id="..." alt="...">`
- `<cosy-iframe src="..." height="382" />`
- `<cosy-record time="120" counts="5">`: Audio recorder component for student speech practice.
- `<cosy-essay max-length="900">`: Long text response submission widget.
