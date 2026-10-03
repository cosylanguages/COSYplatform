const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const I18N_DIR = path.join(ROOT_DIR, 'shared/i18n');
const SUPPORTED_LANGS = ['en', 'fr', 'ru', 'it', 'el'];

function generateI18nReport() {
  const enPath = path.join(I18N_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error('❌ en.json missing!');
    process.exit(1);
  }

  const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enKeys = Object.keys(enDict).filter(k => k !== '_meta');

  // Key count per page namespace
  const namespaceCounts = {};
  enKeys.forEach(k => {
    const ns = k.split('.')[0] || 'common';
    namespaceCounts[ns] = (namespaceCounts[ns] || 0) + 1;
  });

  console.log('===================================================');
  console.log('🌐 COSYplatform i18n Translation Report');
  console.log('===================================================\n');

  console.log('📊 Key Count per Page Namespace (from en.json):');
  Object.entries(namespaceCounts).forEach(([ns, count]) => {
    console.log(`  - ${ns.padEnd(12)}: ${count} keys`);
  });
  console.log(`  ---------------------------------`);
  console.log(`  Total Keys   : ${enKeys.length}\n`);

  console.log('🌐 Language Dictionary Status Overview:');

  SUPPORTED_LANGS.forEach(lang => {
    const langPath = path.join(I18N_DIR, `${lang}.json`);
    if (!fs.existsSync(langPath)) {
      console.log(`  [${lang.toUpperCase()}] ❌ MISSING FILE`);
      return;
    }

    const dict = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const meta = dict._meta || { status: 'unknown', reviewedBy: null };
    const langKeys = Object.keys(dict).filter(k => k !== '_meta');

    const missingKeys = enKeys.filter(k => !langKeys.includes(k));

    console.log(`  [${lang.toUpperCase()}]`);
    console.log(`    • Key Count  : ${langKeys.length} / ${enKeys.length}`);
    console.log(`    • Missing    : ${missingKeys.length > 0 ? missingKeys.length + ' (' + missingKeys.slice(0, 3).join(', ') + '...)' : '0'}`);
    console.log(`    • Status     : ${meta.status}`);
    console.log(`    • Reviewed By: ${meta.reviewedBy || 'None'}`);
    console.log('');
  });

  console.log('===================================================');
}

if (require.main === module) {
  generateI18nReport();
}

module.exports = { generateI18nReport };
