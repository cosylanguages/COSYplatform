# French B2 re-cut — applied, theme-only

Applied 2026-11-28. **No lesson title, id, deck file or slide changed**: four units were
re-assigned to the slot their lessons already serve, and their macro-function was rewritten. Source
of truth: `scripts/data/unit-metadata.json`; the curriculum was written by
`python3 scripts/apply-unit-metadata.py --write`.

Result in `docs/B2_SLOT_ALIGNMENT.md`: **5/13 → 9/13 slots**, duplicate primaries down from 7 to 5.

## 1. The assignment was the problem, not the content

Unlike `general-en-b1`, French B2 has honest titles: *Justice, système pénal et libertés publiques*
really is about justice. The defect was narrower — units were parked on the first theme that came to
mind, so the grid read `t17` four times and `t22` three times while nine slots went unfilled.

| unit | title | was | now | why the lessons support it |
|---|---|---|---|---|
| 4 | Culture, médias et critique artistique | t15 | **t16** | critique littéraire, cinéma d'auteur, exception culturelle, streaming — recommend and review a work |
| 7 | Justice, système pénal et libertés publiques | t17 | **t21** | laïcité, liberté de conscience, désobéissance civile, lanceurs d'alerte — dilemmas of conscience |
| 8 | Urbanisme, architecture et aménagement du territoire | t03 | **t19** | architecture bioclimatique, écoquartiers, transports durables — argue for a greener choice |
| 12 | Histoire, mémoire et société | t17 | **t01** | mémoire collective, commémorations, archives, transmission — where I come from |

`t03` (city) is not a grid slot, so unit 8 loses nothing by moving its urbanism content to
`secondaryThemes`. `macroFunction` was rewritten for all four to the B2 register (argue, weigh,
contest, situate) rather than the B1 one.

## 2. What still cannot be reached by re-labelling

| missing slot | why | cheapest fix |
|---|---|---|
| t13 work | unit 3 is economy *and* work; work is its `secondaryThemes` | split unit 3, or accept t13 as secondary |
| t06 money | no consumer, budget or complaint unit exists | author one (5 lessons) |
| t08 health | one lesson (*Santé mentale des jeunes*) inside the education unit | author one, or lift that lesson out |
| t10 travel | nothing | author one |

The course has 13 units and all of them carry real content, so 13/13 needs either four new units or
two splits. That is authoring, not bookkeeping, which is why this pass stopped at 9.

## 3. Remaining duplicates are defensible

- `t22` in units 1, 9 and 13: advanced argumentation, the French language itself, and the DELF
  synthesis unit. Three different things that all end up as *adapt my register*.
- `t17` in units 2 and 10: geopolitics and institutions vs elections and public opinion. Both are
  rules-and-society, and merging them would cost ten lessons of real content.
- `t12` (education) in unit 6 is off-grid: the B1 grid has no education slot. It belongs there and
  should not be forced into one.

## 4. Method note

The re-theme was done through `unit-metadata.json` rather than `apply-recut.py`, because no title
changed. Doing it surfaced a bug in `apply-unit-metadata.py`: `ordered()` inserted the declared
value and then overwrote it with the file's existing one, so **every re-theme silently reported
"up to date"**. Fixed, and `tests/apply-unit-metadata.test.js` now covers both the replacement and
the canonical key order (title, theme, secondaryThemes, macroFunction).
