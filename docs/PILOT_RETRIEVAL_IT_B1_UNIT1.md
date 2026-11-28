# Pilot: retrieval in Italian B1, unit 1

Lessons 2-5 of `general-italian-b1` now open with a computed retrieval set instead of the generic
"Lessico del livello A2 e del modulo precedente". This is the first place the speaking method is
visible in learner-facing content.

## What changed, per lesson

| lesson | returns | blocks |
|---|---|---|
| 2. L'anteriorità nel racconto | 4 | passato prossimo vs imperfetto, trapassato prossimo, *intanto*, *frattempo* |
| 3. I connettivi del racconto | 8 | *già*, *prima*, *quando*, both lesson-1 frames, *ancora non*, *dopo che*, *intanto* |
| 4. Gerundio e participio | 8 | *tuttavia*, *inoltre*, *quindi*, *infatti*, *invece*, *comunque*, connettivi frame, *già* |
| 5. L'ordine delle parole e l'enfasi | 8 | *mentre*, *visto*, *durante*, gerundio frame, *tuttavia*, *inoltre*, *quindi*, *infatti* |

Lesson 1 has nothing before it, so it stays an introduction only — the plan says so rather than
inventing filler.

## The questions

Written by hand against the plan, one per block, in Italian at B1.

**Lesson 2**
1. Racconta un pomeriggio di dieci anni fa: com'era la giornata e che cosa è successo all'improvviso? *(passato prossimo vs imperfetto)*
2. Ieri sei arrivato a casa e qualcuno aveva già preparato la cena: racconta che cosa aveva già fatto. *(trapassato prossimo)*
3. Che cosa facevi intanto che aspettavi il tuo turno? Rispondi in tre frasi. *(intanto)*
4. Nel frattempo, mentre aspettavi, è cambiato qualcosa? Racconta. *(frattempo)*

**Lesson 3**
1. Che cosa avevi già fatto oggi prima di arrivare a lezione? *(già)*
2. Che cosa fai sempre prima di uscire di casa? *(prima)*
3. Che cosa stavi facendo quando hai sentito l'ultima notizia? *(quando)*
4. Racconta un pomeriggio di dieci anni fa: com'era la giornata e che cosa è successo all'improvviso? *(passato prossimo vs imperfetto)*
5. Ieri sei arrivato a casa e qualcuno aveva già preparato la cena: racconta che cosa aveva già fatto. *(trapassato)*
6. C'è qualcosa che ancora non hai fatto quest'anno e vorresti fare? *(ancora non)*
7. Che cosa è cambiato nella tua vita dopo che hai finito la scuola? *(dopo che)*
8. Che cosa facevi intanto che aspettavi il tuo turno? *(intanto)*

**Lesson 4**
1. Sei d'accordo con questa idea? Esprimi un dubbio: «È una buona idea; tuttavia…» *(tuttavia)*
2. Dammi due motivi per studiare una lingua straniera, il secondo con «inoltre». *(inoltre)*
3. Hai perso il treno. Racconta che cosa è successo dopo, con «quindi». *(quindi)*
4. Qualcuno dice che l'italiano è difficile. Rispondi con un esempio, usando «infatti». *(infatti)*
5. Confronta la tua città con quella di un amico: una cosa è uguale, una è diversa, con «invece». *(invece)*
6. Racconta un progetto che non è andato come volevi e chiudi con «comunque». *(comunque)*
7. Racconta un fatto in quattro frasi, una per connettivo: prima, poi, quindi, infine. *(connettivi frame)*
8. Che cosa avevi già fatto oggi prima di arrivare a lezione? *(già, second return)*

**Lesson 5**
1. Che cosa fai mentre aspetti l'autobus? *(mentre)*
2. Spiega una conseguenza che si vede dai fatti: «Visto che…, …» *(visto)*
3. Che cosa hai fatto durante l'ultima vacanza? *(durante)*
4. Racconta due azioni che avvengono insieme: «Ascoltando la musica, …» *(gerundio frame)*
5. Difendi un'opinione e poi dubitane: «…; tuttavia…» *(tuttavia, second return)*
6. Aggiungi un secondo argomento a quello che hai appena detto, con «inoltre». *(inoltre, second return)*
7. Racconta una conseguenza con «quindi». *(quindi, second return)*
8. Conferma un'affermazione con un esempio e «infatti». *(infatti, second return)*

## How it is stored

Two places, kept in step by construction — the deck text was read from the curriculum note, not
typed twice:

- `curriculums/it/general/B1.json`, `teacher_notes`, one added line:
  `returns: [{"block": "cosydata:it:gia:adverb", "q": "Che cosa avevi già fatto oggi prima di arrivare a lezione?"}, …]`
- the deck's stage-2 slide: an instruction, a blockquote carrying the numbered questions with
  `usesChunk` listing the ids, a second instruction, and the input. `recycling.prior` now names the
  blocks instead of naming a level, and `recycling.priorBlocks` carries the ids.

`priorBlocks` and `usesChunk` are additive keys. Nothing was removed, nothing was reordered.

## Reading it as a learner

The honest test is not "is this correct Italian" but "is this a conversation or a quiz". Two
observations from reading the four lessons back:

**It is a conversation, with one exception.** Lessons 2, 4 and 5 read as someone asking about your
week. Lesson 3's eight questions are almost all in the past, because lesson 1 and 2 were both about
the past, so the same tense returns three times in a row. That is the algorithm doing what it was
told: spacing, longest-waiting first. It is also monotonous. A real schedule needs a **variety
constraint** — no more than two returns of the same kind per lesson — which the planner does not
have yet.

**The triage decision is visible in the lesson.** Lesson 2 has four questions, not eight, because
lesson 1's vocabulary is mostly topic nouns (*racconto*, *sfondo*, *episodio*, *svolta*) which the
rule marked recognise-only. That is the right call for those words, and it means the pilot's
thinnest lesson is the one whose vocabulary was decoration.

## What this does not yet do

- **The questions are not in the manual**, so a rebuild from COSYmanuals would drop them. The
  builder needs to learn `returns:` before this survives regeneration. That is why the pilot is four
  lessons, not sixty-five.
- **No answers, no model responses, no audio.** Stage 2 is a prompt, which is what the method asks
  for, but a teacher needs a hint of what a good B1 answer sounds like.
- **Only hold blocks are returned.** The 262 recognise blocks in this course are still met once. If
  the reading texts do not use them, they are decoration with a label.
- **The variety constraint is missing**, as above.
- Five lessons of 65 are done. The remaining 60 need the same authoring, and lessons beyond unit 1
  will expose whether the plan's theme-spread is usable or whether returns need to be filtered by
  topic after all.

---

# Second pass: the variety constraint, and unit 2

## The constraint

The first plan gave lesson 3 eight past-tense questions. The planner now enforces, per lesson:

- at most **8** returns (the cap);
- at most **3** from any one earlier lesson;
- at most **2** from any one **domain** — past, connector, manner, subjunctive, future, or the frame's
  own grammar point;
- and if the strict pass leaves fewer than **4**, the domain cap relaxes far enough to reach four,
  because a stage 2 of two questions is not worth the slot.

Domains are a keyword list in `scripts/plan-retrieval.py`, deliberately crude and readable. It had
one bug worth recording: *"Gerundio presente e passato"* matched the past domain because of the word
"passato", so manner is now tested first.

Effect across lessons 2-10: lesson 3 went from 8 questions to 4, lesson 4 from 8 to 4, lesson 5 from
8 to 6, lessons 6-10 got 7, 7, 8, 8 and 8.

## What the constraint cannot fix

Lesson 3 is still all past. Its only predecessors are lessons 1 and 2, both about narrative past —
the constraint can spread returns across sources and domains, but it cannot manufacture variety the
curriculum hasn't produced yet. That is a curriculum fact, not a planner bug, and it is the argument
for themes that alternate rather than stack.

## Unit 2: lessons 6-10

The pilot now covers nine lessons and **26 distinct blocks**, 40 questions. New in this pass:

| lesson | returns | example question |
|---|---|---|
| 6. Le forme del congiuntivo presente | 7 | Metti in rilievo una cosa che hai comprato: «Quella borsa, l'ho comprata…» |
| 7. I verbi che reggono il congiuntivo | 7 | Che cosa vuoi che faccia il tuo migliore amico questo fine settimana? |
| 8. Le congiunzioni che vogliono il congiuntivo | 8 | Che cosa credi che cambierà nella tua città fra dieci anni? |
| 9. Il congiuntivo nelle relative | 8 | Racconta un progetto che porti avanti nonostante una difficoltà: «Sebbene…» |
| 10. L'esortativo e gli auguri | 8 | Cerchi qualcuno con una qualità precisa: «Cerco una persona che sappia…» |

Reading units 1-2 back to back, the arc is now visible and, more importantly, *audible*: lesson 6
opens by asking about a purchase (dislocation from lesson 5), then a habit (mentre), a consequence
(visto che), a day (già/prima), and dissatisfaction (è che). Nothing in it is new. That is the
difference between a syllabus and a conversation.

## Where this stops

- **The manual is still the source of truth for decks**, and it does not know `returns:`. A rebuild
  drops all 40 questions. Teaching the builder to render `returns:` into slide 2 is the next
  engineering step, and it is small.
- **Units 3-13 have nothing.** 55 lessons to go, and the triage for units 3-13 is still rule-only.
- **Recognise blocks are unverified.** 262 of them in this course are never returned; whether the
  reading texts actually use them is unchecked.
