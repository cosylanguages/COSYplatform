import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * COSYplatform Link Integrity Checker (scripts/check-links.mjs)
 *
 * Verifies links in lesson JSON files against COSYdata and COSYmanuals:
 * 1. links.vocabulary IDs resolved against COSYdata's vocabulary index
 *    (fetched from https://raw.githubusercontent.com/cosylanguages/COSYdata/main/vocabulary/en/index.json or flat-index.json, cached locally in .cache/)
 * 2. links.grammar.manual_url returning HTTP 200 against COSYmanuals
 * 3. links.communication IDs resolved against COSYdata's functional-phrases index
 *    (fetched from https://raw.githubusercontent.com/cosylanguages/COSYdata/main/functional-phrases/en/index.json, cached locally in .cache/)
 */

const CACHE_DIR = path.join(process.cwd(), '.cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'COSYplatform-LinkChecker' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout fetching URL')); });
  });
}

const urlStatusCache = new Map();

function checkUrlStatus(url) {
  if (urlStatusCache.has(url)) {
    return urlStatusCache.get(url);
  }
  const promise = new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'COSYplatform-LinkChecker' } }, (res) => {
      res.resume();
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return checkUrlStatus(res.headers.location).then(resolve);
      }
      resolve(res.statusCode);
    });
    req.on('error', () => {
      const getReq = https.get(url, { headers: { 'User-Agent': 'COSYplatform-LinkChecker' } }, (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      getReq.on('error', () => resolve(500));
      getReq.setTimeout(5000, () => { getReq.destroy(); resolve(408); });
    });
    req.setTimeout(5000, () => { req.destroy(); resolve(408); });
    req.end();
  });
  urlStatusCache.set(url, promise);
  return promise;
}

async function getOrFetchJson(url, cacheFilename) {
  const cachePath = path.join(CACHE_DIR, cacheFilename);
  try {
    console.log(`Fetching remote index: ${url}`);
    const res = await fetchUrl(url);
    if (res.statusCode === 200) {
      fs.writeFileSync(cachePath, res.body, 'utf8');
      return JSON.parse(res.body);
    }
  } catch (err) {
    console.warn(`Warning: Could not fetch ${url} directly (${err.message}). Trying cache...`);
  }

  if (fs.existsSync(cachePath)) {
    console.log(`Using cached index from ${cachePath}`);
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
  return {};
}

function getAllLessonFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllLessonFiles(filePath));
    } else if (file.endsWith('.json') && !file.startsWith('_')) {
      results.push(filePath);
    }
  });
  return results;
}

async function main() {
  console.log('--- COSYplatform Link Integrity Checker ---');
  console.log('Index Strategy: Fetching remote indexes from COSYdata GitHub repository with fallback to local cache in .cache/\n');

  const vocabIndexUrl = 'https://raw.githubusercontent.com/cosylanguages/COSYdata/main/vocabulary/en/index.json';
  const phrasesIndexUrl = 'https://raw.githubusercontent.com/cosylanguages/COSYdata/main/functional-phrases/en/index.json';

  const vocabIndex = await getOrFetchJson(vocabIndexUrl, 'vocab_en_index.json');
  const phrasesIndex = await getOrFetchJson(phrasesIndexUrl, 'phrases_en_index.json');

  // Build sets of valid keys
  const validVocabKeys = new Set(Object.keys(vocabIndex));
  const validVocabWords = new Set();
  for (const k of validVocabKeys) {
    const parts = k.split(':');
    if (parts.length >= 2) {
      validVocabWords.add(parts[1].toLowerCase());
    }
  }

  const validPhraseKeys = new Set(Object.keys(phrasesIndex));
  const validPhraseShorts = new Set();
  for (const k of validPhraseKeys) {
    const parts = k.split(':');
    if (parts.length >= 4) {
      validPhraseShorts.add(parts[3].toLowerCase());
    }
  }

  const lessonFiles = getAllLessonFiles('lessons');
  console.log(`Scanning ${lessonFiles.length} lesson file(s)...`);

  const reports = [];
  let totalChecked = 0;
  let totalBroken = 0;

  for (const file of lessonFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!content.links) continue;

    const relPath = path.relative(process.cwd(), file);
    const issues = [];

    // 1. Vocabulary links
    if (Array.isArray(content.links.vocabulary)) {
      for (const vId of content.links.vocabulary) {
        totalChecked++;
        const norm = vId.toLowerCase().replace(/_/g, '-');
        const isValid = validVocabKeys.has(vId) ||
                        validVocabWords.has(vId.toLowerCase()) ||
                        validVocabWords.has(norm) ||
                        validVocabWords.has(vId.toLowerCase().replace(/_/g, ' '));

        if (!isValid) {
          issues.push({ type: 'Vocabulary', id: vId, reason: 'ID or word not resolved in COSYdata vocabulary index' });
          totalBroken++;
        }
      }
    }

    // 2. Grammar manual_url links
    if (Array.isArray(content.links.grammar)) {
      for (const gItem of content.links.grammar) {
        if (gItem.manual_url) {
          totalChecked++;
          const status = await checkUrlStatus(gItem.manual_url);
          if (status !== 200) {
            issues.push({ type: 'Grammar URL', id: gItem.manual_url, reason: `HTTP status ${status} (expected 200)` });
            totalBroken++;
          }
        }
      }
    }

    // 3. Communication links
    if (Array.isArray(content.links.communication)) {
      for (const cItem of content.links.communication) {
        const cId = typeof cItem === 'object' && cItem !== null ? cItem.phrase_id : cItem;
        if (cId) {
          totalChecked++;
          const norm = cId.toLowerCase();
          const isValid = validPhraseKeys.has(cId) ||
                          validPhraseShorts.has(norm) ||
                          validPhraseKeys.has(`en:general:${cId}`) ||
                          validPhraseShorts.has(cId.replace(/^phr_/, '').replace(/_\d+$/, ''));

          if (!isValid) {
            issues.push({ type: 'Communication Phrase ID', id: cId, reason: 'ID not resolved in COSYdata functional-phrases index' });
            totalBroken++;
          }
        }

        if (typeof cItem === 'object' && cItem !== null && cItem.manual_url) {
          totalChecked++;
          const status = await checkUrlStatus(cItem.manual_url);
          if (status !== 200) {
            issues.push({ type: 'Communication Manual URL', id: cItem.manual_url, reason: `HTTP status ${status} (expected 200)` });
            totalBroken++;
          }
        }
      }
    }

    if (issues.length > 0) {
      reports.push({ file: relPath, issues });
    }
  }

  // Generate Markdown report
  const osReportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(osReportsDir)) {
    fs.mkdirSync(osReportsDir, { recursive: true });
  }

  const reportPath = path.join(osReportsDir, 'link-integrity-report.md');
  let md = '# COSYplatform Link Integrity Report\n\n';
  md += `**Index Resolution Strategy:** Remote index fetched from COSYdata GitHub repository (\`https://raw.githubusercontent.com/cosylanguages/COSYdata/main/\`) with local fallback to \`.cache/\`.\n\n`;
  md += `**Summary:** Checked ${totalChecked} total link references across ${lessonFiles.length} lesson files. Found **${totalBroken} broken reference(s)**.\n\n`;

  if (reports.length === 0) {
    md += '✅ **All-Clear:** All vocabulary IDs, grammar manual URLs, and functional communication phrase IDs resolve successfully!\n';
    console.log('\n✅ All links verified successfully! Zero broken references found.');
  } else {
    md += '## Identified Link Issues\n\n';
    for (const r of reports) {
      md += `### \`${r.file}\`\n`;
      for (const iss of r.issues) {
        md += `- **[${iss.type}]** \`${iss.id}\`: ${iss.reason}\n`;
      }
      md += '\n';
    }
    console.warn(`\n⚠️ Found ${totalBroken} link issue(s) across ${reports.length} lesson file(s). See ${reportPath}`);
  }

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`Report written to ${reportPath}`);

  if (totalBroken > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error running check-links:', err);
  process.exit(1);
});
