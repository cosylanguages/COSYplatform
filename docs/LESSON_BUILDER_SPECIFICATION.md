# COSYplatform - Web-Based Lesson Creator Specification & Architecture

## Overview
This document specifies the architecture, data models, template designs, UI/UX workflow, and Supabase integration for direct web-based lesson creation on COSYplatform (inspired by platforms like Skyeng, ProgressMe, and Edvibe / Vimbox).

---

## 1. Core Principles & Platform Strategy
- **Vanilla JS + Supabase Architecture**: Lightweight, fast, and dependency-free frontend client integrating directly with Supabase Database and Storage.
- **Block-Based Content Construction**: Modular content blocks (vocabulary cards, matching pairs, fill-in-the-blank, discussion cards, media players) that can be easily added, reordered, and edited.
- **Dual Template Focus**:
  1. **General Lesson Template**: Academic & structured (Warm-up, Vocabulary, Grammar, Reading/Listening, Exercises, Homework).
  2. **Speaking Club Session Template**: Conversational & interactive (Icebreakers, Phrasebank, Media Trigger, Categorized Discussion Cards, Debates/Role-play, Dynamic Correction Notes).

---

## 2. Template Specifications

### Template 1: General Lesson Template
Used for structured language learning (CEFR levels A0-C2).

**Sections & Block Sequence**:
1. **Header & Metadata**:
   - Title, CEFR Level (A0-C2), Language (EN, FR, RU), Unit/Roadmap association, Estimated duration (e.g., 50 mins).
2. **Warm-up / Lead-in**:
   - Visual prompt (image/quote) + 2-3 opening questions.
3. **Vocabulary & Expressions**:
   - Interactive Vocabulary Cards (Term, Phonetic, Definition, Sample Sentence, Audio link).
   - Matching Pairs Exercise (Term to Definition / Synonym).
4. **Grammar & Language Focus**:
   - Grammar Concept Card (Rules, Formulas, Example Tables).
   - Interactive Exercises: Fill-in-the-blanks, Multiple Choice, Sentence Unscramble.
5. **Reading / Listening Comprehension**:
   - Embedded Audio/Video player or Reading Passage.
   - Comprehension Check: True/False, Multiple Choice, Short Answer.
6. **Controlled & Free Production**:
   - Guided speaking prompts & production exercises.
7. **Wrap-up & Homework**:
   - Lesson recap & assigned homework exercises.

---

### Template 2: Speaking Club Session Template
Used for conversation clubs, topic-based discussions, and speaking practice sessions.

**Sections & Block Sequence**:
1. **Club Session Info & Guidelines**:
   - Discussion Theme, Level, Target Vocabulary focus, Session Rules.
2. **Icebreaker / Quick-Fire Round**:
   - 3-5 rapid-fire warm-up discussion cards (30-60 seconds per response).
3. **Key Conversational Phrases & Idioms**:
   - Essential phrasebank cards (e.g., "In my view...", "On the flip side...", "I tend to agree, but...").
4. **Media / Prompt Trigger**:
   - Short video clip, image set, or controversial article quote to spark debate.
5. **Categorized Discussion Rounds**:
   - **Round 1: Personal Experiences** (Relatable context & anecdotes).
   - **Round 2: Deep Dive & Analysis** (Exploring causes, pros/cons, societal impacts).
   - **Round 3: Debate / Role-Play Scenario** (Assigned roles/perspectives for interactive debate).
6. **Teacher's Live Board & Error Correction**:
   - Dynamic real-time whiteboard section for teacher feedback, vocabulary notes, and grammar corrections made during the session.

---

## 3. Supabase Database Schema

```sql
-- 1. Lessons Main Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('general', 'speaking_club')),
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  level VARCHAR(10) NOT NULL DEFAULT 'a1',
  unit_name TEXT,
  roadmap_id TEXT,
  lesson_number INTEGER,
  duration_minutes INTEGER DEFAULT 50,
  cover_image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Lesson Sections Table
CREATE TABLE IF NOT EXISTS public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  section_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  section_type VARCHAR(50) NOT NULL, -- 'warmup', 'vocab', 'grammar', 'reading', 'listening', 'practice', 'discussion', 'homework'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lesson Blocks Table
CREATE TABLE IF NOT EXISTS public.lesson_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.lesson_sections(id) ON DELETE CASCADE,
  block_order INTEGER NOT NULL,
  block_type VARCHAR(50) NOT NULL, -- 'text', 'vocab_cards', 'matching', 'fill_blanks', 'quiz', 'media', 'discussion_cards', 'debate_roles'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_blocks ENABLE ROW LEVEL SECURITY;

-- Read policies: Published lessons readable by authenticated users
CREATE POLICY "Published lessons viewable by users" ON public.lessons
  FOR SELECT USING (status = 'published' OR auth.uid() = created_by);

-- Write policies: Teachers/Founders can create and update lessons
CREATE POLICY "Teachers and Founders can insert lessons" ON public.lessons
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers and Founders can update lessons" ON public.lessons
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

---

## 4. Web-Based Authoring Workflow & Live Sync Architecture

1. **Lesson Builder Interface (`teacher.html` / `founder.html`)**:
   - Template Selector Modal -> Pick "General Lesson" or "Speaking Club".
   - Dynamic Form & Visual Builder -> Pre-loads standard template sections with block controls (Add Block, Reorder, Edit JSON/WYSIWYG, Preview).
   - Asset Upload -> Audio/Images uploaded directly to Supabase Storage bucket (`lesson-assets`).

2. **Classroom Integration (`classroom.html`)**:
   - `shared/js/lesson-resolver.js` checks Supabase `lessons` table first.
   - Live synchronization during class: Teacher actions (revealing answers, changing discussion card, noting live feedback) sync to student via Supabase Realtime Channels.
