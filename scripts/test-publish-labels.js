const fs = require('fs');
const path = require('path');
const { parseContentMetadata, getAllFiles } = require('./publish_to_supabase');

function runTestPublishLabels() {
  console.log('🧪 Testing lesson language labelling...');
  const lessonsDir = path.join(process.cwd(), 'lessons');
  const lessonFiles = getAllFiles(lessonsDir);

  if (lessonFiles.length === 0) {
    console.error('❌ No lesson files found under lessons/');
    process.exit(1);
  }

  let spokenEnCount = 0;

  for (const filePath of lessonFiles) {
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const meta = parseContentMetadata(filePath, content);

    // Assert 1: Every lesson under lessons/ gets a language
    if (!meta.language || typeof meta.language !== 'string' || meta.language.trim() === '') {
      console.error(`❌ Lesson file missing language label: ${relativePath}`);
      process.exit(1);
    }

    // Assert 2: No lesson inside spoken-en/ is labelled differently from "en"
    if (relativePath.startsWith('lessons/spoken-en/')) {
      spokenEnCount++;
      if (meta.language !== 'en') {
        console.error(`❌ Lesson in spoken-en/ labelled as '${meta.language}' instead of 'en': ${relativePath}`);
        process.exit(1);
      }
    }
  }

  console.log(`✅ Checked ${lessonFiles.length} lessons under lessons/ (including ${spokenEnCount} in spoken-en/). All pass language labelling tests.`);
}

if (require.main === module) {
  runTestPublishLabels();
}

module.exports = { runTestPublishLabels };
