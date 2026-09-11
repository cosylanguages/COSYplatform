if(!window.curriculumData) window.curriculumData = {};
window.curriculumData.it_a1 = [
{
  id:'u0', num:0, color:'#10B981', label:'Unità 0: Primi passi (A0)',
  arc:'Saluti → L\'alfabeto → Numeri 1-20 → Pronuncia di base',
  lessons_count:5,
  lessons:[
    { code:'IT-001', num:1, title:'Buongiorno & Benvenuti',
      grammar:'Verbo essere (presente) — forme affermative',
      pronunciation: [
        {
          point: "L'alfabeto italiano",
          explain: "L'italiano ha 21 lettere. Le vocali sono sempre chiare e distinte.",
          alphabet: [
            {l:'A', ipa:'/a/'}, {l:'B', ipa:'/be/'}, {l:'C', ipa:'/tʃe/'}, {l:'D', ipa:'/de/'}, {l:'E', ipa:'/e/'},
            {l:'F', ipa:'/ɛf.fe/'}, {l:'G', ipa:'/dʒe/'}, {l:'H', ipa:'/ak.ka/'}, {l:'I', ipa:'/i/'}, {l:'L', ipa:'/ɛl.le/'},
            {l:'M', ipa:'/ɛm.me/'}, {l:'N', ipa:'/ɛn.ne/'}, {l:'O', ipa:'/o/'}, {l:'P', ipa:'/pe/'}, {l:'Q', ipa:'/ku/'},
            {l:'R', ipa:'/ɛr.re/'}, {l:'S', ipa:'/ɛs.se/'}, {l:'T', ipa:'/te/'}, {l:'U', ipa:'/u/'}, {l:'V', ipa:'/vu/'}, {l:'Z', ipa:'/dzɛ.ta/'}
          ],
          extension: "L'italiano è una lingua fonetica: si scrive quasi esattamente come si pronuncia. Imparare l'alfabeto è il primo passo per leggere correttamente ogni parola.",
          visual: "🇮🇹🔤"
        }
      ],
      vocab: ['Buongiorno', 'Ciao', 'Benvenuti', 'Grazie', 'Arrivederci'],
      cando:'Sa salutare e dire arrivederci',
      hw:'Imparare la canzone dell\'alfabeto' },
    { code:'IT-002', num:2, title:'Come ti chiami?',
      grammar:'Verbo chiamarsi (presente)',
      pronunciation: [
        {
          point: "La Doppia Consonante",
          explain: "In italiano, le doppie consonanti si pronunciano con più forza e durata.",
          examples: [
            { pattern: "nn", ipa: "/ˈnon.no/", word: "nonno" },
            { pattern: "tt", ipa: "/ˈfat.to/", word: "fatto" },
            { pattern: "ll", ipa: "/ˈbel.lo/", word: "bello" }
          ],
          tip: "Immagina di fare una piccola pausa sulla doppia.",
          extension: "Le doppie sono fondamentali! Cambiano il significato delle parole: 'casa' (house) vs 'cassa' (box). Ascolta bene la vibrazione più lunga.",
          visual: "⚡"
        }
      ],
      vocab: ['Nome', 'Come', 'Piacere'],
      cando:'Sa presentarsi',
      hw:'Compitare il proprio nome in italiano' },
    { code:'IT-003', num:3, title:'I numeri 1-20',
      grammar:'Il plurale dei nomi (introduzione)',
      pronunciation: [
        {
          point: "Accento sulle parole",
          explain: "La maggior parte delle parole italiane ha l'accento sulla penultima sillaba.",
          examples: [
            { pattern: "undici", ipa: "/ˈun.di.tʃi/", word: "undici" },
            { pattern: "dodici", ipa: "/ˈdo.di.tʃi/", word: "dodici" },
            { pattern: "venti", ipa: "/ˈven.ti/", word: "venti" }
          ]
        }
      ],
      vocab: ['uno', 'due', 'tre', 'dieci', 'venti'],
      cando:'Sa contare da 1 a 20',
      hw:'Contare gli oggetti nella stanza' },
    { code:'IT-004', num:4, title:'Paire minime: Consonanti',
      grammar:'Struttura base della frase',
      pronunciation: [
        {
          point: "C vs G",
          explain: "Distinguere tra suoni duri e dolci di C e G.",
          minimalPairs: [
            { w1: "casa", p1: "/ˈka.za/", w2: "gara", p2: "/ˈɡa.ra/" },
            { w1: "cena", p1: "/ˈtʃe.na/", w2: "gena", p2: "/ˈdʒɛ.na/" },
            { w1: "chi", p1: "/ki/", w2: "ghi", p2: "/ɡi/" }
          ]
        }
      ],
      vocab: ['casa', 'cena', 'chi'],
      cando:'Sa distinguere i suoni C e G',
      hw:'Registrarsi dicendo casa e gara' },
    { code:'IT-005', num:5, title:'Frasi essenziali',
      grammar:'Richieste gentili (Per favore)',
      pronunciation: [
        {
          point: "Intonazione delle domande",
          explain: "Nelle domande, la voce sale alla fine della frase.",
          examples: [
            { pattern: "Per favore", ipa: "/per fa.ˈvo.re/", word: "Per favore" },
            { pattern: "Scusa", ipa: "/ˈsku.za/", word: "Scusa" },
            { pattern: "Prego", ipa: "/ˈprɛ.ɡo/", word: "Prego" }
          ]
        }
      ],
      vocab: ['Per favore', 'Grazie mille', 'Scusa', 'Prego'],
      cando:'Sa usare frasi di cortesia di base',
      hw:'Usare tre frasi di cortesia domani' }
  ]
},
{
  id:'u1', num:1, color:'#3B82F6', label:'La mia vita oggi',
  arc:'Presentazioni → Lavoro → Casa → Soldi → Salute → Tecnologia → Tempo libero',
  lessons_count:10,
  grammar_summary:[
    {name:'Essere & Avere (presente)', desc:'I due verbi fondamentali', ex:'"Io sono italiano. Io ho fame."', ref:'grammar-reference.html'},
    {name:'Articoli determinativi & indeterminativi', desc:'Il, lo, la... vs un, uno, una...', ex:'"Il caffè, un gelato."', ref:'grammar-reference.html'},
    {name:'Sostantivi & Adgettivi', desc:'Genere (m/f) e numero (s/p)', ex:'"Un ragazzo alto, una ragazza alta."', ref:'grammar-reference.html'},
    {name:'Presente indicativo (verbi in -ARE)', desc:'Il primo gruppo regolare', ex:'"Io parlo italiano."', ref:'grammar-reference.html'},
    {name:'Negazione semplice', desc:'"Non" prima del verbo', ex:'"Non parlo inglese."', ref:'grammar-reference.html'},
  ],
  vocab_themes:['Saluti','Lavoro','Casa','Soldi','Salute','Tecnologia','Hobby'],
  lessons:[
    { code:'IT-01', num:1, title:'Buongiorno, mi chiamo...',
      grammar:'Presente di ESSERE + pronomi personali',
      pronunciation: [
        {
          point: "The Italian Alphabet & Vowels",
          explain: "Italian vowels are always clear and short. There are no diphthongs like in English.",
          examples: [
            { pattern: "A", ipa: "/a/", word: "casa" },
            { pattern: "E", ipa: "/e/", word: "mela" },
            { pattern: "I", ipa: "/i/", word: "bici" },
            { pattern: "O", ipa: "/o/", word: "notte" },
            { pattern: "U", ipa: "/u/", word: "uva" }
          ],
          tip: "Open your mouth more than you do in English for 'A'.",
          extension: "In English, vowels like 'A' often have two sounds combined (a diphthong). In Italian, 'A' is just 'A', pure and simple. Keep it short!",
          visual: "👄"
        }
      ],
      vocab: ['Buongiorno', 'Ciao', 'Grazie', 'Per favore', 'Piacere'],
      verbs:['essere','chiamarsi'],
      adj:['italiano','americano'],
      speaking:'Presentarsi e salutare in classe',
      listening:'Tre persone si presentano',
      reading:'Un breve dialogo di presentazione',
      writing:'Scrivere la propria presentazione (4 frasi)',
      task:'Speed dating di presentazione',
      cando:'Può presentarsi e salutare con cortesia',
      hw:'Imparare i numeri da 1 a 20' },
    { code:'IT-02', num:2, title:'Il mio lavoro — cosa faccio',
      grammar:'Presente di AVERE + articoli indeterminativi',
      pronunciation: [
        {
          point: "Hard and Soft 'C'",
          explain: "'C' is soft (ch) before E and I, but hard (k) before A, O, U.",
          examples: [
            { pattern: "ce", ipa: "/ˈtʃe.na/", word: "cena" },
            { pattern: "ca", ipa: "/ˈka.za/", word: "casa" },
            { pattern: "chi", ipa: "/ˈkjan.ti/", word: "chianti" }
          ],
          tip: "Add an 'H' to keep the 'K' sound before E or I.",
          extension: "La pronuncia della 'C' è uno dei pilastri della fonetica italiana. Ricorda: C + H = Suono Duro (K).",
          visual: "🍕"
        }
      ],
      vocab: ['lavoro', 'ufficio', 'collega', 'stipendio', 'computer'],
      verbs:['avere','lavorare'],
      adj:['occupato','libero'],
      speaking:'Descrivere il proprio lavoro e gli strumenti',
      listening:'Descrizioni di vari mestieri',
      reading:'Un annuncio di lavoro semplice',
      writing:'Descrivere il proprio lavoro in 5 frasi',
      task:'Indovinare il lavoro del compagno',
      cando:'Può parlare della propria professione',
      hw:'Elencare 10 oggetti dell\'ufficio' },
    { code:'IT-03', num:3, title:'Dove vivo — la mia casa',
      grammar:'Verbi in -ARE (abitare) + preposizioni di luogo',
      pronunciation: [
        {
          point: "GLI and GN",
          explain: "Special sounds that require specific tongue placement.",
          examples: [
            { pattern: "gli", ipa: "/ʎi/", word: "famiglia" },
            { pattern: "gn", ipa: "/ɲ/", word: "bagno" }
          ],
          extension: "Il suono 'GN' è simile alla 'ñ' spagnola. Il suono 'GLI' è unico: appoggia la lingua al palato e lascia uscire l'aria dai lati.",
          visual: "🍝"
        }
      ],
      vocab: ['appartamento','casa','città','via','piano'],
      verbs:['abitare','vivere'],
      adj:['grande','piccolo','bello'],
      speaking:'Descrivere la propria casa e la zona',
      listening:'Una persona descrive il suo quartiere',
      reading:'Un annuncio immobiliare',
      writing:'Scrivere l\'indirizzo e descrivere la casa',
      task:'Disegnare la pianta della casa e spiegarla',
      cando:'Può descrivere dove abita',
      hw:'Vocabolario delle stanze della casa' },
    { code:'IT-04', num:4, title:'La mia famiglia',
      grammar:'Aggettivi possessivi (mio, tuo, suo)',
      vocab: ['padre','madre','fratello','sorella','figlio'],
      verbs:['avere','volere bene'],
      adj:['sposato','single'],
      speaking:'Presentare la famiglia con delle foto',
      listening:'Un uomo parla della sua famiglia numerosa',
      reading:'Un albero genealogico commentato',
      writing:'Un paragrafo sulla propria famiglia',
      task:'Trovare somiglianze familiari nel gruppo',
      cando:'Può presentare i membri della famiglia',
      hw:'Fare il proprio albero genealogico' },
    { code:'IT-05', num:5, title:'Quanto costa? (Soldi)',
      grammar:'Numeri fino a 100 + interrogativi (Quanto?)',
      vocab: ['prezzo','soldi','carta','contanti','caro','economico'],
      verbs:['pagare','comprare','costare'],
      adj:['caro','gratis'],
      speaking:'Fare acquisti in un negozio finto',
      listening:'Dialogo alla cassa del supermercato',
      reading:'Uno scontrino e dei prezzi',
      writing:'Fare una lista della spesa con i prezzi',
      task:'Role-play al mercato',
      cando:'Sa fare acquisti di base',
      hw:'Memorizzare i numeri fino a 100' },
    { code:'IT-06', num:6, title:'Al ristorante — cibo e bevande',
      grammar:'Articoli determinativi (ripasso) + Vorrei...',
      vocab: ['pane','caffè','acqua','vino','pizza','piatto'],
      verbs:['mangiare','bere','ordinare'],
      adj:['buono','caldo','freddo'],
      speaking:'Ordinare al ristorante',
      listening:'Un\'ordinazione al bar',
      reading:'Un menù di una trattoria',
      writing:'Scrivere la propria ordinazione ideale',
      task:'Ordinare una colazione completa',
      cando:'Sa ordinare da mangiare e da bere',
      hw:'Imparare 10 nomi di alimenti' },
    { code:'IT-07', num:7, title:'Salute e corpo umano',
      grammar:'Espressione "Avere male a..."',
      vocab: ['testa','schiena','pancia','medico','medicina'],
      verbs:['dormire','camminare','stare male'],
      adj:['stanco','malato','in forma'],
      speaking:'Spiegare i sintomi al medico',
      listening:'Una visita medica semplice',
      reading:'Una ricetta medica',
      writing:'Scrivere un messaggio di assenza per malattia',
      task:'Role-play: dal dottore',
      cando:'Esprimere un dolore fisico semplice',
      hw:'Parti del corpo umano' },
    { code:'IT-08', num:8, title:'Vita digitale',
      grammar:'Verbi in -ERE e -IRE al presente',
      vocab: ['telefono','internet','social','email','schermo'],
      verbs:['usare','leggere','scrivere','aprire'],
      adj:['veloce','lento','utile'],
      speaking:'Parlare dell\'uso dello smartphone',
      listening:'Intervista sulle abitudini digitali',
      reading:'Un post sui social media',
      writing:'Descrivere la propria routine digitale',
      task:'Dibattito: smartphone sì o no?',
      cando:'Parlare delle proprie abitudini tecnologiche',
      hw:'Tradurre 5 frasi sulla tecnologia' },
    { code:'IT-09', num:9, title:'Hobby e tempo libero',
      grammar:'Verbo FARE + attività del tempo libero',
      vocab: ['sport','musica','cinema','viaggio','lettura'],
      verbs:['fare','andare','uscire','divertirsi'],
      adj:['divertente','noioso','interessante'],
      speaking:'Condividere le attività del weekend',
      listening:'Persone che parlano dei propri hobby',
      reading:'Un programma culturale cittadino',
      writing:'Descrivere il proprio hobby preferito',
      task:'Trovare un compagno con lo stesso hobby',
      cando:'Sa parlare dei propri interessi',
      hw:'Scrivere 5 frasi sui propri gusti' },
    { code:'IT-10', num:10, title:'Revisione Unità 1',
      grammar:'Riepilogo presente, articoli e possessivi',
      vocab: ['Tutto il lessico dell\'Unità 1'],
      verbs:['Essere','Avere','Fare','Verbi regolari'],
      adj:['Concordanza genere/numero'],
      speaking:'Test orale di 3 minuti su se stessi',
      listening:'Test di comprensione Unità 1',
      reading:'Profilo di uno studente italiano',
      writing:'Scrivere la propria biografia (A1)',
      task:'Intervista di personalità',
      cando:'Conosce le basi per comunicare in italiano',
      hw:'Preparare il portfolio Unità 1' },
  ]
},
{
  id:'u2', num:2, color:'#8B5CF6', label:'Il mio passato',
  arc:'Ricordi → Studi → Viaggi → Cambiamenti → Racconti',
  lessons_count:10,
  grammar_summary:[
    {name:'Passato Prossimo (con avere)', desc:'Azioni concluse nel passato', ex:'"Ho mangiato una pizza."', ref:'grammar-reference.html'},
    {name:'Passato Prossimo (con essere)', desc:'Verbi di movimento e riflessivi', ex:'"Sono andato al mare."', ref:'grammar-reference.html'},
    {name:'Imperfetto (introduzione)', desc:'Descrizioni e abitudini passate', ex:'"Quando ero piccolo..."', ref:'grammar-reference.html'},
  ],
  vocab_themes:['Ricordi','Istruzione','Viaggi','Tempo'],
  lessons:[
    { code:'IT-11', num:1, title:'Ieri ho fatto...', grammar:'Passato prossimo (AVERE)', lessons_count:1 },
    { code:'IT-12', num:2, title:'I miei studi', grammar:'Passato prossimo (regolari/irregolari)', lessons_count:1 },
    { code:'IT-13', num:3, title:'Il mio ultimo viaggio', grammar:'Passato prossimo (ESSERE)', lessons_count:1 },
    { code:'IT-14', num:4, title:'Com\'ero da bambino', grammar:'Imperfetto descrittivo', lessons_count:1 },
    { code:'IT-15', num:5, title:'I miei vecchi lavori', grammar:'Passato prossimo vs Imperfetto', lessons_count:1 },
    { code:'IT-16', num:6, title:'Dieci anni fa...', grammar:'Espressioni di tempo passato', lessons_count:1 },
    { code:'IT-17', num:7, title:'Un giorno speciale', grammar:'Narrazione al passato', lessons_count:1 },
    { code:'IT-18', num:8, title:'Vecchie abitudini', grammar:'Imperfetto per abitudine', lessons_count:1 },
    { code:'IT-19', num:9, title:'Cosa hanno detto?', grammar:'Discorso indiretto semplice', lessons_count:1 },
    { code:'IT-20', num:10, title:'Revisione Unità 2', grammar:'Bilan Passato', lessons_count:1 },
  ]
},
{
  id:'u3', num:3, color:'#10B981', label:'Il mio futuro',
  arc:'Futuro → Progetti → Meteo → Ipotesi',
  lessons_count:10,
  grammar_summary:[
    {name:'Futuro Semplice', desc:'Progetti e previsioni', ex:'"L\'anno prossimo andrò in Italia."', ref:'grammar-reference.html'},
    {name:'Periodo ipotetico (1° tipo)', desc:'Se + Presente, Futuro', ex:'"Se piove, non esco."', ref:'grammar-reference.html'},
  ],
  vocab_themes:['Progetti','Pianificazione','Ambiente'],
  lessons:[
    { code:'IT-21', num:1, title:'Cosa farai?', grammar:'Futur semplice', lessons_count:1 },
    { code:'IT-22', num:2, title:'I miei sogni', grammar:'Futuro semplice', lessons_count:1 },
    { code:'IT-23', num:3, title:'Il meteo di domani', grammar:'Previsioni', lessons_count:1 },
    { code:'IT-24', num:4, title:'Se avrò tempo...', grammar:'Periodo ipotetico', lessons_count:1 },
    { code:'IT-25', num:5, title:'Organizzare un evento', grammar:'Programmare', lessons_count:1 },
    { code:'IT-26', num:6, title:'L\'Italia nel 2030', grammar:'Previsioni sociali', lessons_count:1 },
    { code:'IT-27', num:7, title:'Promesse e buoni propositi', grammar:'Intenzioni', lessons_count:1 },
    { code:'IT-28', num:8, title:'Verbi modali al futuro', grammar:'Potere, Volere, Dovere', lessons_count:1 },
    { code:'IT-29', num:9, title:'Pianificare un viaggio', grammar:'Logistica', lessons_count:1 },
    { code:'IT-30', num:10, title:'Revisione Unità 3', grammar:'Bilan Futuro', lessons_count:1 },
  ]
},
{
  id:'u4', num:4, color:'#F59E0B', label:'Il mio mondo',
  arc:'Opinioni → Confronti → Relatività → Cultura',
  lessons_count:10,
  grammar_summary:[
    {name:'Comparativi', desc:'Più/meno... di/che', ex:'"La pizza è più buona della pasta."', ref:'grammar-reference.html'},
    {name:'Superlativi', desc:'Il più... / Buonissimo', ex:'"Il film è bellissimo."', ref:'grammar-reference.html'},
    {name:'Pronomi relativi (che, cui)', desc:'Unire le frasi', ex:'"La persona che lavora con me."', ref:'grammar-reference.html'},
  ],
  vocab_themes:['Società','Città','Cultura','Pareri'],
  lessons:[
    { code:'IT-31', num:1, title:'Meglio o peggio?', grammar:'Comparativi', lessons_count:1 },
    { code:'IT-32', num:2, title:'Il posto più bello', grammar:'Superlativi', lessons_count:1 },
    { code:'IT-33', num:3, title:'Secondo me... (Opinioni)', grammar:'Espressioni di parere', lessons_count:1 },
    { code:'IT-34', num:4, title:'La persona che ammiro', grammar:'Pronomi relativi', lessons_count:1 },
    { code:'IT-35', num:5, title:'Cose che non sopporto', grammar:'Esprimere fastidio', lessons_count:1 },
    { code:'IT-36', num:6, title:'Tradizioni italiane', grammar:'Cultura', lessons_count:1 },
    { code:'IT-37', num:7, title:'Abitudini a tavola', grammar:'Cultura gastronomica', lessons_count:1 },
    { code:'IT-38', num:8, title:'Vivere in città', grammar:'Luoghi e servizi', lessons_count:1 },
    { code:'IT-39', num:9, title:'Ecologia e ambiente', grammar:'Problemi globali', lessons_count:1 },
    { code:'IT-40', num:10, title:'Revisione Unità 4', grammar:'Bilan Opinioni', lessons_count:1 },
  ]
},
{
  id:'u5', num:5, color:'#EC4899', label:'Padronanza',
  arc:'Conversazione → Consolidamento → Prova finale',
  lessons_count:10,
  grammar_summary:[
    {name:'Revisione A1', desc:'Sintesi finale di tutte le strutture', ex:'Simulazione conversazione reale', ref:'grammar-reference.html'},
    {name:'Connettori testuali', desc:'Ma, quindi, perché, allora', ex:'"Studio perché voglio imparare."', ref:'grammar-reference.html'},
  ],
  vocab_themes:['Sintesi','Dialogo','Fluidità'],
  lessons:[
    { code:'IT-41', num:1, title:'Parliamo di lavoro', grammar:'Conversazione', lessons_count:1 },
    { code:'IT-42', num:2, title:'Raccontare una storia lunga', grammar:'Narrazione', lessons_count:1 },
    { code:'IT-43', num:3, title:'Situazioni formali/informali', grammar:'Registri', lessons_count:1 },
    { code:'IT-44', num:4, title:'Leggere le notizie', grammar:'Comprensione media', lessons_count:1 },
    { code:'IT-45', num:5, title:'Espressioni idiomatiche', grammar:'Slang/Modi di dire', lessons_count:1 },
    { code:'IT-46', num:6, title:'Preparazione esame orale', grammar:'Fluidità', lessons_count:1 },
    { code:'IT-47', num:7, title:'Revisione Grammatica A1', grammar:'Sintesi', lessons_count:1 },
    { code:'IT-48', num:8, title:'Revisione Vocabolario A1', grammar:'Sintesi', lessons_count:1 },
    { code:'IT-49', num:9, title:'Simulazione Test A1', grammar:'Valutazione', lessons_count:1 },
    { code:'IT-50', num:10, title:'Bilan finale e futuro', grammar:'Valutazione', lessons_count:1 },
  ]
}
];
