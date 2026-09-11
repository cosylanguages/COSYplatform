# CELTA-Style Lesson Plan Template & Guide

This guide and fill-in-the-blank template document the standard 8-stage CELTA communicative lesson framework for COSYlanguages content authors.

---

## Ecosystem Stage Mapping

Each stage of a CELTA lesson unit maps to a specific component within the COSY ecosystem:

1. **Lead-in / Context**: `curriculum/` intro text
2. **Meaning Check**: `grammar/` CCQs (`schema/ccq.schema.json`)
3. **Form**: `grammar/` manuals
4. **Pronunciation / Drill**: `COSYtools` conjugation engines
5. **Controlled Practice**: `COSYgames` (e.g. Action Hero, Battle of Wits)
6. **Freer Practice**: `COSYgames` (Storytelling, Story Chain, Opinion Arena)
7. **Production / Activation**: `COSYworld` quests / `COSYevents` speaking clubs
8. **Feedback**: a short "common errors" note field

---

## Reusable Blank Template

Copy the block below for each new curriculum unit or lesson stage document.

```markdown
# Lesson Plan: [Insert Unit / Target Structure Title]

**Language**: [e.g. en / fr / it / ru]
**CEFR Level**: [A1 / A2 / B1 / B2 / C1 / C2]
**Unit ID**: [e.g. EN-B1-PAST-HABITS-01]

---

### Stage 1: Lead-in / Context
> *Ecosystem mapping:* `curriculum/` intro text
- **Activity / Context**: [Describe lead-in context, warm-up question, or visual scenario]
- **Time**: [e.g. 5 mins]

### Stage 2: Meaning Check (CCQs)
> *Ecosystem mapping:* `grammar/` CCQs (`schema/ccq.schema.json`)
- **Target Item**: [Target grammar point or lexical item]
- **CCQ 1**: [Question answerable yes/no or short factual response - NO translation]
  - **Answer**: [Expected answer]
- **CCQ 2**: [Question answerable yes/no or short factual response - NO translation]
  - **Answer**: [Expected answer]

### Stage 3: Form
> *Ecosystem mapping:* `grammar/` manuals
- **Structural Formula**: [e.g. Subject + used to + base verb]
- **Negative / Interrogative Form**: [e.g. Subject + didn't use to + base verb]
- **Reference Manual**: [Path or section in `grammar/` manuals]

### Stage 4: Pronunciation / Drill
> *Ecosystem mapping:* `COSYtools` conjugation engines
- **Target Features**: [Weak forms, sentence stress, contraction, IPA]
- **Drill Pattern**: [Choral / individual repetition notes]
- **COSYtools Engine Link**: [Path to COSYtools engine]

### Stage 5: Controlled Practice
> *Ecosystem mapping:* `COSYgames` (e.g. Action Hero, Battle of Wits)
- **Task Type**: [Gap fill, multiple choice, sentence transformation]
- **COSYgames Integration**: [e.g. COSYgames/action-hero or COSYgames/battle-of-wits]

### Stage 6: Freer Practice
> *Ecosystem mapping:* `COSYgames` (Storytelling, Story Chain, Opinion Arena)
- **Task Type**: [Roleplay, story chain, opinion sharing]
- **COSYgames Integration**: [e.g. COSYgames/storytelling or COSYgames/opinion-arena]

### Stage 7: Production / Activation
> *Ecosystem mapping:* `COSYworld` quests / `COSYevents` speaking clubs
- **Communicative Goal**: [Real-world task or quest objective]
- **Ecosystem Session**: [e.g. COSYworld Quest "Childhood Memories" / COSYevents Speaking Club]

### Stage 8: Feedback
> *Ecosystem mapping:* a short "common errors" note field
- **Common Errors & Pitfalls**: [Note typical grammatical, lexical, or phonetic errors to monitor and address during delayed feedback]
```

---

## Filled-In Example: Past Habits (`used to`)

```markdown
# Lesson Plan: Past Habits ("used to")

**Language**: en
**CEFR Level**: B1
**Unit ID**: EN-B1-PAST-HABITS-01

---

### Stage 1: Lead-in / Context
> *Ecosystem mapping:* `curriculum/` intro text
- **Activity / Context**: Teacher presents visual images of childhood games and cassette tapes from 20 years ago. Students ask each other in pairs: "What games did you play when you were 8 years old?"
- **Time**: 5 mins

### Stage 2: Meaning Check (CCQs)
> *Ecosystem mapping:* `grammar/` CCQs (`schema/ccq.schema.json`)
- **Target Item**: used to play
- **CCQ 1**: Did I play chess regularly in the past?
  - **Answer**: Yes
- **CCQ 2**: Do I play chess regularly now?
  - **Answer**: No

### Stage 3: Form
> *Ecosystem mapping:* `grammar/` manuals
- **Structural Formula**: Subject + used to + infinitive verb
- **Negative / Interrogative Form**: Subject + didn't use to + infinitive verb / Did + Subject + use to + infinitive verb?
- **Reference Manual**: `grammar/en/b1/past_habits.md`

### Stage 4: Pronunciation / Drill
> *Ecosystem mapping:* `COSYtools` conjugation engines
- **Target Features**: Linking /juːst tə/ with weak vowel /ə/; unvoiced /s/ in "used to" (not /z/).
- **Drill Pattern**: Choral repetition of "I used to live...", "She used to work..."
- **COSYtools Engine Link**: `COSYtools/en-verb-prep/`

### Stage 5: Controlled Practice
> *Ecosystem mapping:* `COSYgames` (e.g. Action Hero, Battle of Wits)
- **Task Type**: Sentence completion and gap-fill matching past states with present contrast.
- **COSYgames Integration**: `COSYgames/battle-of-wits/past-habits`

### Stage 6: Freer Practice
> *Ecosystem mapping:* `COSYgames` (Storytelling, Story Chain, Opinion Arena)
- **Task Type**: Pairwork "Story Chain" where students build a narrative about a grandparent's childhood routines.
- **COSYgames Integration**: `COSYgames/story-chain/past-memories`

### Stage 7: Production / Activation
> *Ecosystem mapping:* `COSYworld` quests / `COSYevents` speaking clubs
- **Communicative Goal**: Participate in a 15-minute speaking club session interviewing peers about former lifestyles and past habits.
- **Ecosystem Session**: `COSYevents/speaking-club-childhood-and-nostalgia`

### Stage 8: Feedback
> *Ecosystem mapping:* a short "common errors" note field
- **Common Errors & Pitfalls**:
  - Confusion between present habits ("I am used to...") and past habits ("I used to...").
  - Writing "didn't used to" with an extra '-d' instead of "didn't use to".
  - Voicing /z/ instead of unvoiced /s/ in /juːst tə/.
```
