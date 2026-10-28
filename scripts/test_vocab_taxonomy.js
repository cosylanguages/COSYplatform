/**
 * COSYplatform - Vocabulary Taxonomy & Practice Data Coverage Test Suite
 */

const fs = require('fs');
const path = require('path');

function runTests() {
  console.log('=== Running Vocabulary Taxonomy & Practice Data Coverage Verification ===\n');

  // 1. Verify data/taxonomy.json
  const taxonomyPath = path.join(__dirname, '../data/taxonomy.json');
  if (!fs.existsSync(taxonomyPath)) {
    throw new Error('data/taxonomy.json not found');
  }
  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
  if (!taxonomy.vocabularyTaxonomy) {
    throw new Error('vocabularyTaxonomy missing in data/taxonomy.json');
  }

  const { levels, themes, subThemeCategoryMap } = taxonomy.vocabularyTaxonomy;
  if (!Array.isArray(levels) || levels.length !== 6) {
    throw new Error(`Expected 6 levels, got ${levels.length}`);
  }
  if (!Array.isArray(themes) || themes.length !== 8) {
    throw new Error(`Expected 8 themes, got ${themes.length}`);
  }
  console.log('✅ PASS: data/taxonomy.json vocabularyTaxonomy schema valid (6 levels, 8 themes).');

  // 2. Load vocab-index.js & vocab-resolver.js
  const vocabIndexPath = path.join(__dirname, '../shared/js/vocab-index.js');
  const vocabIndexContent = fs.readFileSync(vocabIndexPath, 'utf8');
  const jsonStr = vocabIndexContent.substring(
    vocabIndexContent.indexOf('{'),
    vocabIndexContent.lastIndexOf('}') + 1
  );
  global.CosyVocabIndex = JSON.parse(jsonStr);

  require('../shared/js/vocab-resolver.js');
  const resolver = global.CosyVocabResolver;
  if (!resolver) {
    throw new Error('CosyVocabResolver failed to initialize');
  }

  // 3. Check getLevels()
  const resolvedLevels = resolver.getLevels();
  if (resolvedLevels.length !== 6) {
    throw new Error(`Resolver getLevels() returned ${resolvedLevels.length} levels, expected 6`);
  }

  let totalLevelWords = 0;
  resolvedLevels.forEach(lvl => {
    if (lvl.totalWords <= 0) {
      throw new Error(`Level ${lvl.id} has 0 words`);
    }
    totalLevelWords += lvl.totalWords;
    console.log(`  • Level ${lvl.id} (${lvl.cefrEquivalent}): ${lvl.totalWords} words across ${lvl.totalFiles} files`);
  });
  console.log(`✅ PASS: All 6 CEFR levels active with ${totalLevelWords} total level-mapped entries.`);

  // 4. Check getThemesForLevel()
  const b1Themes = resolver.getThemesForLevel('b1');
  if (b1Themes.length !== 8) {
    throw new Error(`Resolver getThemesForLevel("b1") returned ${b1Themes.length} themes, expected 8`);
  }
  console.log('✅ PASS: getThemesForLevel("b1") returned all 8 lexical themes with counts.');

  // 5. Check practice data coverage
  const allPracticeWords = resolver.getAllPracticeWords();
  const totalIndexEntries = Object.values(global.CosyVocabIndex).flat().length;

  if (allPracticeWords.length !== totalIndexEntries) {
    throw new Error(`Coverage mismatch! getAllPracticeWords() returned ${allPracticeWords.length}, expected ${totalIndexEntries}`);
  }
  console.log(`✅ PASS: 100% Practice Data Coverage verified (${allPracticeWords.length} entries reachable).`);

  // 6. Check subThemeCategoryMap coverage against vocab-index files
  const uniqueFiles = new Set();
  Object.values(global.CosyVocabIndex).flat().forEach(entry => {
    uniqueFiles.add(entry.file);
  });

  let unmappedFiles = 0;
  uniqueFiles.forEach(f => {
    const subTheme = f.split('/')[1].replace('.json', '');
    if (!subThemeCategoryMap[subTheme]) {
      console.error(`Unmapped file found: ${f}`);
      unmappedFiles++;
    }
  });

  if (unmappedFiles > 0) {
    throw new Error(`Found ${unmappedFiles} unmapped sub-theme files!`);
  }
  console.log(`✅ PASS: All ${uniqueFiles.size} vocabulary sub-theme files mapped to lexical themes.`);

  // 7. Check i18n translation keys
  const i18nLangs = ['en', 'fr', 'ru', 'it', 'el'];
  i18nLangs.forEach(lang => {
    const i18nPath = path.join(__dirname, `../shared/i18n/${lang}.json`);
    const i18nData = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));
    const requiredKeys = [
      'vocab.categoryTitle',
      'vocab.levelTitle',
      'vocab.themeTitle',
      'vocab.level.a0_a1',
      'vocab.level.c2',
      'vocab.theme.everyday_basics',
      'vocab.theme.language_communication'
    ];
    requiredKeys.forEach(key => {
      if (!i18nData[key]) {
        throw new Error(`Missing key ${key} in shared/i18n/${lang}.json`);
      }
    });
  });
  console.log('✅ PASS: i18n translation keys verified across all 5 language files.');

  console.log('\n✨ ALL VOCABULARY TAXONOMY VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
}

runTests();
