/**
 * Public Preview Roadmap Stripper (Dry Run Only)
 *
 * Demonstrates how roadmaps/*.json are sanitized for public preview:
 * - Retains: title, level/CEFR, summary/description, unit names, sequence numbers, titles, milestone/exam flags.
 * - Removes: lessonFile paths, discussion prompts, prompts, internal teacher notes, answer keys.
 *
 * NOTE: This tool operates in DRY RUN mode ONLY and DOES NOT MODIFY files.
 */

const fs = require('fs');
const path = require('path');

const ROADMAPS_DIR = path.join(__dirname, '../roadmaps');

const ALLOWED_PREVIEW_KEYS_ROOT = [
  'curriculumId', 'title', 'totalLessons', 'language', 'cefr', 'courseType', 'description', 'sequence'
];

const ALLOWED_PREVIEW_KEYS_SEQUENCE = [
  'lessonNumber', 'id', 'title', 'section', 'unit', 'isOptional', 'isMilestone', 'isExam', 'teacherLed', 'status', 'ageRestriction'
];

function stripToPublicPreview(roadmapData) {
  const removedFieldsMap = {};

  const cleanRoadmap = {};

  Object.keys(roadmapData).forEach(key => {
    if (ALLOWED_PREVIEW_KEYS_ROOT.includes(key)) {
      if (key === 'sequence' && Array.isArray(roadmapData.sequence)) {
        cleanRoadmap.sequence = roadmapData.sequence.map(item => {
          const cleanItem = {};
          Object.keys(item).forEach(itemKey => {
            if (ALLOWED_PREVIEW_KEYS_SEQUENCE.includes(itemKey)) {
              cleanItem[itemKey] = item[itemKey];
            } else {
              removedFieldsMap[itemKey] = (removedFieldsMap[itemKey] || 0) + 1;
            }
          });
          return cleanItem;
        });
      } else {
        cleanRoadmap[key] = roadmapData[key];
      }
    } else {
      removedFieldsMap[key] = (removedFieldsMap[key] || 0) + 1;
    }
  });

  return { cleanRoadmap, removedFieldsMap };
}

function runPreviewStripper() {
  console.log('=== Public Preview Roadmap Stripper (DRY RUN ONLY) ===');
  console.log('Scanning all files in roadmaps/*.json...\n');

  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json'));

  let totalRemovedFieldsCount = 0;
  const globalRemovedFields = {};

  files.forEach(f => {
    const filePath = path.join(ROADMAPS_DIR, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const roadmapData = JSON.parse(content);

    const { cleanRoadmap, removedFieldsMap } = stripToPublicPreview(roadmapData);

    const removedKeys = Object.keys(removedFieldsMap);
    if (removedKeys.length > 0) {
      console.log(`File: roadmaps/${f}`);
      console.log(`  - Public preview sequence items: ${cleanRoadmap.sequence ? cleanRoadmap.sequence.length : 0}`);
      console.log('  - Fields removed:');
      removedKeys.forEach(rk => {
        console.log(`      * "${rk}": ${removedFieldsMap[rk]} occurrence(s)`);
        globalRemovedFields[rk] = (globalRemovedFields[rk] || 0) + removedFieldsMap[rk];
        totalRemovedFieldsCount += removedFieldsMap[rk];
      });
      console.log('');
    }
  });

  console.log('=== GLOBAL STRIPPING SUMMARY ===');
  console.log(`- Total roadmaps analyzed: ${files.length}`);
  console.log(`- Total non-preview fields identified for stripping: ${totalRemovedFieldsCount}`);
  if (Object.keys(globalRemovedFields).length > 0) {
    console.log('- Field removal breakdown:');
    for (const [k, count] of Object.entries(globalRemovedFields)) {
      console.log(`    * "${k}": ${count} total occurrences removed`);
    }
  } else {
    console.log('All roadmaps are already 100% clean public preview metadata!');
  }

  console.log('\n[Dry Run Complete] Zero files modified on disk.');
}

if (require.main === module) {
  runPreviewStripper();
}

module.exports = { stripToPublicPreview, runPreviewStripper };
