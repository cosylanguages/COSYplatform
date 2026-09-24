if(!window.curriculumData) window.curriculumData = {};
window.curriculumData.el_c1 = [
{
  id:'u1', num:1, label:'Advanced Content',
  lessons: [
    {
      title: "Advanced Register", subtitle: "C1 vocabulary and grammar targets",
      skills: ["grammar", "vocab", "writing"], desc: "The specific grammar and vocabulary ranges that separate B2 from C1 in the exam marking criteria.", duration: "120 min", practiceTheme: "Advanced",
      grammar: [
        {
          point: "Nominalisation (verbal nouns)", tag: "C1 style",
          explain: "Advanced French uses nouns derived from verbs to make writing more concise and formal. This is a key C1 exam marker.",
          rule: "verb → noun: décider → la décision · analyser → l'analyse · développer → le développement",
          examples: [{ t: "Ils ont décidé de partir. → La décision de partir…", e: "They decided to leave → The decision to leave…" }, { t: "On a analysé les résultats. → L'analyse des résultats…", e: "They analysed results → The analysis of results…" }],
          tip: "💡 Nominalisations are essential in formal writing. Practise converting full sentences.",
          practiceTheme: "Advanced",
        },
      ],
      vocab: [{
        group: "C1 academic phrases", words: [
          { w: "force est de constater que", phon: "", trans: "one must acknowledge that", key: true },
          { w: "il convient de souligner", phon: "", trans: "it is worth emphasising", key: true },
          { w: "à cet égard", phon: "", trans: "in this regard", key: false },
          { w: "dans la mesure où", phon: "", trans: "insofar as", key: true },
          { w: "quoi qu'il en soit", phon: "", trans: "be that as it may", key: true },
        ]
      }],
    },
  ]
}
];
