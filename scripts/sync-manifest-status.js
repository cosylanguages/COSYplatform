const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const AUTH_GUARD_PATH = path.join(ROOT_DIR, 'shared', 'js', 'auth-guard.js');

const DUPLICATE_IDS_TO_REMOVE_FROM_GENERAL = new Set([
  'spoken-en-a1',
  'spoken-en-a2',
  'spoken-en-b1',
  'spoken-en-b2',
  'spoken-en-c1'
]);

const SPOKEN_TITLES = {
  'spoken-en-a1': 'Spoken English A1 - Elementary',
  'spoken-en-a2': 'Spoken English A2 - Pre-Intermediate',
  'spoken-en-b1': 'Spoken English B1 - Intermediate',
  'spoken-en-b2': 'Spoken English B2 - Upper-Intermediate',
  'spoken-en-c1': 'Spoken English C1 - Advanced'
};

const CINEMA_ENTRIES = [
  { id: 'cinema-en-a1', title: 'Cinema Club English A1', track: 'Cinema', lang: 'en', level: 'a1' },
  { id: 'cinema-en-a2', title: 'Cinema Club English A2', track: 'Cinema', lang: 'en', level: 'a2' },
  { id: 'cinema-en-b1', title: 'Cinema Club English B1', track: 'Cinema', lang: 'en', level: 'b1' },
  { id: 'cinema-en-b2', title: 'Cinema Club English B2', track: 'Cinema', lang: 'en', level: 'b2' },
  { id: 'cinema-en-c1', title: 'Cinema Club English C1', track: 'Cinema', lang: 'en', level: 'c1' },
  { id: 'cinema-en-c2', title: 'Cinema Club English C2', track: 'Cinema', lang: 'en', level: 'c2' }
];

function isCourseAvailable(courseId) {
  const roadmapPath = path.join(ROOT_DIR, 'roadmaps', `${courseId}.json`);
  if (!fs.existsSync(roadmapPath)) {
    return false;
  }
  try {
    const content = fs.readFileSync(roadmapPath, 'utf8');
    const data = JSON.parse(content);
    const sequence = Array.isArray(data.sequence) ? data.sequence : [];
    return sequence.some(item => {
      if (!item.lessonFile) return false;
      const lessonPath = path.join(ROOT_DIR, item.lessonFile);
      return fs.existsSync(lessonPath);
    });
  } catch (e) {
    return false;
  }
}

function processManifest(rawEntries) {
  // 1. Data cleanup
  // Remove duplicate entries with track "General"
  let cleaned = rawEntries.filter(entry => {
    if (entry.track === 'General' && DUPLICATE_IDS_TO_REMOVE_FROM_GENERAL.has(entry.id)) {
      return false;
    }
    return true;
  });

  // Update titles for Spoken track
  cleaned = cleaned.map(entry => {
    if (entry.track === 'Spoken' && SPOKEN_TITLES[entry.id]) {
      return { ...entry, title: SPOKEN_TITLES[entry.id] };
    }
    return entry;
  });

  // Add cinema entries if missing
  const existingIds = new Set(cleaned.map(e => e.id));
  for (const cinemaEntry of CINEMA_ENTRIES) {
    if (!existingIds.has(cinemaEntry.id)) {
      cleaned.push({ ...cinemaEntry });
    }
  }

  // 2. Status calculation
  const updated = cleaned.map(entry => {
    const available = isCourseAvailable(entry.id);
    const newEntry = { ...entry };
    if (available) {
      delete newEntry.status;
    } else {
      newEntry.status = 'not_yet_available';
    }
    return newEntry;
  });

  return updated;
}

function formatManifestArray(entries) {
  const lines = entries.map(entry => {
    // Preserve standard key order: id, title, track, lang, level, [status]
    const obj = {};
    obj.id = entry.id;
    obj.title = entry.title;
    obj.track = entry.track;
    obj.lang = entry.lang;
    obj.level = entry.level;
    if (entry.status) {
      obj.status = entry.status;
    }
    return '  ' + JSON.stringify(obj);
  });
  return 'window.CosyAuth.FULL_MANIFEST = [\n' + lines.join(',\n') + '\n];';
}

function main() {
  const isCheckMode = process.argv.includes('--check');

  if (!fs.existsSync(AUTH_GUARD_PATH)) {
    console.error(`Error: ${AUTH_GUARD_PATH} does not exist.`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(AUTH_GUARD_PATH, 'utf8');

  const startMarker = 'window.CosyAuth.FULL_MANIFEST = [';
  const startIdx = fileContent.indexOf(startMarker);
  if (startIdx === -1) {
    console.error('Error: Could not find window.CosyAuth.FULL_MANIFEST in auth-guard.js');
    process.exit(1);
  }

  const endIdx = fileContent.indexOf('];', startIdx);
  if (endIdx === -1) {
    console.error('Error: Could not find end of FULL_MANIFEST array in auth-guard.js');
    process.exit(1);
  }

  const jsonSlice = fileContent.substring(startIdx + startMarker.length - 1, endIdx + 1);
  let currentEntries = [];
  try {
    currentEntries = JSON.parse(jsonSlice);
  } catch (err) {
    console.error('Error parsing current FULL_MANIFEST array:', err);
    process.exit(1);
  }

  const updatedEntries = processManifest(currentEntries);
  const newManifestBlock = formatManifestArray(updatedEntries);

  const updatedFileContent = fileContent.substring(0, startIdx) + newManifestBlock + fileContent.substring(endIdx + 2);

  // Compute metrics
  const totalEntries = updatedEntries.length;
  const uniqueIds = new Set(updatedEntries.map(e => e.id)).size;
  const availableCount = updatedEntries.filter(e => !e.status || e.status === 'available').length;
  const notAvailableCount = updatedEntries.filter(e => e.status === 'not_yet_available').length;

  if (isCheckMode) {
    if (fileContent.trim() !== updatedFileContent.trim()) {
      console.error('❌ FULL_MANIFEST in shared/js/auth-guard.js is out of sync with roadmap/lesson status or cleanup rules.');
      console.error('Mismatches found. Run `npm run sync:manifest` to update shared/js/auth-guard.js.');
      process.exit(1);
    } else {
      console.log('✅ FULL_MANIFEST check passed. Manifest is up-to-date.');
      console.log(`Total entries: ${totalEntries}, Unique IDs: ${uniqueIds}, Available: ${availableCount}, Not yet available: ${notAvailableCount}`);
      process.exit(0);
    }
  } else {
    fs.writeFileSync(AUTH_GUARD_PATH, updatedFileContent, 'utf8');
    console.log('✅ Updated FULL_MANIFEST in shared/js/auth-guard.js successfully.');
    console.log(`Total entries: ${totalEntries}`);
    console.log(`Unique IDs: ${uniqueIds}`);
    console.log(`Available: ${availableCount}`);
    console.log(`Not yet available: ${notAvailableCount}`);
  }
}

main();
