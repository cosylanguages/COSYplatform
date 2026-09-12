# CosyLanguages Platform Architecture

## Overview

CosyLanguages is an interactive language learning platform designed for live teacher-led 1-on-1 and group lessons, self-study practice, and structured curriculum progression.

This repository serves as the central content repository for all curriculums, roadmaps, teacher manuals, and lesson materials across the platform.

---

## 🌐 Monolingual Policy & Communicative Speaking Focus

- **Monolingual Teaching (English-Only)**: CosyLanguages operates under a strict monolingual policy. All student workspace elements, teacher speech scripts, vocabulary definitions, and grammar explanations are written exclusively in English.
- **Concept Check Questions (CCQs)**: Instead of translation tasks, target vocabulary and grammar are verified using English Concept Check Questions (CCQs) and elicitation questions.
- **Student Talk Time (STT) Maximization**: Lessons are designed to maximize student speaking time through communicative prompts, debate questions, and audio voice recording activities.

---

## 👥 Dual-View Architecture (Teacher Page vs. Student Page)

> **Architecture Correction Note**: Previously, this document described a backend "CosyLanguages Server" for real-time state synchronization. To align with the serverless, static philosophy of the platform ecosystem, CosyLanguages is implemented as a **static client-side renderer**. Two static pages (`teacher.html` and `student.html`) read lesson JSON/XML markup files directly and render role-appropriate views entirely in the browser.

Every lesson in CosyLanguages renders into two role-specific views from the same source lesson file (`.json` or `.xml`):

```
                               ┌─────────────────────────┐
                               │   Static Lesson File    │
                               │  (JSON or XML Markup)   │
                               └───────────┬─────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             ▼
     ┌────────────────────────────┐                ┌────────────────────────────┐
     │  Teacher Page (teacher.html)│                │ Student Page (student.html)│
     ├────────────────────────────┤                ├────────────────────────────┤
     │ - Full Slide Controls      │                │ - Interactive Workspace    │
     │ - Hidden Teacher Notes     │                │ - Real-Time Answer Fields  │
     │ - Suggested Speech Scripts │                │ - Vocabulary Dictionary    │
     │ - Stage Aims & Timing      │                │ - Audio Recording Widget   │
     │ - Answer Keys & Solution   │                │ - Clean Focus Mode         │
     │ - Full Catalog Access      │                │ - Entitled Courses Only    │
     └────────────────────────────┘                └────────────────────────────┘
```

### 1. Teacher Page Features
- **Hidden Guidance**: Elements tagged with `<cosy-teacher-notes>` render strictly for the teacher.
- **Stage Aims & Timing**: Step-by-step goals, recommended timing, and stage transition triggers.
- **Speech Scripts & CCQs**: Suggested dialogue (`type="speech"`) and Concept Check Questions to facilitate smooth explanations without L1 translation.
- **Answer Key Overlay**: Automatic answer visibility for checking exercises and giving feedback.
- **Group Management Controls**: Ability to assign pair/group breakout activities, mute/unmute, and control shared whiteboard elements.

### 2. Student Page Features
- **Clean Interactive Workspace**: Distraction-free interface showing only active slide content, instructions, and interactive exercises.
- **Real-time Answer Submission**: Interactive inputs, gap fills, drag-and-drop cards, and test option selections.
- **Vocabulary Add**: Quick-add words directly to personal mobile vocabulary trainer.
- **Voice Recorder & Essay Submission**: Embedded tools for speaking and writing tasks.

---

## ⏱ Multi-Duration Timing Models & Card Structures

Lessons are structured into **16 Live Lesson Cards** and **10 Homework Cards**, modularly designed to scale across 3 standard lesson durations:

| Scheduled Duration | Active Lesson Time | Structure & Allocation | Slide Filtering (`duration`) |
|---|---|---|---|
| **60 Minutes** | **50 Minutes** | Core Lesson (Warm-up, Vocab/Grammar Input, Controlled Practice, Freer Speaking, Cool-down) | `duration="50"` (Core slides) |
| **90 Minutes** | **80 Minutes** | Core + Deep Dive (Extended listening/reading, group discussion, advanced error correction) | `duration="80"` (Core + Extension slides) |
| **120 Minutes** | **110 Minutes** | Core + Extension + Masterclass (Writing workshop, debate/role-play, comprehensive feedback) | `duration="110"` (All slides including optional) |

---

## 🎯 Introductory "Aloha" First Lessons

Introductory lessons utilize specialized slide components for student onboarding:
- **Goal Selectors (`<cosy-goal-select>`)**: Captures primary student motivations (Travel, Work, Myself, Studying) and target timeframes.
- **Interest Selectors (`<cosy-choice-image>`)**: Identifies top interest topics (Movies, Tech, Business, Art, Animals, Food) to customize future course maps.
- **Course Recommendation Presentation**: Displays recommended main courses and extra skill modules.
