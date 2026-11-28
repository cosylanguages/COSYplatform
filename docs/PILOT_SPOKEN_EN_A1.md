# Pilot: converting `spoken-en-a1`

Written by hand after converting the six `Club: Lets Celebrate` lessons; the numbers come from
`scripts/xml-lesson-to-json.py` and `scripts/shelf-parity.py`.

## What the course actually contains

`roadmaps/spoken-en-a1.json` promises 49 lessons. Twenty-two have no file. The twenty-seven that do
are not the course's own modules:

| module named in the roadmap | lessons with a file |
|---|---|
| Introducing yourself, Travelling & Transportation, ... | 0 |
| Club: Debatable Relatable | 7 |
| Club: Keeping Up With Science | 8 |
| Club: Lets Celebrate | 6 |
| Club: The Greatest Quotes | 6 |

So the A1 spoken course is 22 empty slots plus 27 lessons borrowed from four conversation clubs.
That is not a defect on its own - club material in a course is a reasonable design - but nothing in
the data marks it as such, so the course reads as a 49-lesson A1 course and behaves as a 27-lesson
club sampler.

## The level is contradictory

Eight of the twenty-seven titles carry their own level tag, and all eight disagree with the file:

| lesson | title says | file says |
|---|---|---|
| Chatting with an AI vs Chatting with a Human | A2 | A1 |
| Living with Family vs Living Alone | A2 | A1 |
| Retirement: Is It Worth It? | A2 | A1 |
| Multilingual People Have Younger Brains | A2 | A1 |
| Ordinary WiFi Can Identify You | A2 | A1 |
| Sitting Up Straight May Improve Your Mood | A2 | A1 |
| A 42-Year-Old Childhood Obesity Theory May Be Wrong | A2 | A1 |
| Where You Live Shapes Your Dementia Risk | A2 | A1 |

One of the two is wrong and the data cannot say which. The science-club topics suggest A2; the
`level` attribute suggests a bulk default that was never revisited. This has to be decided per deck
before any course can claim the lesson at A1.

## Conversion cost: low, and already done

The six celebration lessons converted with character-exact text parity on the first attempt once the
mapper handled slide-level lists. Every file produced 8 slides: one vocabulary set of ten items,
three discussion rounds, one debate, one reflection. Nothing was lost and nothing needed hand
repair.

## The real cost: the lessons are structurally thin

Measured against the platform's own decks (`docs/SHELF_PARITY.md`):

| part | JSON catalogue (1711) | XML shelf (456) |
|---|---|---|
| a can-do | 90 % | 0 % |
| objectives | 96 % | 0 % |
| grammar focus | 88 % | 0 % |
| reading or listening | 93 % | 0 % |
| pronunciation | 89 % | 0 % |
| a practice task | 99 % | 100 % |

The shelf has practice and discussion and nothing else. A converted `National Book Lovers Day`
gives a learner ten words, six questions and a debate; it gives no grammar focus, no text to read,
no listening, no pronunciation work, and no statement of what the lesson is for. A French B1 deck of
the same course length carries all six.

So the migration is not the expensive part. **Authoring the four missing components into 456
lessons is.** At the density of the French B1 decks that is a rewrite, not a conversion.

## The three routes, with what each costs

1. **Convert and author.** Conversion is solved. Each lesson then needs a can-do, a unit, a grammar
   focus, a short reading or listening and a pronunciation point - five authored items against a
   lesson that currently has none. For 456 lessons that is the largest content job in this repo.
2. **Convert, then retire what cannot be raised to standard.** Club lessons that are one debate and
   ten words may be worth keeping as short conversation sessions in their own track, published as
   such, rather than as course lessons. This keeps the material and stops it pretending to be a
   full lesson.
3. **Retire the shelf.** `cinema-en-b1` (106 lessons) and `spoken-en-*` (338) would need unpublishing.

## What I recommend

Route 2, course by course, starting with `spoken-en-a1`. The club material is usable as club
material: a 30-minute conversation session with ten words and a debate is a real product. It is not
usable as an A1 course lesson in a platform whose lessons are expected to carry grammar, reading and
pronunciation.

Concretely, for `spoken-en-a1`: keep the 27 club lessons, publish them under the club track they
come from, and let the A1 spoken course keep its 22 slots as `planned` until they are authored. That
is honest about what exists, keeps every deck in the catalogue, and needs no new content to be
written before the numbers become true.

The decision is a product one and stays with the repository owner; this document exists so that the
decision is made on numbers rather than on impressions.
