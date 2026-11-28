# Recycling audit

How much of the curriculum vocabulary is asked about after the lesson that introduces it.
A word counted here is one present somewhere in a deck's text; that is a floor, not proof of
learner production. A word **absent** from every later deck cannot have been recycled at all.

- decks scanned: **1711**
- curriculum vocabulary items: **21040** across 13 languages
- items seen in at least one deck: **9423**
- items seen in exactly one deck: **3250** (34.5%)

**34% of the vocabulary is met once and never asked about again.**

## By language

| language | decks | items seen | one deck only | rate |
|---|---|---|---|---|
| en | 588 | 3050 | 749 | 25% |
| fr | 526 | 2786 | 831 | 30% |
| it | 195 | 1119 | 486 | 43% |
| el | 130 | 692 | 258 | 37% |
| pt | 65 | 546 | 273 | 50% |
| es | 65 | 539 | 253 | 47% |
| de | 65 | 508 | 267 | 53% |
| ru | 16 | 183 | 133 | 73% |

## Distribution

| appearances | items | share |
|---|---|---|
| 1 deck only | 3250 | 34.5% |
| 2 | 1446 | 15.3% |
| 3-4 | 1293 | 13.7% |
| 5+ | 3434 | 36.4% |

## The recycling field

- decks with a structured retrieval set (`recycling.priorBlocks`): **4**, carrying 28 planned returns
- distinct `recycling.prior` strings: **852**
- decks whose prior line is a generic phrase rather than named items: **126**

That is 7% of decks pointing at a level or a unit instead of at the words and structures to reactivate, so nothing downstream can check it.

## What this cannot see

- it cannot tell recognition from production; a word in an instruction may never be used;
- it counts a word anywhere in the deck, including the vocabulary list that introduces it;
- it says nothing about whether the *question* that carries the word is answerable at that level.

