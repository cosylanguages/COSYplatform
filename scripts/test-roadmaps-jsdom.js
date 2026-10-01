const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function runRoadmapJsdomTests() {
  console.log('🧪 Starting JSDOM Roadmap Integration Tests...');

  const studentHtmlPath = path.join(__dirname, '..', 'student.html');
  const studentHtmlContent = fs.readFileSync(studentHtmlPath, 'utf8');

  // Extract inline script from student.html
  const scriptMatch = studentHtmlContent.match(/<script>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) {
    throw new Error('Could not find main inline <script> in student.html');
  }
  const studentInlineScript = scriptMatch[1];

  const lessonResolverPath = path.join(__dirname, '..', 'shared', 'js', 'lesson-resolver.js');
  const lessonResolverCode = fs.readFileSync(lessonResolverPath, 'utf8');

  const roadmapsDir = path.join(__dirname, '..', 'roadmaps');
  const roadmapFiles = fs.readdirSync(roadmapsDir).filter(f => f.endsWith('.json'));

  console.log(`📂 Found ${roadmapFiles.length} roadmap files to test.`);

  let totalAvailableLinksTested = 0;
  let totalPlannedItemsTested = 0;
  let passedRoadmaps = 0;

  for (const file of roadmapFiles) {
    const courseId = path.basename(file, '.json');
    const roadmapFilePath = path.join(roadmapsDir, file);
    const roadmapData = JSON.parse(fs.readFileSync(roadmapFilePath, 'utf8'));

    // Create JSDOM instance for student.html without running external script tags
    const dom = new JSDOM(studentHtmlContent, {
      url: `http://localhost/student.html?course=${courseId}`,
      runScripts: 'outside-only'
    });

    const { window } = dom;

    // Execute CosyLessons in window context
    window.eval(lessonResolverCode);

    // Mock window.CosyAuth
    window.CosyAuth = {
      requireRole: async () => ({
        user: { email: 'test@cosylanguages.com' },
        profile: { role: 'student', language_access: ['all'], course_level: 'all' }
      }),
      FULL_MANIFEST: []
    };

    // Mock window.fetch to return local files
    window.fetch = async (url) => {
      const cleanUrl = url.split('?')[0];
      const localPath = path.join(__dirname, '..', cleanUrl);
      if (fs.existsSync(localPath)) {
        const fileContent = fs.readFileSync(localPath, 'utf8');
        return {
          ok: true,
          text: async () => fileContent,
          json: async () => JSON.parse(fileContent)
        };
      }
      return { ok: false, status: 404 };
    };

    // Execute student.html inline script
    window.eval(studentInlineScript);

    // Call renderCourseRoadmap in window context
    await window.renderCourseRoadmap(courseId, 'a1', window.CosyAuth.profile);

    const document = window.document;
    const cards = document.querySelectorAll('.unit-card');

    if (cards.length !== roadmapData.sequence.length) {
      throw new Error(`[${file}] Card count mismatch: rendered ${cards.length}, expected ${roadmapData.sequence.length}`);
    }

    roadmapData.sequence.forEach((item, idx) => {
      const card = cards[idx];
      const state = window.CosyLessons.getLessonState(item, 'student');

      if (state === 'available') {
        const link = card.querySelector('a');
        if (!link) {
          throw new Error(`[${file}] Available lesson #${item.lessonNumber} (${item.id}) is missing <a> link.`);
        }

        const href = link.getAttribute('href');
        if (!href) {
          throw new Error(`[${file}] Lesson #${item.lessonNumber} link is missing href attribute.`);
        }

        // Parse lesson path from href
        const hrefUrl = new URL(href, 'http://localhost/student.html');
        const lessonPathParam = hrefUrl.searchParams.get('lesson');

        if (!lessonPathParam) {
          throw new Error(`[${file}] Lesson #${item.lessonNumber} href link missing 'lesson' query param: ${href}`);
        }

        const resolvedOnDisk = path.join(__dirname, '..', lessonPathParam);
        if (!fs.existsSync(resolvedOnDisk)) {
          throw new Error(`[${file}] Lesson #${item.lessonNumber} link points to non-existent file on disk: ${lessonPathParam}`);
        }

        totalAvailableLinksTested++;
      } else if (state === 'teacher-led') {
        const link = card.querySelector('a');
        if (link) {
          throw new Error(`[${file}] Teacher-led lesson #${item.lessonNumber} (${item.id}) should NOT have an <a> link, but found: ${link.outerHTML}`);
        }

        const textContent = card.textContent;
        if (!textContent.includes('Taught live with your teacher')) {
          throw new Error(`[${file}] Teacher-led lesson #${item.lessonNumber} (${item.id}) missing 'Taught live with your teacher' label.`);
        }
      } else {
        const link = card.querySelector('a');
        if (link) {
          throw new Error(`[${file}] Planned lesson #${item.lessonNumber} (${item.id}) should NOT have an <a> link, but found: ${link.outerHTML}`);
        }

        const textContent = card.textContent;
        if (!textContent.includes('Planned')) {
          throw new Error(`[${file}] Planned lesson #${item.lessonNumber} (${item.id}) missing 'Planned' label.`);
        }

        totalPlannedItemsTested++;
      }
    });

    passedRoadmaps++;
  }

  console.log(`✅ All ${passedRoadmaps} roadmaps passed JSDOM verification!`);
  console.log(`   - Verified ${totalAvailableLinksTested} available lesson links (all exist on disk).`);
  console.log(`   - Verified ${totalPlannedItemsTested} planned items (none have <a> links).`);
}

runRoadmapJsdomTests().catch(err => {
  console.error('❌ JSDOM Roadmap Test Failed:', err);
  process.exit(1);
});
