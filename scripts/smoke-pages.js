const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { startStaticServer } = require('./lib/static-server');

const ROOT_DIR = path.join(__dirname, '..');

const COMBINATIONS = [
  // Student role
  { role: 'student', url: 'student.html' },
  { role: 'student', url: 'student.html?course=general-en-a1' },
  { role: 'student', url: 'student.html?lesson=lessons/general-english-a1/nice-to-meet-you.json&course=general-en-a1' },

  // Teacher role
  { role: 'teacher', url: 'teacher.html' },
  { role: 'teacher', url: 'teacher.html?lang=en' },
  { role: 'teacher', url: 'teacher.html?lang=fr' },
  { role: 'teacher', url: 'teacher.html?lang=ru' },
  { role: 'teacher', url: 'teacher.html?course=general-en-a1' },
  { role: 'teacher', url: 'teacher-english.html' },
  { role: 'teacher', url: 'teacher-french.html' },
  { role: 'teacher', url: 'teacher-russian.html' },

  // Founder role
  { role: 'founder', url: 'founder.html' },
  { role: 'founder', url: 'teacher.html' },
  { role: 'founder', url: 'hub.html' },
  { role: 'founder', url: 'index.html' }
];

function getVisibleText(dom) {
  const doc = dom.window.document;
  const targetEl = doc.getElementById('app-root') || doc.querySelector('main');

  let text = '';
  if (targetEl) {
    const clone = targetEl.cloneNode(true);
    const scriptsAndStyles = clone.querySelectorAll('script, style');
    scriptsAndStyles.forEach(node => node.remove());
    text = clone.textContent || '';
  } else {
    const clone = doc.body.cloneNode(true);
    const scriptsAndStyles = clone.querySelectorAll('script, style');
    scriptsAndStyles.forEach(node => node.remove());
    text = clone.textContent || '';
  }

  return text.replace(/\s+/g, ' ').trim();
}

async function testCombination(port, { role, url }) {
  const parsedUrl = new URL(`http://127.0.0.1:${port}/${url}`);
  const htmlFileName = parsedUrl.pathname.replace(/^\//, '');
  const filePath = path.join(ROOT_DIR, htmlFileName);

  if (!fs.existsSync(filePath)) {
    return { pass: false, reason: `File not found on disk: ${htmlFileName}` };
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');

  let uncaughtError = null;

  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (err) => {
    const msg = err.message || '';
    if (
      msg.includes('Could not load script') ||
      msg.includes('Could not load stylesheet') ||
      msg.includes('Failed to load') ||
      msg.includes('Error: Could not load')
    ) {
      return;
    }
    if (!uncaughtError) {
      uncaughtError = `JSDOM Error: ${msg}`;
    }
  });

  const dom = new JSDOM(fileContent, {
    url: `http://127.0.0.1:${port}/${url}`,
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole,
    beforeParse(window) {
      // Fake window.supabase
      const mockUser = { id: 'test-user-id', email: 'test@cosylanguages.com' };
      const mockSession = { user: mockUser, access_token: 'mock-token' };
      const mockProfile = {
        id: 'test-user-id',
        role: role,
        language_access: ['*'],
        course_level: '*'
      };

      const mockClient = {
        auth: {
          getSession: async () => ({ data: { session: mockSession }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null })
        },
        from: (table) => {
          return {
            select: (cols) => {
              const query = {
                eq: (col, val) => query,
                order: (col, opts) => query,
                single: async () => ({ data: mockProfile, error: null }),
                maybeSingle: async () => ({ data: mockProfile, error: null }),
                then: (onRes, onRej) => Promise.resolve({ data: [mockProfile], error: null }).then(onRes, onRej)
              };
              return query;
            }
          };
        }
      };

      const mockSupabase = {
        createClient: () => mockClient
      };

      Object.defineProperty(window, 'supabase', {
        get: () => mockSupabase,
        set: () => {},
        configurable: true
      });

      window.addEventListener('error', (event) => {
        const msg = event.message || (event.error ? event.error.message : 'Unknown window error');
        if (msg.includes('script error') || msg.includes('Could not load')) return;
        if (!uncaughtError) {
          uncaughtError = `Window Error: ${msg}`;
        }
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason ? (event.reason.message || event.reason) : 'Unknown promise rejection';
        if (!uncaughtError) {
          uncaughtError = `Unhandled Rejection: ${reason}`;
        }
      });

      // Polyfill innerText
      Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        get() {
          return this.textContent;
        },
        set(v) {
          this.textContent = v;
        },
        configurable: true
      });

      // Map-based localStorage
      const storageMap = new Map();
      window.localStorage = {
        getItem: (k) => storageMap.has(k) ? storageMap.get(k) : null,
        setItem: (k, v) => storageMap.set(k, String(v)),
        removeItem: (k) => storageMap.delete(k),
        clear: () => storageMap.clear(),
        key: (i) => Array.from(storageMap.keys())[i] || null,
        get length() { return storageMap.size; }
      };

      // Local fetch stub
      window.fetch = async (input, init) => {
        const reqUrl = typeof input === 'string' ? input : (input.url || '');
        let cleanPath = reqUrl.replace(/^https?:\/\/[^\/]+\//, '').split('?')[0];
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

        const localPath = path.join(ROOT_DIR, cleanPath);

        if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
          const data = fs.readFileSync(localPath, 'utf8');
          return {
            ok: true,
            status: 200,
            text: async () => data,
            json: async () => JSON.parse(data)
          };
        } else {
          return {
            ok: false,
            status: 404,
            text: async () => '404 Not Found',
            json: async () => { throw new Error('404 Not Found'); }
          };
        }
      };
    }
  });

  // Wait 2 seconds for scripts and async renders to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (uncaughtError) {
    return { pass: false, reason: uncaughtError };
  }

  const visibleText = getVisibleText(dom);
  if (visibleText.length < 40) {
    return { pass: false, reason: `Main content area has fewer than 40 characters of visible text (found ${visibleText.length}): "${visibleText}"` };
  }

  // Specific assertions based on requirements:
  // 1. founder.html must match numbers from data/platform-stats.json
  if (htmlFileName === 'founder.html') {
    const statsPath = path.join(ROOT_DIR, 'data/platform-stats.json');
    if (!fs.existsSync(statsPath)) {
      return { pass: false, reason: 'data/platform-stats.json not found for founder.html assertion' };
    }
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

    const expectedStrings = [
      `live of ${stats.languages.total.toLocaleString()} planned (${stats.languages.codes.map(c => c.toUpperCase()).join(', ')})`,
      `available of ${stats.courses.total.toLocaleString()} in catalog`,
      `available of ${stats.lessons.total.toLocaleString()} planned`,
      `${stats.unlinkedLessonFiles.toLocaleString()} lesson files not yet linked to a course`
    ];

    for (const expStr of expectedStrings) {
      if (!visibleText.includes(expStr)) {
        return { pass: false, reason: `founder.html visible text missing expected stats string: "${expStr}"` };
      }
    }
  }

  // 2. teacher.html: founder profile has "Founder Portal" link, teacher profile does NOT
  if (htmlFileName === 'teacher.html' && !parsedUrl.search) {
    const hasFounderLink = visibleText.includes('Founder Portal');

    if (role === 'founder' && !hasFounderLink) {
      return { pass: false, reason: 'teacher.html with founder profile should display Founder Portal link, but link was missing.' };
    }
    if (role === 'teacher' && hasFounderLink) {
      return { pass: false, reason: 'teacher.html with teacher profile should NOT display Founder Portal link, but link was found.' };
    }
  }

  return { pass: true, textLength: visibleText.length };
}

async function runSmokeSuite() {
  console.log('💨 Running COSYplatform Page Smoke Tests...\n');

  const { server, port } = await startStaticServer(ROOT_DIR);

  let passedCount = 0;
  let failedCount = 0;

  try {
    for (const combo of COMBINATIONS) {
      const res = await testCombination(port, combo);
      if (res.pass) {
        passedCount++;
        console.log(`  PASS: [${combo.role.toUpperCase()}] ${combo.url} (${res.textLength} chars visible)`);
      } else {
        failedCount++;
        console.error(`  FAIL: [${combo.role.toUpperCase()}] ${combo.url} -> ${res.reason}`);
      }
    }
  } finally {
    server.close();
  }

  console.log(`\n---------------------------------------------------`);
  console.log(`Smoke Test Summary: ${passedCount} PASSED, ${failedCount} FAILED out of ${COMBINATIONS.length} combinations.`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmokeSuite().catch(err => {
  console.error('❌ Unhandled error running smoke test suite:', err);
  process.exit(1);
});
