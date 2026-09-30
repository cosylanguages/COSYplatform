const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function runAcceptanceTests() {
  console.log('🧪 Starting COSYplatform Acceptance Verification Tests...\n');

  // Test 1: Grep check for forbidden strings in HTML files
  console.log('  1. Testing grep check for forbidden strings in .html files...');
  const htmlFiles = [
    'student.html',
    'teacher.html',
    'founder.html',
    'hub.html',
    'index.html',
    'teacher-english.html',
    'teacher-french.html',
    'teacher-russian.html'
  ];

  const forbiddenStrings = ['consolidated into hub.html', '#0284c7', '#4f46e5'];

  htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    forbiddenStrings.forEach(str => {
      if (content.includes(str)) {
        throw new Error(`Forbidden string "${str}" found in ${file}`);
      }
    });
  });
  console.log('  ✅ Grep check passed! No forbidden strings found in .html files.\n');

  // Test 2: JSDOM test for Log Out button on student.html and teacher.html
  console.log('  2. Testing Log Out button and auth.signOut on student.html & teacher.html...');
  const pagesToTest = ['student.html', 'teacher.html'];

  for (const pageName of pagesToTest) {
    const pagePath = path.join(__dirname, '..', pageName);
    const htmlContent = fs.readFileSync(pagePath, 'utf8');

    let signOutCallCount = 0;

    const dom = new JSDOM(htmlContent, {
      url: `http://localhost/${pageName}`,
      runScripts: 'outside-only'
    });

    const { window } = dom;

    let navigatedUrl = '';

    // Stub Supabase client & CosyAuth
    window.CosyAuth = {
      client: {
        auth: {
          signOut: async () => {
            signOutCallCount++;
            return { error: null };
          }
        }
      },
      requireRole: async () => ({
        user: { email: 'user@cosylanguages.com' },
        profile: { role: pageName.includes('student') ? 'student' : 'teacher', language_access: ['all'], course_level: 'all' }
      }),
      FULL_MANIFEST: [],
      logout: async function() {
        if (window.CosyAuth.client) {
          await window.CosyAuth.client.auth.signOut();
        }
        navigatedUrl = "login.html";
      }
    };

    const logoutBtn = Array.from(window.document.querySelectorAll('button')).find(
      btn => btn.textContent.trim() === 'Log Out'
    );

    if (!logoutBtn) {
      throw new Error(`Log Out button not found in header of ${pageName}`);
    }

    // Execute onclick or dispatch click event
    logoutBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await window.CosyAuth.logout();

    if (signOutCallCount !== 1) {
      throw new Error(`Expected auth.signOut to be called exactly once in ${pageName}, but was called ${signOutCallCount} times`);
    }

    if (navigatedUrl !== 'login.html') {
      throw new Error(`Expected navigation to 'login.html' after logout in ${pageName}, got '${navigatedUrl}'`);
    }

    console.log(`  ✅ ${pageName} Log Out button calls auth.signOut once and navigates to login.html.`);
  }
  console.log('');

  // Test 3: JSDOM test for copyEssayText when navigator.clipboard.writeText rejects
  console.log('  3. Testing copyEssayText with rejecting clipboard API...');
  const studentPath = path.join(__dirname, '..', 'student.html');
  const studentContent = fs.readFileSync(studentPath, 'utf8');

  const uiToastPath = path.join(__dirname, '..', 'shared', 'js', 'ui-toast.js');
  const uiToastCode = fs.readFileSync(uiToastPath, 'utf8');

  const dom = new JSDOM(studentContent, {
    url: 'http://localhost/student.html',
    runScripts: 'outside-only'
  });

  const { window } = dom;
  window.eval(uiToastCode);

  let toastMessage = '';
  window.CosyUI.toast = (msg) => {
    toastMessage = msg;
  };

  // Mock clipboard writeText to reject
  window.navigator.clipboard = {
    writeText: async () => {
      throw new Error('Clipboard write permission denied');
    }
  };

  window.CosyAuth = {
    requireRole: async () => null,
    FULL_MANIFEST: []
  };

  const scriptMatch = studentContent.match(/<script>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    window.eval(scriptMatch[1]);
  }

  // Create essay textarea
  const textarea = window.document.createElement('textarea');
  textarea.id = 'test_essay_textarea';
  textarea.value = 'Sample essay content';
  window.document.body.appendChild(textarea);

  window.copyEssayText('test_essay_textarea');

  // Allow promise tick to complete
  await new Promise(resolve => setTimeout(resolve, 50));

  if (toastMessage === 'Copied') {
    throw new Error('Expected toast NOT to be "Copied" when clipboard writeText rejects!');
  }

  if (toastMessage !== 'Could not copy. Select the text and copy it manually.') {
    throw new Error(`Expected error toast message, got: '${toastMessage}'`);
  }

  console.log('  ✅ copyEssayText test passed: Toast is NOT "Copied" on rejection.\n');

  console.log('🎉 All Acceptance Verification Tests Passed Successfully!');
}

runAcceptanceTests().catch(err => {
  console.error('❌ Acceptance Test Failed:', err);
  process.exit(1);
});
