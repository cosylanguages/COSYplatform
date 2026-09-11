/**
 * SUPERSEDED / DEPRECATED:
 * As of September 11, 2026, WORKBOOK_TOPICS in this file has been superseded
 * by modular JSON files in student-workbooks/data/workbooks/{lang}/{level}.json.
 * Please refer to student-workbooks/data/workbooks/ for active topic datasets.
 */
/**
 * WORKBOOK DATA : exercises, grammar blocks & homework
 */

const WORKBOOK_TOPICS = [
  // ─── ENGLISH A1 ───
  {
    id: 'en-a1-intro', lang: 'en', flag: '🇬🇧', level: 'a1', title: 'Introducing Yourself',
    desc: 'Basic greetings & introductions',
    img: 'images/cosyenglish.png',
    grammarBlocks: [
      {
        title: 'Basic greetings & introductions',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">📌 Greetings</td></tr>
          <tr><td class="wt-label">Hello / Hi</td><td class="wt-l"><span class="key-v">Hello!</span> / <span class="key-v">Hi!</span></td></tr>
          <tr><td class="wt-label">My name is…</td><td class="wt-l"><span class="key-v">My name is</span> Maria. / <span class="key-v">I'm</span> Maria.</td></tr>
          <tr><td class="wt-label">Nice to meet you</td><td class="wt-l"><span class="key-v">Nice to meet you!</span></td></tr>
          <tr><td class="wt-label">How are you?</td><td class="wt-l"><span class="key-v">How are you?</span> → I'm <span class="key-v">fine</span>, thank you.</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'en-a1-0-1', q: '"Nice to ___!" (greeting)', type: 'fill', ans: 'meet you', fb: '✅ Nice to meet you!' },
      { id: 'en-a1-0-2', q: 'How do you say "My name is" in a shorter way?', type: 'fill', ans: "I'm", fb: "✅ I'm Maria." }
    ]
  },
  {
    id: 'en-a1-tobe-core', lang: 'en', flag: '🇬🇧', level: 'a1', title: 'Verb TO BE : Core',
    desc: 'I am / You are / He is',
    verbKey: 'to be',
    img: 'images/cosyenglish.png',
    grammarBlocks: [
      {
        title: 'Core Forms (Singular)',
        html: `
        <table class="wb-table">
          <tr><td class="wt-label">I</td><td class="wt-c"><span class="key-v">am</span> / 'm</td></tr>
          <tr><td class="wt-label">you</td><td class="wt-c"><span class="key-v">are</span> / 're</td></tr>
          <tr><td class="wt-label">he / she / it</td><td class="wt-c"><span class="key-v">is</span> / 's</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'en-a1-0-3', q: 'I ___ a student.', type: 'mcq', opts: ['am', 'is', 'are'], ans: 'am', fb: '✅ I am' },
      { id: 'en-a1-0-4', q: 'She ___ French.', type: 'mcq', opts: ['am', 'is', 'are'], ans: 'is', fb: '✅ She is' }
    ]
  },

  // ─── FRENCH A1 ───
  {
    id: 'fr-a1-intro', lang: 'fr', flag: '🇫🇷', level: 'a1', title: 'Salutations',
    desc: 'Greetings & introductions',
    img: 'images/cosyfrench.png',
    grammarBlocks: [
      {
        title: 'Dire bonjour',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">🇫🇷 Greetings</td></tr>
          <tr><td class="wt-label">Bonjour / Salut</td><td class="wt-l"><span class="key-v">Bonjour !</span> · <span class="key-v">Salut !</span></td></tr>
          <tr><td class="wt-label">Je m'appelle…</td><td class="wt-l"><span class="key-v">Je m'appelle</span> Marie.</td></tr>
          <tr><td class="wt-label">Au revoir</td><td class="wt-l"><span class="key-v">Au revoir !</span> · <span class="key-v">À bientôt !</span></td></tr>
        </table>`
      },
      {
        title: 'Les Accents',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="3">🔡 French Accents</td></tr>
          <tr><td class="wt-label">é</td><td class="wt-c">accent aigu</td><td class="wt-l">café</td></tr>
          <tr><td class="wt-label">à / è / ù</td><td class="wt-c">accent grave</td><td class="wt-l">très, à</td></tr>
          <tr><td class="wt-label">â / ê / î / ô / û</td><td class="wt-c">circonflexe</td><td class="wt-l">hôtel</td></tr>
          <tr><td class="wt-label">ç</td><td class="wt-c">cédille</td><td class="wt-l">français</td></tr>
        </table>`
      },
      {
        title: 'Les Nombres 1-10',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">🔢 Numbers 1-10</td></tr>
          <tr><td class="wt-label">1-3</td><td class="wt-l">un, deux, trois</td></tr>
          <tr><td class="wt-label">4-6</td><td class="wt-l">quatre, cinq, six</td></tr>
          <tr><td class="wt-label">7-10</td><td class="wt-l">sept, huit, neuf, dix</td></tr>
          <tr class="wt-note"><td colspan="2">💡 Watch the pronunciation of "six" and "dix"!</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'fr-a1-0-1', q: 'How do you say "Hello" in French (formal)?', type: 'fill', ans: 'Bonjour', fb: '✅ Bonjour !' },
      { id: 'fr-a1-0-2', q: 'Which accent is in the word "café"?', type: 'mcq', opts: ['grave', 'aigu', 'cédille'], ans: 'aigu', fb: '✅ é = accent aigu' }
    ]
  },

  // ─── ITALIAN A1 ───
  {
    id: 'it-a1-intro', lang: 'it', flag: '🇮🇹', level: 'a1', title: 'Saluti e Numeri',
    desc: 'Greetings & numbers 1-5',
    img: 'images/cosyitalian.png',
    grammarBlocks: [
      {
        title: 'Basic greetings',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">🇮🇹 Saluti</td></tr>
          <tr><td class="wt-label">Buongiorno / Ciao</td><td class="wt-l"><span class="key-v">Buongiorno!</span> · <span class="key-v">Ciao!</span></td></tr>
          <tr><td class="wt-label">Mi chiamo…</td><td class="wt-l"><span class="key-v">Mi chiamo</span> Luca.</td></tr>
          <tr class="wt-sec"><td colspan="2">🔢 Numeri 1-5</td></tr>
          <tr><td class="wt-label">1, 2, 3</td><td class="wt-l">uno, due, tre</td></tr>
          <tr><td class="wt-label">4, 5</td><td class="wt-l">quattro, cinque</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'it-a1-0-1', q: 'How do you say "My name is" in Italian?', type: 'fill', ans: 'Mi chiamo', fb: '✅ Mi chiamo Luca.' },
      { id: 'it-a1-0-2', q: 'What is "three" in Italian?', type: 'mcq', opts: ['uno', 'due', 'tre'], ans: 'tre', fb: '✅ tre = 3' }
    ]
  },

  // ─── SPANISH A1 ───
  {
    id: 'es-a1-intro', lang: 'es', flag: '🇪🇸', level: 'a1', title: 'Saludos y Pronombres',
    desc: 'Greetings & personal pronouns',
    img: 'images/cosyspanish.png',
    grammarBlocks: [
      {
        title: 'Basic greetings',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">🇪🇸 Saludos</td></tr>
          <tr><td class="wt-label">Hola / Buenos días</td><td class="wt-l"><span class="key-v">¡Hola!</span> · <span class="key-v">Buenos días</span></td></tr>
          <tr><td class="wt-label">Me llamo…</td><td class="wt-l"><span class="key-v">Me llamo</span> Carlos.</td></tr>
          <tr class="wt-sec"><td colspan="2">👤 Pronombres</td></tr>
          <tr><td class="wt-label">I / You</td><td class="wt-l"><span class="key-v">Yo</span> / <span class="key-v">Tú</span></td></tr>
          <tr><td class="wt-label">He / She</td><td class="wt-l"><span class="key-v">Él</span> / <span class="key-v">Ella</span></td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'es-a1-0-1', q: 'How do you say "Hello" in Spanish?', type: 'fill', ans: 'Hola', fb: '✅ ¡Hola!' },
      { id: 'es-a1-0-2', q: 'How do you say "I" in Spanish?', type: 'mcq', opts: ['Yo', 'Tú', 'Él'], ans: 'Yo', fb: '✅ Yo = I' }
    ]
  },

  // ─── GERMAN A1 ───
  {
    id: 'de-a1-intro', lang: 'de', flag: '🇩🇪', level: 'a1', title: 'Begrüßungen',
    desc: 'Greetings & introductions',
    img: 'images/cosygerman.png',
    grammarBlocks: [
      {
        title: 'Basic greetings',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">📌 Greetings</td></tr>
          <tr><td class="wt-label">Hello / Good day</td><td class="wt-l"><span class="key-v">Hallo!</span> / <span class="key-v">Guten Tag</span></td></tr>
          <tr><td class="wt-label">My name is…</td><td class="wt-l"><span class="key-v">Ich heiße</span> Hans. / <span class="key-v">Mein Name ist</span>...</td></tr>
          <tr><td class="wt-label">Nice to meet you</td><td class="wt-l"><span class="key-v">Freut mich!</span></td></tr>
          <tr class="wt-sec"><td colspan="2">🔢 Numbers 1-5</td></tr>
          <tr><td class="wt-label">1, 2, 3</td><td class="wt-l">eins, zwei, drei</td></tr>
          <tr><td class="wt-label">4, 5</td><td class="wt-l">vier, fünf</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'de-a1-0-1', q: 'How do you say "My name is" in German?', type: 'fill', ans: 'Ich heiße', fb: '✅ Ich heiße Hans.' },
      { id: 'de-a1-0-2', q: 'What is "two" in German?', type: 'mcq', opts: ['eins', 'zwei', 'drei'], ans: 'zwei', fb: '✅ zwei = 2' }
    ]
  },

  // ─── RUSSIAN A1 ───
  {
    id: 'ru-a1-alpha', lang: 'ru', flag: '🇷🇺', level: 'a1', title: 'Алфавит и Приветствия',
    desc: 'The Cyrillic Alphabet & Greetings',
    img: 'images/cosyrussian.png',
    grammarBlocks: [
      {
        title: 'False Friends (Looks like English, sounds different)',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="3">⚠️ Watch out!</td></tr>
          <tr><td class="wt-label">В в</td><td class="wt-c">/v/</td><td class="wt-l">Like <span class="key-v">V</span>et (NOT W)</td></tr>
          <tr><td class="wt-label">Н н</td><td class="wt-c">/n/</td><td class="wt-l">Like <span class="key-v">N</span>et (NOT H)</td></tr>
          <tr><td class="wt-label">Р р</td><td class="wt-c">/r/</td><td class="wt-l">Like <span class="key-v">R</span>at (NOT P)</td></tr>
          <tr><td class="wt-label">Х х</td><td class="wt-c">/h/</td><td class="wt-l">Like <span class="key-v">H</span>ot (NOT X)</td></tr>
          <tr class="wt-sec"><td colspan="3">👋 Greetings</td></tr>
          <tr><td class="wt-label">Привет / Покa</td><td class="wt-l"><span class="key-v">Privet</span> (Hi) / <span class="key-v">Poka</span> (Bye)</td></tr>
          <tr><td class="wt-label">Меня зовут…</td><td class="wt-l"><span class="key-v">Menya zovut</span>...</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'ru-a1-0-1', q: 'В in Russian sounds like English...', type: 'mcq', opts: ['W', 'V', 'B'], ans: 'V', fb: '✅ В = /v/' },
      { id: 'ru-a1-0-2', q: 'How do you say "Hi" informally in Russian?', type: 'fill', ans: 'Привет', fb: '✅ Привет!' }
    ]
  },

  // ─── GREEK A1 ───
  {
    id: 'el-a1-alpha', lang: 'el', flag: '🇬🇷', level: 'a1', title: 'Αλφάβητο και Χαιρετισμοί',
    desc: 'The Greek Alphabet & Greetings',
    img: 'images/cosygreek.png',
    grammarBlocks: [
      {
        title: 'Tricky Letters',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="3">🇬🇷 Alphabet Essentials</td></tr>
          <tr><td class="wt-label">Β β</td><td class="wt-c">/v/</td><td class="wt-l">Like <span class="key-v">V</span>ase (NOT B)</td></tr>
          <tr><td class="wt-label">Δ δ</td><td class="wt-c">/ð/</td><td class="wt-l">Like <span class="key-v">th</span>e (soft TH)</td></tr>
          <tr><td class="wt-label">Γ γ</td><td class="wt-c">/ɣ/</td><td class="wt-l">Soft "g" / "y" sound</td></tr>
          <tr class="wt-sec"><td colspan="3">👋 Greetings</td></tr>
          <tr><td class="wt-label">Γεια / Χαίρετε</td><td class="wt-l"><span class="key-v">Ya</span> (Hi) / <span class="key-v">Herete</span> (Hello)</td></tr>
          <tr><td class="wt-label">Με λένε…</td><td class="wt-l"><span class="key-v">Me lene</span>...</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'el-a1-0-1', q: 'Β in Greek sounds like...', type: 'mcq', opts: ['B', 'V', 'W'], ans: 'V', fb: '✅ Β = /v/' },
      { id: 'el-a1-0-2', q: 'How do you say "Hi" in Greek?', type: 'fill', ans: 'Γεια', fb: '✅ Γεια!' }
    ]
  },

  // ─── PORTUGUESE A1 ───
  {
    id: 'pt-a1-intro', lang: 'pt', flag: '🇵🇹', level: 'a1', title: 'Saudações e Alfabeto',
    desc: 'Greetings & foundational sounds',
    img: 'images/cosyportugese.png',
    grammarBlocks: [
      {
        title: 'Basic greetings',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">🇵🇹 Saudações</td></tr>
          <tr><td class="wt-label">Olá / Bom dia</td><td class="wt-l"><span class="key-v">Olá!</span> · <span class="key-v">Bom dia</span></td></tr>
          <tr><td class="wt-label">Chamo-me…</td><td class="wt-l"><span class="key-v">Chamo-me</span> Ana.</td></tr>
        </table>`
      },
      {
        title: 'Alfabeto e Sons',
        html: `
        <table class="wb-table">
          <tr class="wt-sec"><td colspan="2">🔡 Tricky Sounds</td></tr>
          <tr><td class="wt-label">LH</td><td class="wt-l">Like "mi<span class="key-v">lli</span>on" (filho)</td></tr>
          <tr><td class="wt-label">NH</td><td class="wt-l">Like "opi<span class="key-v">ni</span>on" (manhã)</td></tr>
          <tr><td class="wt-label">Ç</td><td class="wt-l">Soft "s" sound (coração)</td></tr>
          <tr><td class="wt-label">~ (til)</td><td class="wt-l">Nasal sound (pão)</td></tr>
        </table>`
      }
    ],
    exercises: [
      { id: 'pt-a1-0-1', q: 'How do you say "Hello" in Portuguese?', type: 'fill', ans: 'Olá', fb: '✅ Olá!' },
      { id: 'pt-a1-0-2', q: 'Which sound is like the "lli" in million?', type: 'mcq', opts: ['LH', 'NH', 'RR'], ans: 'LH', fb: '✅ LH = /ʎ/' }
    ]
  }
];

const WORKBOOK_HW_TASKS = [
  { id: 'hw1', text: 'Review the Grammar Reference for your target language', tag: 'grammar' },
  { id: 'hw2', text: 'Complete the workbook exercises for this topic', tag: 'grammar' },
  { id: 'hw3', text: 'Read the Pronunciation Guide section', tag: 'phonetics' },
  { id: 'hw4', text: 'Write 5 original sentences using the new grammar', tag: 'writing' }
];

const WORKBOOK_COURSE_CATALOGUE = {
  'en-a1': {
    phonetics: { ref: 'pronunciation-reference.html#en-a1', text: 'Focus on alphabet and basic vowels.' },
    homework: [
      { id: 'en-a1-h1', text: 'Write 5 sentences about yourself', tag: 'writing' },
      { id: 'en-a1-h2', text: 'Practise the TH sound', tag: 'phonetics' }
    ]
  },
  'fr-a1': {
    phonetics: { ref: 'pronunciation-reference.html#fr-a1', text: 'Focus on accents and nasal vowels.' },
    homework: [
      { id: 'fr-a1-h1', text: 'Learn numbers 1-10', tag: 'grammar' }
    ]
  },
  'it-a1': {
    phonetics: { ref: 'pronunciation-reference.html#it-a1', text: 'Focus on pronunciation of C and G.' },
    homework: [ { id: 'it-a1-h1', text: 'Learn common Italian greetings', tag: 'grammar' } ]
  },
  'es-a1': {
    phonetics: { ref: 'pronunciation-reference.html#es-a1', text: 'Focus on vowel clarity and the letter J.' },
    homework: [ { id: 'es-a1-h1', text: 'Learn the Spanish alphabet', tag: 'phonetics' } ]
  },
  'de-a1': {
    phonetics: { ref: 'pronunciation-reference.html#de-a1', text: 'Focus on compound vowels (ei, ie, eu).' },
    homework: [ { id: 'de-a1-h1', text: 'Learn numbers 1-12 in German', tag: 'grammar' } ]
  },
  'ru-a1': {
    phonetics: { ref: 'pronunciation-reference.html#ru-a1', text: 'Focus on vowel reduction (A vs O).' },
    homework: [ { id: 'ru-a1-h1', text: 'Memorize the Russian alphabet', tag: 'phonetics' } ]
  },
  'el-a1': {
    phonetics: { ref: 'pronunciation-reference.html#el-a1', text: 'Focus on diphthongs like OU and OI.' },
    homework: [ { id: 'el-a1-h1', text: 'Learn common Greek phrases', tag: 'grammar' } ]
  },
  'pt-a1': {
    phonetics: { ref: 'pronunciation-reference.html#pt-a1', text: 'Focus on nasal sounds and the letter LH.' },
    homework: [ { id: 'pt-a1-h1', text: 'Learn Portuguese numbers 1-10', tag: 'grammar' } ]
  }
};
