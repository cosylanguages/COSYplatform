import { test, expect } from '@playwright/test';
import { createServer } from 'http';
import serveHandler from 'serve-handler';

let server;

test.beforeAll(async () => {
  server = createServer((req, res) => serveHandler(req, res, { public: '.' }));
  await new Promise(resolve => server.listen(8085, resolve));
});

test.afterAll(async () => {
  if (server) server.close();
});

test('Teacher and Student Edvibe Workspace Verification', async ({ page }) => {
  // 1. Teacher View
  const teacherUrl = 'http://localhost:8085/teacher.html?key=demo-teacher-1&lesson=lessons/general-english-a0/ge-a0-u1-l1.json';
  await page.goto(teacherUrl, { waitUntil: 'networkidle' });

  await page.screenshot({ path: 'reports/screenshots/teacher_edvibe_layout.png' });

  // Test Dictionary Lookup
  await page.click('button[title="COSYdata Dictionary"]');
  await page.fill('#dictSearchInput', 'mother');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'reports/screenshots/teacher_dict_search_mother.png' });

  // Test Irregular Verbs Lookup
  await page.click('button[title="Irregular Verbs"]');
  await page.fill('#verbSearchInput', 'go');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'reports/screenshots/teacher_irregular_verbs_go.png' });

  // Test Timer
  await page.click('button[title="Lesson Timer"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'reports/screenshots/teacher_timer_widget.png' });

  // 2. Student View
  const studentUrl = 'http://localhost:8085/student.html?key=demo-student-1&lesson=lessons/general-english-a0/ge-a0-u1-l1.json';
  await page.goto(studentUrl, { waitUntil: 'networkidle' });

  await page.screenshot({ path: 'reports/screenshots/student_edvibe_layout.png' });

  // Test Student Dictionary Lookup
  await page.click('button[title="COSYdata Dictionary"]');
  await page.fill('#dictSearchInput', 'family');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'reports/screenshots/student_dict_search_family.png' });
});
