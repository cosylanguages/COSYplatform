const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const I18N_DIR = path.join(ROOT_DIR, 'shared/i18n');
const SUPPORTED_LANGS = ['en', 'fr', 'ru', 'it', 'el'];

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  return matches.map(m => m.slice(1, -1)).sort();
}

function runI18nDictionaryTests() {
  console.log('🧪 Running i18n Dictionary Integrity Tests (scripts/test-i18n.js)...');

  const enPath = path.join(I18N_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error('❌ en.json missing!');
    process.exit(1);
  }

  const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enKeys = Object.keys(enDict).filter(k => k !== '_meta').sort();

  for (const lang of SUPPORTED_LANGS) {
    const langPath = path.join(I18N_DIR, `${lang}.json`);
    if (!fs.existsSync(langPath)) {
      console.error(`❌ Dictionary file missing: ${lang}.json`);
      process.exit(1);
    }

    const dict = JSON.parse(fs.readFileSync(langPath, 'utf8'));

    // Check _meta
    if (!dict._meta || !dict._meta.status) {
      console.error(`❌ Missing _meta or _meta.status in ${lang}.json`);
      process.exit(1);
    }
    if (lang === 'en' && dict._meta.status !== 'source') {
      console.error(`❌ en.json _meta.status must be "source" (found "${dict._meta.status}")`);
      process.exit(1);
    }

    // Key parity check
    const langKeys = Object.keys(dict).filter(k => k !== '_meta').sort();
    const missingKeys = enKeys.filter(k => !langKeys.includes(k));
    const extraKeys = langKeys.filter(k => !enKeys.includes(k));

    if (missingKeys.length > 0) {
      console.error(`❌ ${lang}.json missing keys:`, missingKeys);
      process.exit(1);
    }
    if (extraKeys.length > 0) {
      console.error(`❌ ${lang}.json extra keys not in en.json:`, extraKeys);
      process.exit(1);
    }

    // Value and placeholder check
    for (const key of enKeys) {
      const val = dict[key];
      if (typeof val !== 'string' || val.trim() === '') {
        console.error(`❌ ${lang}.json key "${key}" is empty or not a string`);
        process.exit(1);
      }

      const enPlaceholders = extractPlaceholders(enDict[key]);
      const langPlaceholders = extractPlaceholders(val);

      if (enPlaceholders.join(',') !== langPlaceholders.join(',')) {
        console.error(`❌ ${lang}.json key "${key}" placeholder mismatch. Expected [${enPlaceholders.join(',')}], got [${langPlaceholders.join(',')}]`);
        process.exit(1);
      }
    }

    // Plural categories check
    const pr = new globalThis.Intl.PluralRules(lang);
    const requiredCategories = pr.resolvedOptions().pluralCategories; // e.g. ['one', 'few', 'many', 'other'] for ru

    const basePluralKeys = new Set();
    enKeys.forEach(k => {
      if (k.endsWith('.one') || k.endsWith('.other') || k.endsWith('.few') || k.endsWith('.many')) {
        const base = k.substring(0, k.lastIndexOf('.'));
        basePluralKeys.add(base);
      }
    });

    for (const baseKey of basePluralKeys) {
      for (const cat of requiredCategories) {
        const fullKey = `${baseKey}.${cat}`;
        if (!dict[fullKey]) {
          console.error(`❌ ${lang}.json missing required plural category key "${fullKey}" for category "${cat}"`);
          process.exit(1);
        }
      }
    }
  }

  console.log('✅ All i18n dictionary integrity tests passed!');
}

if (require.main === module) {
  runI18nDictionaryTests();
}

module.exports = { runI18nDictionaryTests };
