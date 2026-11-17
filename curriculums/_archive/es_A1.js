if(!window.curriculumData) window.curriculumData = {};
window.curriculumData.es_a1 = [
{
  id:'u0', num:0, color:'#10B981', label:'Unidad 0: Primeros Pasos (A0)',
  arc:'Saludos → El Alfabeto → Números 1-20 → Pronunciación Básica',
  lessons_count:5,
  lessons:[
    { code:'ES-001', num:1, title:'Hola & Bienvenidos',
      grammar:'Verbo "ser" (presente) — formas afirmativas',
      pronunciation: [
        {
          point: "El Alfabeto Español",
          explain: "El español tiene 27 letras. La 'ñ' es única en nuestro alfabeto.",
          alphabet: [
            {l:'A a', ipa:'/a/'}, {l:'B b', ipa:'/be/'}, {l:'C c', ipa:'/θe/'}, {l:'D d', ipa:'/de/'}, {l:'E e', ipa:'/e/'},
            {l:'F f', ipa:'/efe/'}, {l:'G g', ipa:'/xe/'}, {l:'H h', ipa:'/atʃe/'}, {l:'I i', ipa:'/i/'}, {l:'J j', ipa:'/xota/'},
            {l:'K k', ipa:'/ka/'}, {l:'L l', ipa:'/ele/'}, {l:'M m', ipa:'/eme/'}, {l:'N n', ipa:'/ene/'}, {l:'Ñ ñ', ipa:'/eɲe/'},
            {l:'O o', ipa:'/o/'}, {l:'P p', ipa:'/pe/'}, {l:'Q q', ipa:'/ku/'}, {l:'R r', ipa:'/ere/'}, {l:'S s', ipa:'/ese/'},
            {l:'T t', ipa:'/te/'}, {l:'U u', ipa:'/u/'}, {l:'V v', ipa:'/ube/'}, {l:'W w', ipa:'/ube doble/'}, {l:'X x', ipa:'/ekis/'},
            {l:'Y y', ipa:'/i griega/'}, {l:'Z z', ipa:'/θeta/'}
          ],
          extension: "El español es un idioma con una correspondencia casi perfecta entre letras y sonidos. ¡Si sabes cómo se escribe, sabes cómo se pronuncia!",
          visual: "🇪🇸🔤"
        }
      ],
      vocab:[
        {w:'Hola', emoji:'👋', trans:'Hello'},
        {w:'Buenos días', emoji:'🌅', trans:'Good morning'},
        {w:'Gracias', emoji:'🙏', trans:'Thank you'},
        {w:'Por favor', emoji:'🥺', trans:'Please'},
        {w:'Adiós', emoji:'👋', trans:'Goodbye'}
      ],
      cando:'Can greet people and say goodbye',
      hw:'Learn the alphabet and the sound of Ñ' },
    { code:'ES-002', num:2, title:'¿Cómo te llamas?',
      grammar:'Verbo "llamarse" (presente)',
      pronunciation: [
        {
          point: "Letras Especiales: LL, RR, H",
          explain: "En español, 'll' suena como 'y', 'rr' es vibrante, y la 'h' es siempre muda.",
          examples: [
            { pattern: "ll", ipa: "/ʝ/", word: "calle" },
            { pattern: "rr", ipa: "/r/", word: "perro" },
            { pattern: "h", ipa: "-", word: "hola" }
          ],
          tip: "¡Nunca pronuncies la H en español!",
          extension: "La 'rr' requiere que la lengua vibre contra el paladar. La 'h' es puramente decorativa en la pronunciación moderna.",
          visual: "🐕"
        }
      ],
      vocab:[
        {w:'Nombre', emoji:'🆔', trans:'Name'},
        {w:'¿Cómo?', emoji:'❓', trans:'How?'},
        {w:'Mucho gusto', emoji:'🤝', trans:'Nice to meet you'}
      ],
      cando:'Can introduce themselves',
      hw:'Practice spelling your name in Spanish' },
    { code:'ES-003', num:3, title:'Números 1-20',
      grammar:'Género de los sustantivos (introducción)',
      pronunciation: [
        {
          point: "Acento Prosódico",
          explain: "La mayoría de las palabras que terminan en vocal llevan el acento en la penúltima sílaba.",
          examples: [
            { pattern: "uno", ipa: "/ˈu.no/", word: "uno" },
            { pattern: "siete", ipa: "/ˈsje.te/", word: "siete" },
            { pattern: "once", ipa: "/ˈon.θe/", word: "once" }
          ]
        }
      ],
      vocab:[
        {w:'uno', emoji:'1️⃣', trans:'one'},
        {w:'dos', emoji:'2️⃣', trans:'two'},
        {w:'tres', emoji:'3️⃣', trans:'three'},
        {w:'diez', emoji:'🔟', trans:'ten'},
        {w:'veinte', emoji:'2️⃣0️⃣', trans:'twenty'}
      ],
      cando:'Can count from 1 to 20',
      hw:'Count objects in your house in Spanish' },
    { code:'ES-004', num:4, title:'Pares Mínimos: C, Z, S',
      grammar:'Estructura básica de la oración',
      pronunciation: [
        {
          point: "El Sonido /θ/ (Z y C)",
          explain: "En España, la 'z' y la 'c' (ante e, i) se pronuncian con la lengua entre los dientes.",
          minimalPairs: [
            { w1: "casa", p1: "/ˈka.sa/", w2: "caza", p2: "/ˈka.θa/" },
            { w1: "siento", p1: "/ˈsjen.to/", w2: "ciento", p2: "/ˈθjen.to/" },
            { w1: "cocer", p1: "/ko.ˈθer/", w2: "coser", p2: "/ko.ˈser/" }
          ],
          extension: "Esta distinción es típica del español de España (Castellano). En gran parte de Latinoamérica, 's', 'c' y 'z' se pronuncian igual (/s/), lo que se llama 'seseo'.",
          visual: "👅"
        }
      ],
      vocab:[
        {w:'casa', emoji:'🏠', trans:'house'},
        {w:'caza', emoji:'🏹', trans:'hunting'},
        {w:'ciento', emoji:'💯', trans:'hundred'}
      ],
      cando:'Can distinguish between S and Z/C sounds',
      hw:'Record yourself saying "casa" and "caza"' },
    { code:'ES-005', num:5, title:'Frases de Cortesía',
      grammar:'Peticiones amables (Por favor, Gracias)',
      pronunciation: [
        {
          point: "Entonación de Preguntas",
          explain: "En español, las preguntas tienen una entonación ascendente marcada.",
          examples: [
            { pattern: "¿Cómo estás?", ipa: "/ˈko.mo es.ˈtas?/", word: "¿Cómo estás?" },
            { pattern: "¿Qué tal?", ipa: "/ˈke ˈtal?/", word: "¿Qué tal?" }
          ]
        }
      ],
      vocab:[
        {w:'Perdón', emoji:'🙋', trans:'Excuse me'},
        {w:'Lo siento', emoji:'🙇', trans:'Sorry'},
        {w:'Sí', emoji:'✅', trans:'Yes'},
        {w:'No', emoji:'❌', trans:'No'}
      ],
      cando:'Can use basic polite phrases',
      hw:'Use three polite phrases tomorrow' }
  ]
},
{
  id:'u1', num:1, color:'#3B82F6', label:'Unidad 1: Mi Vida Diaria',
  arc:'Presentaciones → Trabajo → Casa → Comida → Salud → Tecnología → Tiempo Libre',
  lessons_count:10,
  lessons:[
    { code:'ES-01', num:1, title:'Hola, soy...',
      grammar:'Verbo ser vs estar (introducción)',
      pronunciation: [
        {
          point: "La letra G",
          explain: "La 'g' tiene un sonido suave (gato) y un sonido fuerte (gente).",
          examples: [
            { pattern: "ga, go, gu", ipa: "/g/", word: "gato" },
            { pattern: "ge, gi", ipa: "/x/", word: "gente" }
          ]
        }
      ],
      vocab:[
        {w:'estudiante', emoji:'👨‍🎓', trans:'student'},
        {w:'profesor', emoji:'👨‍🏫', trans:'teacher'},
        {w:'español', emoji:'🇪🇸', trans:'Spanish'}
      ],
      cando:'Can introduce themselves and their profession',
      hw:'Write 3 sentences about yourself using "ser"' },
    { code:'ES-02', num:2, title:'Mi trabajo y oficina',
      grammar:'Verbo tener + artículos indeterminados',
      pronunciation: [
        {
          point: "La letra C",
          explain: "La 'c' suena como 'k' ante a, o, u, y como 'θ' (en España) ante e, i.",
          examples: [
            { pattern: "ca, co, cu", ipa: "/k/", word: "casa" },
            { pattern: "ce, ci", ipa: "/θ/", word: "cena" }
          ],
          tip: "¡Recuerda! 'Que, qui' suena como 'ke, ki'.",
          visual: "🏠🍴"
        }
      ]
    },
    { code:'ES-03', num:3, title:'Mi casa y barrio',
      grammar:'Estar + preposiciones de lugar',
      pronunciation: [
        {
          point: "La letra J y G fuerte",
          explain: "La 'j' y la 'g' (ante e, i) tienen un sonido fuerte desde la garganta.",
          examples: [
            { pattern: "j", ipa: "/x/", word: "jardín" },
            { pattern: "ge, gi", ipa: "/x/", word: "gimnasio" }
          ],
          extension: "Este sonido es muy característico del español. Imagina que estás limpiando tus gafas con el aliento.",
          visual: "😤"
        }
      ]
    },
    { code:'ES-04', num:4, title:'Mi familia',
      grammar:'Adjetivos posesivos',
      pronunciation: [
        {
          point: "La letra V vs B",
          explain: "En español, la 'v' y la 'b' se pronuncian exactamente igual.",
          minimalPairs: [
            { w1: "vaca", p1: "/ˈba.ka/", w2: "baca", p2: "/ˈba.ka/" },
            { w1: "vino", p1: "/ˈbi.no/", w2: "pino", p2: "/ˈpi.no/" }
          ],
          tip: "No muerdas el labio para la 'v'; usa ambos labios como con la 'b'.",
          visual: "👄"
        }
      ]
    }
  ]
}
];
