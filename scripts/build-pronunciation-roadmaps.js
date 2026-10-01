#!/usr/bin/env node

/**
 * build-pronunciation-roadmaps.js
 *
 * Scans lessons/{english,french,russian}-pronunciation/<level>/*.json
 * and generates 18 roadmaps in roadmaps/pronunciation-<code>-<level>.json.
 */

const fs = require('fs');
const path = require('path');

const LANG_CONFIG = [
  { folder: 'english-pronunciation', code: 'en', name: 'English' },
  { folder: 'french-pronunciation', code: 'fr', name: 'French' },
  { folder: 'russian-pronunciation', code: 'ru', name: 'Russian' }
];

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

function buildPronunciationRoadmaps() {
  console.log('🔨 Building pronunciation roadmaps...');
  const rootDir = process.cwd();
  const roadmapsDir = path.join(rootDir, 'roadmaps');

  if (!fs.existsSync(roadmapsDir)) {
    fs.mkdirSync(roadmapsDir, { recursive: true });
  }

  let generatedCount = 0;
  let totalSequenceItems = 0;

  for (const lang of LANG_CONFIG) {
    for (const lvl of LEVELS) {
      const dirPath = path.join(rootDir, 'lessons', lang.folder, lvl);
      let lessonFiles = [];

      if (fs.existsSync(dirPath)) {
        lessonFiles = fs.readdirSync(dirPath)
          .filter(f => f.endsWith('.json'))
          .sort();
      }

      const courseId = `pronunciation-${lang.code}-${lvl}`;
      const levelUpper = lvl.toUpperCase();
      const title = `${lang.name} Pronunciation ${levelUpper}`;

      const sequence = lessonFiles.map((filename, idx) => {
        const fullPath = path.join(dirPath, filename);
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath, 'utf8');
        let lessonId = path.basename(filename, '.json');
        let lessonTitle = lessonId;

        try {
          const parsed = JSON.parse(content);
          if (parsed.id) lessonId = parsed.id;
          if (parsed.title) lessonTitle = parsed.title;
        } catch (e) {
          // Fallback to defaults
        }

        return {
          lessonNumber: idx + 1,
          id: lessonId,
          title: lessonTitle,
          lessonFile: relPath,
          teacherLed: true
        };
      });

      const roadmapData = {
        curriculumId: courseId,
        title,
        totalLessons: sequence.length,
        supportedDurations: [50, 80, 110],
        teacherLed: true,
        sequence
      };

      const outputPath = path.join(roadmapsDir, `${courseId}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(roadmapData, null, 2) + '\n', 'utf8');
      generatedCount++;
      totalSequenceItems += sequence.length;

      console.log(`  ✅ Generated roadmaps/${courseId}.json (${sequence.length} lessons)`);
    }
  }

  console.log(`🎉 Successfully built ${generatedCount} pronunciation roadmaps containing ${totalSequenceItems} total lesson items.`);
}

if (require.main === module) {
  buildPronunciationRoadmaps();
}

module.exports = { buildPronunciationRoadmaps };
