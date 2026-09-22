import { chromium } from 'playwright';
import { createServer } from 'http';
import serveHandler from 'serve-handler';
import fs from 'fs';
import path from 'path';

async function run() {
  const outputDir = path.join(process.cwd(), 'reports', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const server = createServer((req, res) => serveHandler(req, res, { public: '.' }));
  await new Promise(resolve => server.listen(8085, resolve));
  console.log('Local server running on http://localhost:8085');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Test 1: Teacher View Edvibe Layout
  const teacherUrl = 'http://localhost:8085/teacher.html?key=demo-teacher-1&lesson=lessons/general-english-a0/ge-a0-u1-l1.json';
  console.log('Navigating to:', teacherUrl);
  await page.goto(teacherUrl, { waitUntil: 'networkidle' });

  await page.screenshot({ path: path.join(outputDir, 'teacher_edvibe_layout.png') });

  // Click Dictionary icon in left utility rail
  console.log('Testing Dictionary Tool...');
  await page.click('button[title="COSYdata Dictionary"]');
  await page.fill('#dictSearchInput', 'mother');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'teacher_dict_search_mother.png') });

  // Click Irregular Verbs icon
  console.log('Testing Irregular Verbs Tool...');
  await page.click('button[title="Irregular Verbs"]');
  await page.fill('#verbSearchInput', 'go');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'teacher_irregular_verbs_go.png') });

  // Click Timer icon
  console.log('Testing Timer Tool...');
  await page.click('button[title="Lesson Timer"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'teacher_timer_widget.png') });

  // Test 2: Student View Edvibe Layout
  const studentUrl = 'http://localhost:8085/student.html?key=demo-student-1&lesson=lessons/general-english-a0/ge-a0-u1-l1.json';
  console.log('Navigating to:', studentUrl);
  await page.goto(studentUrl, { waitUntil: 'networkidle' });

  await page.screenshot({ path: path.join(outputDir, 'student_edvibe_layout.png') });

  // Click Dictionary in Student View
  await page.click('button[title="COSYdata Dictionary"]');
  await page.fill('#dictSearchInput', 'family');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'student_dict_search_family.png') });

  await browser.close();
  server.close();
  console.log('Playwright UI verification complete. Screenshots saved to:', outputDir);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
