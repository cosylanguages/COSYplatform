// Fails when a UI language is missing keys that en.json has (or has extras).
import { readFileSync } from 'node:fs';
const dir = new URL('../src/shared/i18n/', import.meta.url);
const load = (l) => JSON.parse(readFileSync(new URL(`${l}.json`, dir), 'utf8'));
const keys = (o) => new Set(Object.keys(o).filter((k) => k !== '_meta'));
const base = keys(load('en'));
let bad = 0;
for (const l of ['fr', 'it', 'ru', 'el']) {
  const k = keys(load(l));
  const missing = [...base].filter((x) => !k.has(x));
  const extra = [...k].filter((x) => !base.has(x));
  if (missing.length || extra.length) {
    bad++;
    console.error(`${l}: missing ${missing.length}, extra ${extra.length}`, missing.slice(0, 5), extra.slice(0, 5));
  }
}
if (bad) process.exit(1);
console.log(`i18n OK: ${base.size} keys in 5 languages`);
