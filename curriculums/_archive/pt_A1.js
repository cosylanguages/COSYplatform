if(!window.curriculumData) window.curriculumData = {};
window.curriculumData.pt_a1 = [
{
  id:'u0', num:0, color:'#10B981', label:'Unidade 0: Primeiros Passos (A0)',
  arc:'Saudações → O Alfabeto → Números 1-20 → Pronúncia Básica',
  lessons_count:5,
  lessons:[
    { code:'PT-001', num:1, title:'Olá & Bem-vindos',
      grammar:'Verbo "ser" (presente) — formas afirmativas',
      pronunciation: [
        {
          point: "O Alfabeto Português",
          explain: "O alfabeto português tem 26 letras. Atenção aos acentos e ao til (~).",
          alphabet: [
            {l:'A a', ipa:'/a/'}, {l:'B b', ipa:'/be/'}, {l:'C c', ipa:'/se/'}, {l:'D d', ipa:'/de/'}, {l:'E e', ipa:'/ɛ/'},
            {l:'F f', ipa:'/ɛfe/'}, {l:'G g', ipa:'/ʒe/'}, {l:'H h', ipa:'/aɡa/'}, {l:'I i', ipa:'/i/'}, {l:'J j', ipa:'/ʒɔta/'},
            {l:'K k', ipa:'/ka/'}, {l:'L l', ipa:'/ɛle/'}, {l:'M m', ipa:'/ɛme/'}, {l:'N n', ipa:'/ɛne/'}, {l:'O o', ipa:'/ɔ/'},
            {l:'P p', ipa:'/pe/'}, {l:'Q q', ipa:'/ke/'}, {l:'R r', ipa:'/ɛʁe/'}, {l:'S s', ipa:'/ɛse/'}, {l:'T t', ipa:'/te/'},
            {l:'U u', ipa:'/u/'}, {l:'V v', ipa:'/ve/'}, {l:'W w', ipa:'/dabliu/'}, {l:'X x', ipa:'/ʃis/'}, {l:'Y y', ipa:'/ipsilɔn/'}, {l:'Z z', ipa:'/ze/'}
          ],
          extension: "O português é falado em muitos países, e existem diferenças de pronúncia entre o Brasil e Portugal. Aqui focamos na base comum e clara.",
          visual: "🇵🇹🔤"
        }
      ],
      vocab:[
        {w:'Olá', emoji:'👋', trans:'Hello'},
        {w:'Bom dia', emoji:'🌅', trans:'Good morning'},
        {w:'Obrigado', emoji:'🙏', trans:'Thank you (m)'},
        {w:'Por favor', emoji:'🥺', trans:'Please'},
        {w:'Adeus', emoji:'👋', trans:'Goodbye'}
      ],
      cando:'Can greet people and say goodbye',
      hw:'Learn the alphabet and the nasal sounds' },
    { code:'PT-002', num:2, title:'Como se chama?',
      grammar:'Verbo "chamar-se" (presente)',
      pronunciation: [
        {
          point: "Sons Nasais e o Til (~)",
          explain: "O til indica que o som deve sair pelo nariz.",
          examples: [
            { pattern: "ão", ipa: "/ɐ̃w̃/", word: "pão" },
            { pattern: "ã", ipa: "/ɐ̃/", word: "manhã" },
            { pattern: "ões", ipa: "/õj̃s/", word: "lições" }
          ],
          tip: "Pense no som do sino: 'tão, tão'.",
          extension: "Os sons nasais são uma das características mais marcantes do português. É o que dá à língua o seu som melódico único.",
          visual: "👃"
        }
      ],
      vocab:[
        {w:'Nome', emoji:'🆔', trans:'Name'},
        {w:'Como?', emoji:'❓', trans:'How?'},
        {w:'Muito prazer', emoji:'🤝', trans:'Nice to meet you'}
      ],
      cando:'Can introduce themselves',
      hw:'Practice spelling your name in Portuguese' },
    { code:'PT-003', num:3, title:'Números 1-20',
      grammar:'Género dos nomes (masculino e feminino)',
      pronunciation: [
        {
          point: "Sons de 'S' e 'Z'",
          explain: "O 's' entre vogais soa como 'z'.",
          examples: [
            { pattern: "casa", ipa: "/ˈka.zɐ/", word: "casa" },
            { pattern: "mesa", ipa: "/ˈme.zɐ/", word: "mesa" },
            { pattern: "rosa", ipa: "/ˈʁɔ.zɐ/", word: "rosa" }
          ]
        }
      ],
      vocab:[
        {w:'um', emoji:'1️⃣', trans:'one'},
        {w:'dois', emoji:'2️⃣', trans:'two'},
        {w:'três', emoji:'3️⃣', trans:'three'},
        {w:'dez', emoji:'🔟', trans:'ten'},
        {w:'vinte', emoji:'2️⃣0️⃣', trans:'twenty'}
      ],
      cando:'Can count from 1 to 20',
      hw:'Count from 1 to 20 in Portuguese while showering' },
    { code:'PT-004', num:4, title:'Dígrafos: LH, NH, CH',
      grammar:'Estrutura básica da frase em português',
      pronunciation: [
        {
          point: "Dígrafos LH, NH, CH",
          explain: "Estes pares de letras criam sons específicos.",
          minimalPairs: [
            { w1: "filha", p1: "/ˈfi.ʎɐ/", w2: "fila", p2: "/ˈfi.lɐ/" },
            { w1: "banho", p1: "/ˈba.ɲu/", w2: "bano", p2: "/ˈba.nu/" },
            { w1: "chave", p1: "/ˈʃa.ve/", w2: "chá", p2: "/ʃa/" }
          ],
          extension: "LH soa como 'li' em 'milhão'. NH soa como 'ni' em 'ninho'. CH soa como 'sh' em 'show'.",
          visual: "🇵🇹"
        }
      ],
      vocab:[
        {w:'filha', emoji:'👧', trans:'daughter'},
        {w:'banho', emoji:'🚿', trans:'bath'},
        {w:'chave', emoji:'🔑', trans:'key'}
      ],
      cando:'Can pronounce LH and NH sounds correctly',
      hw:'Record yourself saying "filha" and "banho"' },
    { code:'PT-005', num:5, title:'Frases Essenciais',
      grammar:'Pedidos educados (Por favor, Com licença)',
      pronunciation: [
        {
          point: "Acento Tónico",
          explain: "Em português, a maioria das palavras é paroxítona (acento na penúltima sílaba).",
          examples: [
            { pattern: "por favor", ipa: "/puɾ fɐ.ˈvoɾ/", word: "por favor" },
            { pattern: "obrigado", ipa: "/u.bɾi.ˈɡa.du/", word: "obrigado" }
          ]
        }
      ],
      vocab:[
        {w:'Desculpe', emoji:'🙋', trans:'Excuse me'},
        {w:'Sinto muito', emoji:'🙇', trans:'Sorry'},
        {w:'Sim', emoji:'✅', trans:'Yes'},
        {w:'Não', emoji:'❌', trans:'No'}
      ],
      cando:'Can use basic polite phrases',
      hw:'Use three polite phrases tomorrow in Portuguese' }
  ]
},
{
  id:'u1', num:1, color:'#3B82F6', label:'Unidade 1: A Minha Vida',
  arc:'Apresentação → Trabalho → Casa → Saúde → Tecnologia → Lazer',
  lessons_count:10,
  lessons:[
    { code:'PT-01', num:1, title:'Olá, eu sou...',
      grammar:'Verbos "ser" e "estar" (presente)',
      pronunciation: [
        {
          point: "Redução Vocálica",
          explain: "Em Portugal, as vogais átonas são muitas vezes reduzidas ou quase desaparecem.",
          examples: [
            { pattern: "excelente", ipa: "/ɐj.sə.ˈlẽ.tə/", word: "excelente" },
            { pattern: "português", ipa: "/puɾ.tu.ˈɡeʃ/", word: "português" }
          ],
          extension: "Esta redução é a principal diferença entre o português de Portugal (mais 'fechado') e o do Brasil (mais 'aberto'). Ouvir estas diferenças ajuda muito na compreensão auditiva.",
          visual: "📉"
        }
      ],
      vocab:[
        {w:'estudante', emoji:'👨‍🎓', trans:'student'},
        {w:'professor', emoji:'👨‍🏫', trans:'teacher'},
        {w:'português', emoji:'🇵🇹', trans:'Portuguese'}
      ],
      cando:'Can introduce themselves and use basic verbs',
      hw:'Write a small intro about yourself in Portuguese' },
    { code:'PT-02', num:2, title:'O meu trabalho',
      grammar:'Verbo ter + artigos indefinidos',
      pronunciation: [
        {
          point: "O som do 'X'",
          explain: "A letra 'x' pode ter vários sons em português: 'sh', 'z', 'ks' ou 's'.",
          examples: [
            { pattern: "sh", ipa: "/ʃ/", word: "caixa" },
            { pattern: "z", ipa: "/z/", word: "exame" },
            { pattern: "ks", ipa: "/ks/", word: "táxi" }
          ],
          tip: "Não há uma regra fixa, é preciso aprender caso a caso!",
          visual: "✖️"
        }
      ]
    },
    { code:'PT-03', num:3, title:'A minha casa',
      grammar:'Verbos de lugar + preposições',
      pronunciation: [
        {
          point: "O 'R' vibrante e o 'RR'",
          explain: "O 'r' no início da palavra ou o 'rr' no meio é forte e vem da garganta.",
          examples: [
            { pattern: "r-", ipa: "/ʁ/", word: "rua" },
            { pattern: "rr", ipa: "/ʁ/", word: "carro" }
          ],
          extension: "Em Portugal, este som é muitas vezes produzido na úvula, de forma semelhante ao 'r' francês ou alemão.",
          visual: "🦁"
        }
      ]
    }
  ]
}
];
