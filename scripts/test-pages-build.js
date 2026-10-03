const fs = require('fs');
const path = require('path');
const { buildPagesSite, ALLOWED_ROOT_FILES } = require('./build-pages-site');

const ROOT_DIR = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, '.pages-site');

const SHIPPED_HTML_FILES = [
  'index.html',
  'login.html',
  'hub.html',
  'student.html',
  'teacher.html',
  'founder.html',
  'classroom.html',
  'teacher-english.html',
  'teacher-french.html',
  'teacher-russian.html',
  '404.html'
];

const FORBIDDEN_NAMES = [
  'docs',
  'drafts',
  'scripts',
  'supabase',
  'schemas',
  'fixtures',
  'templates',
  'reports',
  'lessons',
  'manuals',
  'activities',
  'student-workbooks',
  'teacher-guides',
  'reference',
  'test-results',
  'package.json',
  'package-lock.json',
  'robots.txt'
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function getSharedJsFiles(dirPath) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;
  const list = fs.readdirSync(dirPath);
  list.forEach(file => {
    const full = path.join(dirPath, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSharedJsFiles(full));
    } else if (file.endsWith('.js')) {
      results.push(full);
    }
  });
  return results;
}

function runTestPagesBuild() {
  console.log('🔨 Assembling .pages-site...');
  buildPagesSite();

  console.log('🧪 Asserting (a) forbidden items do not exist in .pages-site...');
  const allSiteFiles = getAllFiles(PAGES_DIR);

  for (const file of allSiteFiles) {
    const rel = path.relative(PAGES_DIR, file).replace(/\\/g, '/');
    const parts = rel.split('/');

    // Assert no *.md files
    if (rel.endsWith('.md')) {
      console.error(`❌ Forbidden markdown file found in .pages-site: ${rel}`);
      process.exit(1);
    }

    // Assert no package*.json files
    if (path.basename(file).startsWith('package') && path.basename(file).endsWith('.json')) {
      console.error(`❌ Forbidden package file found in .pages-site: ${rel}`);
      process.exit(1);
    }

    // Assert no forbidden folder or filename in path
    for (const forbidden of FORBIDDEN_NAMES) {
      if (parts.includes(forbidden) || rel === forbidden) {
        console.error(`❌ Forbidden item found in .pages-site: ${rel} (matches ${forbidden})`);
        process.exit(1);
      }
    }
  }
  console.log('✅ Assertion (a) passed: No forbidden items found in .pages-site.');

  console.log('🧪 Asserting (b) local href/src and literal fetch(...) paths exist inside .pages-site...');

  const sharedJsFiles = getSharedJsFiles(path.join(ROOT_DIR, 'shared/js'));
  const filesToScan = [...SHIPPED_HTML_FILES, ...sharedJsFiles.map(f => path.relative(ROOT_DIR, f).replace(/\\/g, '/'))];

  const missingPaths = new Set();
  const checkedPaths = new Set();

  filesToScan.forEach(fileRel => {
    const sourceFile = path.join(ROOT_DIR, fileRel);
    if (!fs.existsSync(sourceFile)) {
      missingPaths.add(`${fileRel} (Source file missing in repo)`);
      return;
    }

    const content = fs.readFileSync(sourceFile, 'utf8');

    // Extract href="..." / href='...'
    const hrefMatches = content.matchAll(/\bhref=[\"']([^\"']+)[\"']/g);
    for (const m of hrefMatches) checkReference(m[1], fileRel);

    // Extract src="..." / src='...'
    const srcMatches = content.matchAll(/\bsrc=[\"']([^\"']+)[\"']/g);
    for (const m of srcMatches) checkReference(m[1], fileRel);

    // Extract literal fetch('...') or fetch("...")
    const fetchMatches = content.matchAll(/\bfetch\(\s*[\"']([^\"']+)[\"']/g);
    for (const m of fetchMatches) checkReference(m[1], fileRel);
  });

  function checkReference(rawRef, sourceFile) {
    let ref = rawRef.trim();

    // Ignore template literal expressions, external URLs, hashes, or non-paths
    if (
      !ref ||
      ref.includes('${') ||
      ref.startsWith('#') ||
      ref.startsWith('http://') ||
      ref.startsWith('https://') ||
      ref.startsWith('//') ||
      ref.startsWith('mailto:') ||
      ref.startsWith('data:') ||
      ref.startsWith('javascript:')
    ) {
      return;
    }

    // Strip query string and anchor
    ref = ref.split('?')[0].split('#')[0];
    if (!ref) return;

    // Resolve target file path relative to the source file location in .pages-site,
    // or relative to site root if referenced from shared JS files for root HTML rendering.
    let targetFile;
    if (sourceFile.startsWith('shared/')) {
      targetFile = path.resolve(PAGES_DIR, ref);
    } else {
      const sourceDir = path.dirname(path.join(PAGES_DIR, sourceFile));
      targetFile = path.resolve(sourceDir, ref);
    }

    checkedPaths.add(path.relative(PAGES_DIR, targetFile));

    if (!fs.existsSync(targetFile)) {
      missingPaths.add(`Referenced '${rawRef}' in '${sourceFile}' -> target file missing: .pages-site/${path.relative(PAGES_DIR, targetFile)}`);
    }
  }

  if (missingPaths.size > 0) {
    console.error('❌ Assertion (b) failed! Missing referenced paths in .pages-site:');
    missingPaths.forEach(p => console.error(`  - ${p}`));
    process.exit(1);
  }

  console.log(`✅ Assertion (b) passed: Checked ${checkedPaths.size} referenced paths in .pages-site.`);

  console.log('🧪 Asserting (c) root HTML metadata and 404.html exist in .pages-site...');

  // Assert 404.html specifically exists in .pages-site
  if (!fs.existsSync(path.join(PAGES_DIR, '404.html'))) {
    console.error('❌ Assertion (c) failed: 404.html does not exist in .pages-site');
    process.exit(1);
  }

  const descriptions = new Set();

  for (const pageName of SHIPPED_HTML_FILES) {
    const siteFilePath = path.join(PAGES_DIR, pageName);
    if (!fs.existsSync(siteFilePath)) {
      console.error(`❌ Assertion (c) failed: Shipped HTML file missing in .pages-site: ${pageName}`);
      process.exit(1);
    }

    const content = fs.readFileSync(siteFilePath, 'utf8');

    // 1. lang="en"
    if (!/<html[^>]*lang=[\"']en[\"']/i.test(content)) {
      console.error(`❌ Assertion (c) failed in ${pageName}: <html> tag missing lang="en"`);
      process.exit(1);
    }

    // 2. <title> ends with " · COSYlanguages"
    const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim().endsWith(' · COSYlanguages')) {
      console.error(`❌ Assertion (c) failed in ${pageName}: <title> must end with ' · COSYlanguages' (found '${titleMatch ? titleMatch[1] : 'none'}')`);
      process.exit(1);
    }

    // 3. Non-empty, unique description
    const descMatch = content.match(/<meta\s+name=[\"']description[\"']\s+content=[\"']([^\"']+)[\"']/i);
    if (!descMatch || !descMatch[1].trim()) {
      console.error(`❌ Assertion (c) failed in ${pageName}: Missing or empty <meta name="description">`);
      process.exit(1);
    }
    const descText = descMatch[1].trim();
    if (descriptions.has(descText)) {
      console.error(`❌ Assertion (c) failed in ${pageName}: Duplicate <meta name="description">: '${descText}'`);
      process.exit(1);
    }
    descriptions.add(descText);

    // 4. robots noindex
    const robotsMatch = content.match(/<meta\s+name=[\"']robots[\"']\s+content=[\"']([^\"']+)[\"']/i);
    if (!robotsMatch || !robotsMatch[1].toLowerCase().includes('noindex')) {
      console.error(`❌ Assertion (c) failed in ${pageName}: Missing or non-noindex <meta name="robots">`);
      process.exit(1);
    }

    // 5. favicon link present (static link or dynamic JS favicon injection in 404.html)
    if (!/<link\s+[^>]*rel=[\"']icon[\"']/i.test(content) && !content.includes('favicon.svg')) {
      console.error(`❌ Assertion (c) failed in ${pageName}: Missing favicon link`);
      process.exit(1);
    }
  }

  console.log('✅ Assertion (c) passed: All shipped root HTML pages have valid lang="en", title, unique description, noindex, and favicon link.');
  console.log('🎉 All .pages-site build tests passed!');
}

if (require.main === module) {
  runTestPagesBuild();
}

module.exports = { runTestPagesBuild };
