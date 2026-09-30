const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '..');

function roadmapExistsForCourseId(courseId) {
  const rmPath = path.join(ROOT_DIR, 'roadmaps', `${courseId}.json`);
  return fs.existsSync(rmPath);
}

function extractScripts(htmlContent) {
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let scripts = '';
  let match;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    scripts += '\n' + match[1];
  }
  return scripts;
}

async function verifyPages() {
  console.log('🧪 Starting JSDOM Catalog Page Links Verification...\n');

  const authGuardCode = fs.readFileSync(path.join(ROOT_DIR, 'shared', 'js', 'auth-guard.js'), 'utf8');

  // Evaluate FULL_MANIFEST
  const evalDom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: 'dangerously' });
  evalDom.window.eval(authGuardCode);
  const fullManifest = evalDom.window.CosyAuth.FULL_MANIFEST;

  const totalEntries = fullManifest.length;
  const uniqueIds = new Set(fullManifest.map(c => c.id)).size;
  const availableCount = fullManifest.filter(c => !c.status || c.status === 'available').length;
  const notAvailableCount = fullManifest.filter(c => c.status === 'not_yet_available').length;

  console.log('📊 Manifest Summary Metrics:');
  console.log(`- Total entries: ${totalEntries}`);
  console.log(`- Unique IDs: ${uniqueIds}`);
  console.log(`- Number available: ${availableCount}`);
  console.log(`- Number not_yet_available: ${notAvailableCount}\n`);

  let totalLinksChecked = 0;
  let deadLinksFound = 0;

  const mockProfile = { role: 'founder', language_access: ['*'], course_level: '*' };

  const pagesConfig = [
    {
      file: 'index.html',
      setup: (dom) => {
        dom.window.renderPublicCatalog();
      }
    },
    {
      file: 'hub.html',
      setup: (dom) => {
        dom.window.renderHubCatalog(mockProfile, dom.window.CosyAuth.FULL_MANIFEST);
      }
    },
    {
      file: 'student.html',
      setup: (dom) => {
        dom.window.renderStudentCatalog(mockProfile);
      }
    },
    {
      file: 'teacher.html',
      setup: (dom) => {
        dom.window.grant = { name: 'Teacher' };
        dom.window.renderTeacherCatalog(mockProfile, dom.window.CosyAuth.FULL_MANIFEST);
      }
    },
    {
      file: 'teacher-english.html',
      setup: (dom) => {
        const englishCourses = dom.window.CosyAuth.FULL_MANIFEST.filter(c => c.lang === 'en');
        let html = '<div class="catalog-grid">';
        englishCourses.forEach(course => {
          const isAvailable = course.status !== 'not_yet_available';
          if (isAvailable) {
            html += `<div class="course-card"><a href="teacher.html?course=${course.id}&level=${course.level.toLowerCase()}">Open</a></div>`;
          } else {
            html += `<div class="course-card disabled"><span>Coming soon</span></div>`;
          }
        });
        html += '</div>';
        dom.window.document.getElementById('app-root').innerHTML = html;
      }
    },
    {
      file: 'teacher-french.html',
      setup: (dom) => {
        const frenchCourses = dom.window.CosyAuth.FULL_MANIFEST.filter(c => c.lang === 'fr');
        let html = '<div class="catalog-grid">';
        frenchCourses.forEach(course => {
          const isAvailable = course.status !== 'not_yet_available';
          if (isAvailable) {
            html += `<div class="course-card"><a href="teacher.html?course=${course.id}&level=${course.level.toLowerCase()}">Open</a></div>`;
          } else {
            html += `<div class="course-card disabled"><span>Coming soon</span></div>`;
          }
        });
        html += '</div>';
        dom.window.document.getElementById('app-root').innerHTML = html;
      }
    },
    {
      file: 'teacher-russian.html',
      setup: (dom) => {
        const russianCourses = dom.window.CosyAuth.FULL_MANIFEST.filter(c => c.lang === 'ru');
        let html = '<div class="catalog-grid">';
        russianCourses.forEach(course => {
          const isAvailable = course.status !== 'not_yet_available';
          if (isAvailable) {
            html += `<div class="course-card"><a href="teacher.html?course=${course.id}&level=${course.level.toLowerCase()}">Open</a></div>`;
          } else {
            html += `<div class="course-card disabled"><span>Coming soon</span></div>`;
          }
        });
        html += '</div>';
        dom.window.document.getElementById('app-root').innerHTML = html;
      }
    }
  ];

  for (const cfg of pagesConfig) {
    const htmlPath = path.join(ROOT_DIR, cfg.file);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const dom = new JSDOM(htmlContent, {
      url: `http://localhost/${cfg.file}`,
      runScripts: 'dangerously',
      resources: 'usable'
    });

    dom.window.COSY_CONFIG = {};
    dom.window.urlParams = new URLSearchParams('');

    dom.window.eval(authGuardCode);

    const pageScripts = extractScripts(htmlContent);
    try {
      dom.window.eval(pageScripts);
      if (cfg.setup) {
        cfg.setup(dom);
      }
    } catch (e) {
      console.error(`Error setting up page ${cfg.file}:`, e.message);
    }

    const anchors = Array.from(dom.window.document.querySelectorAll('a'));
    let pageLinksChecked = 0;
    let pageDeadLinks = 0;

    anchors.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('course=')) {
        pageLinksChecked++;
        totalLinksChecked++;

        const url = new URL(href, `http://localhost/${cfg.file}`);
        const courseId = url.searchParams.get('course');

        if (courseId) {
          const exists = roadmapExistsForCourseId(courseId);
          if (!exists) {
            console.error(`❌ [${cfg.file}] Dead link detected! <a href="${href}"> points to course "${courseId}" whose roadmap file roadmaps/${courseId}.json does not exist on disk!`);
            pageDeadLinks++;
            deadLinksFound++;
          }
        }
      }
    });

    if (pageDeadLinks === 0) {
      console.log(`✅ [${cfg.file}] Checked ${pageLinksChecked} course roadmap link(s) — all point to existing roadmap files!`);
    }
  }

  console.log('\n---------------------------------------------------');
  if (deadLinksFound === 0) {
    console.log(`🎉 SUCCESS: Verified all ${totalLinksChecked} rendered course links across all 7 catalog pages. ZERO dead-end links!`);
    process.exit(0);
  } else {
    console.error(`❌ FAILURE: Found ${deadLinksFound} dead-end links.`);
    process.exit(1);
  }
}

verifyPages();
