if(!window.curriculumData) window.curriculumData = {};
window.curriculumData.de_a1 = [
{
  id:'u0', num:0, color:'#10B981', label:'Einheit 0: Erste Schritte (A0)',
  arc:'Grüße → Das Alphabet → Zahlen 1-20 → Basis-Aussprache',
  lessons_count:5,
  lessons:[
    { code:'DE-001', num:1, title:'Hallo & Willkommen',
      grammar:'Verb "sein" (Präsens) — Aussagesätze',
      pronunciation: [
        {
          point: "Das deutsche Alphabet",
          explain: "Deutsch hat 26 Buchstaben plus die Umlaute (Ä, Ö, Ü) und das Eszett (ß).",
          alphabet: [
            {l:'A a', ipa:'/aː/'}, {l:'B b', ipa:'/beː/'}, {l:'C c', ipa:'/tseː/'}, {l:'D d', ipa:'/deː/'}, {l:'E e', ipa:'/eː/'},
            {l:'F f', ipa:'/ɛf/'}, {l:'G g', ipa:'/ɡeː/'}, {l:'H h', ipa:'/haː/'}, {l:'I i', ipa:'/iː/'}, {l:'J j', ipa:'/jɔt/'},
            {l:'K k', ipa:'/kaː/'}, {l:'L l', ipa:'/ɛl/'}, {l:'M m', ipa:'/ɛm/'}, {l:'N n', ipa:'/ɛn/'}, {l:'O o', ipa:'/oː/'},
            {l:'P p', ipa:'/peː/'}, {l:'Q q', ipa:'/kuː/'}, {l:'R r', ipa:'/ɛʁ/'}, {l:'S s', ipa:'/ɛs/'}, {l:'T t', ipa:'/teː/'},
            {l:'U u', ipa:'/uː/'}, {l:'V v', ipa:'/faʊ/'}, {l:'W w', ipa:'/veː/'}, {l:'X x', ipa:'/ɪks/'}, {l:'Y y', ipa:'/ˈʏpsilɔn/'}, {l:'Z z', ipa:'/tsɛt/'},
            {l:'Ä ä', ipa:'/ɛː/'}, {l:'Ö ö', ipa:'/øː/'}, {l:'Ü ü', ipa:'/yː/'}, {l:'ß', ipa:'/ɛsˈtsɛt/'}
          ],
          extension: "Das deutsche Alphabet hat 26 Standardbuchstaben plus 4 Spezialzeichen: Ä, Ö, Ü und ß. Die Aussprache ist im Vergleich zum Englischen sehr konsistent.",
          visual: "🇩🇪🔤"
        }
      ],
      vocab:[
        {w:'Hallo', emoji:'👋', trans:'Hello'},
        {w:'Guten Morgen', emoji:'🌅', trans:'Good morning'},
        {w:'Danke', emoji:'🙏', trans:'Thank you'},
        {w:'Bitte', emoji:'🥺', trans:'Please / You\'re welcome'},
        {w:'Auf Wiedersehen', emoji:'👋', trans:'Goodbye'}
      ],
      cando:'Can greet people and say goodbye',
      hw:'Learn the alphabet and the special characters (Ä, Ö, Ü, ß)' },
    { code:'DE-002', num:2, title:'Wie heißt du?',
      grammar:'Verb "heißen" (Präsens)',
      pronunciation: [
        {
          point: "Umlaute und Sonderzeichen",
          explain: "Ä, Ö, Ü und ß sind typisch für die deutsche Sprache.",
          examples: [
            { pattern: "ä", ipa: "/ɛː/", word: "Äpfel" },
            { pattern: "ö", ipa: "/øː/", word: "Öl" },
            { pattern: "ü", ipa: "/yː/", word: "Über" },
            { pattern: "ß", ipa: "/s/", word: "heißen" }
          ],
          tip: "Das 'ß' wird wie ein scharfes 'S' ausgesprochen.",
          extension: "Umlaute verändern den Klang des Vokals. Wenn man keine Umlaute auf der Tastatur hat, kann man sie als ae, oe, ue umschreiben.",
          visual: "🥨"
        }
      ],
      vocab:[
        {w:'Name', emoji:'🆔', trans:'Name'},
        {w:'Wie?', emoji:'❓', trans:'How?'},
        {w:'Freut mich', emoji:'🤝', trans:'Nice to meet you'}
      ],
      cando:'Can introduce themselves',
      hw:'Practice spelling your name using German letters' },
    { code:'DE-003', num:3, title:'Zahlen 1-20',
      grammar:'Nomen: Artikel (der, die, das) - Einführung',
      pronunciation: [
        {
          point: "Zahlen und Wortakzent",
          explain: "Im Deutschen liegt der Akzent meist auf der ersten Silbe.",
          examples: [
            { pattern: "eins", ipa: "/aɪns/", word: "eins" },
            { pattern: "sieben", ipa: "/ˈziːbn̩/", word: "sieben" },
            { pattern: "zwanzig", ipa: "/ˈtsvantsɪç/", word: "zwanzig" }
          ]
        }
      ],
      vocab:[
        {w:'eins', emoji:'1️⃣', trans:'one'},
        {w:'zwei', emoji:'2️⃣', trans:'two'},
        {w:'drei', emoji:'3️⃣', trans:'three'},
        {w:'zehn', emoji:'🔟', trans:'ten'},
        {w:'zwanzig', emoji:'2️⃣0️⃣', trans:'twenty'}
      ],
      cando:'Can count from 1 to 20',
      hw:'Count things in your room in German' },
    { code:'DE-004', num:4, title:'Minimale Paare: CH-Laute',
      grammar:'Satzbau: Subjekt-Verb-Objekt',
      pronunciation: [
        {
          point: "Der CH-Laut (/ç/ vs /x/)",
          explain: "Nach hellen Vokalen (i, e) klingt 'ch' weich (/ç/), nach dunklen (a, o, u) hart (/x/).",
          minimalPairs: [
            { w1: "ich", p1: "/ɪç/", w2: "ach", p2: "/ax/" },
            { w1: "dich", p1: "/dɪç/", w2: "Dach", p2: "/dax/" },
            { w1: "Kirche", p1: "/ˈkɪʁçə/", w2: "Küche", p2: "/ˈkʏçə/" }
          ],
          extension: "Der 'ch'-Laut ist charakteristisch für die deutsche Sprache. Er wird im Rachen gebildet, aber unterschiedlich weit hinten, je nachdem, welcher Vokal davor steht.",
          visual: "🗣️"
        }
      ],
      vocab:[
        {w:'ich', emoji:'👤', trans:'I'},
        {w:'ach', emoji:'😲', trans:'oh'},
        {w:'Küche', emoji:'🍳', trans:'kitchen'}
      ],
      cando:'Can distinguish between soft and hard "ch" sounds',
      hw:'Practice saying "ich" and "ach" correctly' },
    { code:'DE-005', num:5, title:'Wichtige Phrasen',
      grammar:'Höfliche Bitten und Fragen',
      pronunciation: [
        {
          point: "Satzmelodie bei Fragen",
          explain: "Bei Ja/Nein-Fragen steigt die Stimme am Ende an.",
          examples: [
            { pattern: "Wie geht es?", ipa: "/viː ɡeːt ɛs?/", word: "Wie geht es?" },
            { pattern: "Alles klar?", ipa: "/ˈaləs klaːɐ?/", word: "Alles klar?" }
          ]
        }
      ],
      vocab:[
        {w:'Entschuldigung', emoji:'🙋', trans:'Excuse me'},
        {w:'Tut mir leid', emoji:'🙇', trans:'Sorry'},
        {w:'Ja', emoji:'✅', trans:'Yes'},
        {w:'Nein', emoji:'❌', trans:'No'}
      ],
      cando:'Can use basic polite phrases',
      hw:'Use "Entschuldigung" and "Danke" today' }
  ]
},
{
  id:'u1', num:1, color:'#3B82F6', label:'Einheit 1: Mein Alltag',
  arc:'Vorstellung → Arbeit → Wohnen → Essen → Gesundheit → Technik → Freizeit',
  lessons_count:10,
  lessons:[
    { code:'DE-01', num:1, title:'Hallo, ich bin...',
      grammar:'Verb "sein" und "haben" im Präsens',
      pronunciation: [
        {
          point: "Der Vokalneueinsatz (Glottal Stop)",
          explain: "Wörter, die mit einem Vokal beginnen, werden mit einem kleinen harten Einsatz gesprochen.",
          examples: [
            { pattern: "Apfel", ipa: "/ˈʔapfl̩/", word: "Apfel" },
            { pattern: "Eis", ipa: "/ˈʔaɪs/", word: "Eis" }
          ],
          extension: "Im Deutschen klingen Wörter, die mit Vokalen beginnen, oft 'abgehackt'. Das liegt an diesem Glottal-Stopp. Er ist kein Buchstabe, aber ein wichtiger Laut für den deutschen Rhythmus.",
          visual: "⏹️"
        }
      ],
      vocab:[
        {w:'Student', emoji:'👨‍🎓', trans:'student'},
        {w:'Lehrer', emoji:'👨‍🏫', trans:'teacher'},
        {w:'Deutsch', emoji:'🇩🇪', trans:'German'}
      ],
      cando:'Can introduce themselves and use basic verbs',
      hw:'Write 3 sentences about your job in German' },
    { code:'DE-02', num:2, title:'Mein Beruf',
      grammar:'Berufe und Artikel',
      pronunciation: [
        {
          point: "Auslautverhärtung",
          explain: "B, D und G am Ende eines Wortes werden wie P, T und K ausgesprochen.",
          examples: [
            { pattern: "b -> p", ipa: "/ap/", word: "ab" },
            { pattern: "d -> t", ipa: "/hant/", word: "Hand" },
            { pattern: "g -> k", ipa: "/taːk/", word: "Tag" }
          ],
          extension: "Das ist einer der Gründe, warum Deutsch für manche 'hart' klingt. Wir machen weiche Konsonanten am Ende hart und stimmlos.",
          visual: "🔨"
        }
      ]
    },
    { code:'DE-03', num:3, title:'Wo ich wohne',
      grammar:'Wohnen und Präpositionen',
      pronunciation: [
        {
          point: "Das 'R' im Deutschen",
          explain: "Am Wortanfang wird es im Rachen gerieben, am Ende fast wie ein 'A' ausgesprochen.",
          examples: [
            { pattern: "r-", ipa: "/ʁɔt/", word: "rot" },
            { pattern: "-er", ipa: "/ˈvɪndɐ/", word: "Winter" }
          ],
          extension: "Das vokalisierte 'r' am Ende (wie in 'Mutter', 'Bier') klingt fast wie ein kurzes 'a'. Das ist sehr wichtig für eine natürliche Aussprache.",
          visual: "🗣️"
        }
      ]
    }
  ]
}
];
