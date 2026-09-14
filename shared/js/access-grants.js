/**
 * COSYlanguages Shared Access Grant Resolution Helper
 * Evaluates grant objects against course manifests dynamically.
 */

window.CosyAccessGrants = window.CosyAccessGrants || {};

/**
 * Full Platform Course Manifest
 * Generated dynamically from all curriculums across all languages and levels.
 */
window.CosyAccessGrants.FULL_MANIFEST = [
  {
    "id": "general-ba-a1",
    "title": "General BA A1",
    "track": "General",
    "lang": "ba",
    "level": "a1"
  },
  {
    "id": "general-ba-c1",
    "title": "General BA C1",
    "track": "General",
    "lang": "ba",
    "level": "c1"
  },
  {
    "id": "general-br-a1",
    "title": "General BR A1",
    "track": "General",
    "lang": "br",
    "level": "a1"
  },
  {
    "id": "general-br-c1",
    "title": "General BR C1",
    "track": "General",
    "lang": "br",
    "level": "c1"
  },
  {
    "id": "general-de-a1",
    "title": "General DE A1",
    "track": "General",
    "lang": "de",
    "level": "a1"
  },
  {
    "id": "general-de-c1",
    "title": "General DE C1",
    "track": "General",
    "lang": "de",
    "level": "c1"
  },
  {
    "id": "exam-el-c1",
    "title": "Exam EL C1",
    "track": "Exam",
    "lang": "el",
    "level": "c1"
  },
  {
    "id": "general-el-a1",
    "title": "General EL A1",
    "track": "General",
    "lang": "el",
    "level": "a1"
  },
  {
    "id": "general-el-a2",
    "title": "General EL A2",
    "track": "General",
    "lang": "el",
    "level": "a2"
  },
  {
    "id": "general-el-b1",
    "title": "General EL B1",
    "track": "General",
    "lang": "el",
    "level": "b1"
  },
  {
    "id": "general-el-b2",
    "title": "General EL B2",
    "track": "General",
    "lang": "el",
    "level": "b2"
  },
  {
    "id": "general-el-c1",
    "title": "General EL C1",
    "track": "General",
    "lang": "el",
    "level": "c1"
  },
  {
    "id": "general-el-c2",
    "title": "General EL C2",
    "track": "General",
    "lang": "el",
    "level": "c2"
  },
  {
    "id": "exam-en-b1",
    "title": "Exam EN B1",
    "track": "Exam",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "exam-en-b2",
    "title": "Exam EN B2",
    "track": "Exam",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "exam-en-c1",
    "title": "Exam EN C1",
    "track": "Exam",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "exam-en-c2",
    "title": "Exam EN C2",
    "track": "Exam",
    "lang": "en",
    "level": "c2"
  },
  {
    "id": "general-en-a1",
    "title": "General EN A1",
    "track": "General",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "general-en-a2",
    "title": "General EN A2",
    "track": "General",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "general-en-b1",
    "title": "General EN B1",
    "track": "General",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "general-en-b2",
    "title": "General EN B2",
    "track": "General",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "general-en-c1",
    "title": "General EN C1",
    "track": "General",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "general-en-c2",
    "title": "General EN C2",
    "track": "General",
    "lang": "en",
    "level": "c2"
  },
  {
    "id": "professional-en-b1",
    "title": "Professional EN B1",
    "track": "Professional",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "professional-en-b2",
    "title": "Professional EN B2",
    "track": "Professional",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "professional-en-c1",
    "title": "Professional EN C1",
    "track": "Professional",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "professional-en-c2",
    "title": "Professional EN C2",
    "track": "Professional",
    "lang": "en",
    "level": "c2"
  },
  {
    "id": "pronunciation-en-a1",
    "title": "Pronunciation EN A1",
    "track": "Pronunciation",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "pronunciation-en-a2",
    "title": "Pronunciation EN A2",
    "track": "Pronunciation",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "pronunciation-en-b1",
    "title": "Pronunciation EN B1",
    "track": "Pronunciation",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "pronunciation-en-b2",
    "title": "Pronunciation EN B2",
    "track": "Pronunciation",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "pronunciation-en-c1",
    "title": "Pronunciation EN C1",
    "track": "Pronunciation",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "pronunciation-en-c2",
    "title": "Pronunciation EN C2",
    "track": "Pronunciation",
    "lang": "en",
    "level": "c2"
  },
  {
    "id": "relocation-en-a2",
    "title": "Relocation EN A2",
    "track": "Relocation",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "relocation-en-b1",
    "title": "Relocation EN B1",
    "track": "Relocation",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "relocation-en-b2",
    "title": "Relocation EN B2",
    "track": "Relocation",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "relocation-en-c1",
    "title": "Relocation EN C1",
    "track": "Relocation",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "spoken-en-a1",
    "title": "Spoken EN A1",
    "track": "Spoken",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "spoken-en-a2",
    "title": "Spoken EN A2",
    "track": "Spoken",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "spoken-en-b1",
    "title": "Spoken EN B1",
    "track": "Spoken",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "spoken-en-b2",
    "title": "Spoken EN B2",
    "track": "Spoken",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "spoken-en-c1",
    "title": "Spoken EN C1",
    "track": "Spoken",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "spoken-en-c2",
    "title": "Spoken EN C2",
    "track": "Spoken",
    "lang": "en",
    "level": "c2"
  },
  {
    "id": "travelling-en-a1",
    "title": "Travelling EN A1",
    "track": "Travelling",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "travelling-en-a2",
    "title": "Travelling EN A2",
    "track": "Travelling",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "travelling-en-b1",
    "title": "Travelling EN B1",
    "track": "Travelling",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "general-es-a1",
    "title": "General ES A1",
    "track": "General",
    "lang": "es",
    "level": "a1"
  },
  {
    "id": "general-es-c1",
    "title": "General ES C1",
    "track": "General",
    "lang": "es",
    "level": "c1"
  },
  {
    "id": "general-fr-a1",
    "title": "General FR A1",
    "track": "General",
    "lang": "fr",
    "level": "a1"
  },
  {
    "id": "general-fr-a2",
    "title": "General FR A2",
    "track": "General",
    "lang": "fr",
    "level": "a2"
  },
  {
    "id": "general-fr-b1",
    "title": "General FR B1",
    "track": "General",
    "lang": "fr",
    "level": "b1"
  },
  {
    "id": "general-fr-b2",
    "title": "General FR B2",
    "track": "General",
    "lang": "fr",
    "level": "b2"
  },
  {
    "id": "general-fr-c1",
    "title": "General FR C1",
    "track": "General",
    "lang": "fr",
    "level": "c1"
  },
  {
    "id": "general-fr-c2",
    "title": "General FR C2",
    "track": "General",
    "lang": "fr",
    "level": "c2"
  },
  {
    "id": "professional-fr-b1",
    "title": "Professional FR B1",
    "track": "Professional",
    "lang": "fr",
    "level": "b1"
  },
  {
    "id": "professional-fr-b2",
    "title": "Professional FR B2",
    "track": "Professional",
    "lang": "fr",
    "level": "b2"
  },
  {
    "id": "professional-fr-c1",
    "title": "Professional FR C1",
    "track": "Professional",
    "lang": "fr",
    "level": "c1"
  },
  {
    "id": "professional-fr-c2",
    "title": "Professional FR C2",
    "track": "Professional",
    "lang": "fr",
    "level": "c2"
  },
  {
    "id": "pronunciation-fr-a1",
    "title": "Pronunciation FR A1",
    "track": "Pronunciation",
    "lang": "fr",
    "level": "a1"
  },
  {
    "id": "pronunciation-fr-a2",
    "title": "Pronunciation FR A2",
    "track": "Pronunciation",
    "lang": "fr",
    "level": "a2"
  },
  {
    "id": "pronunciation-fr-b1",
    "title": "Pronunciation FR B1",
    "track": "Pronunciation",
    "lang": "fr",
    "level": "b1"
  },
  {
    "id": "pronunciation-fr-b2",
    "title": "Pronunciation FR B2",
    "track": "Pronunciation",
    "lang": "fr",
    "level": "b2"
  },
  {
    "id": "pronunciation-fr-c1",
    "title": "Pronunciation FR C1",
    "track": "Pronunciation",
    "lang": "fr",
    "level": "c1"
  },
  {
    "id": "pronunciation-fr-c2",
    "title": "Pronunciation FR C2",
    "track": "Pronunciation",
    "lang": "fr",
    "level": "c2"
  },
  {
    "id": "spoken-fr-a1",
    "title": "Spoken FR A1",
    "track": "Spoken",
    "lang": "fr",
    "level": "a1"
  },
  {
    "id": "spoken-fr-a2",
    "title": "Spoken FR A2",
    "track": "Spoken",
    "lang": "fr",
    "level": "a2"
  },
  {
    "id": "spoken-fr-b1",
    "title": "Spoken FR B1",
    "track": "Spoken",
    "lang": "fr",
    "level": "b1"
  },
  {
    "id": "spoken-fr-b2",
    "title": "Spoken FR B2",
    "track": "Spoken",
    "lang": "fr",
    "level": "b2"
  },
  {
    "id": "spoken-fr-c1",
    "title": "Spoken FR C1",
    "track": "Spoken",
    "lang": "fr",
    "level": "c1"
  },
  {
    "id": "spoken-fr-c2",
    "title": "Spoken FR C2",
    "track": "Spoken",
    "lang": "fr",
    "level": "c2"
  },
  {
    "id": "travelling-fr-a1",
    "title": "Travelling FR A1",
    "track": "Travelling",
    "lang": "fr",
    "level": "a1"
  },
  {
    "id": "travelling-fr-a2",
    "title": "Travelling FR A2",
    "track": "Travelling",
    "lang": "fr",
    "level": "a2"
  },
  {
    "id": "travelling-fr-b1",
    "title": "Travelling FR B1",
    "track": "Travelling",
    "lang": "fr",
    "level": "b1"
  },
  {
    "id": "curriculum-english-a0",
    "title": "General English A0 - Beginner",
    "track": "General",
    "lang": "en",
    "level": "a0"
  },
  {
    "id": "curriculum-english-a1",
    "title": "General English A1 - Elementary",
    "track": "General",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "curriculum-english-a2",
    "title": "General English A2 - Pre-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "curriculum-english-b1",
    "title": "General English B1 - Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "curriculum-english-b2",
    "title": "General English B2 - Upper-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "curriculum-english-c1",
    "title": "General English C1 - Advanced",
    "track": "General",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "curriculum-grammar-english-a0",
    "title": "Grammar English A0 - Beginner",
    "track": "General",
    "lang": "en",
    "level": "a0"
  },
  {
    "id": "curriculum-grammar-english-a1",
    "title": "Grammar English A1 - Elementary",
    "track": "General",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "curriculum-grammar-english-a2",
    "title": "Grammar English A2 - Pre-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "curriculum-grammar-english-b1",
    "title": "Grammar English B1 - Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "curriculum-grammar-english-b2",
    "title": "Grammar English B2 - Upper-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "curriculum-grammar-english-c1",
    "title": "Grammar English C1 - Advanced",
    "track": "General",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "general-hy-a1",
    "title": "General HY A1",
    "track": "General",
    "lang": "hy",
    "level": "a1"
  },
  {
    "id": "general-hy-c1",
    "title": "General HY C1",
    "track": "General",
    "lang": "hy",
    "level": "c1"
  },
  {
    "id": "curriculum-introductory-english",
    "title": "CosyLanguages Introductory Diagnostic Lessons",
    "track": "General",
    "lang": "en",
    "level": "introductory-english"
  },
  {
    "id": "general-it-a1",
    "title": "General IT A1",
    "track": "General",
    "lang": "it",
    "level": "a1"
  },
  {
    "id": "general-it-a2",
    "title": "General IT A2",
    "track": "General",
    "lang": "it",
    "level": "a2"
  },
  {
    "id": "general-it-b1",
    "title": "General IT B1",
    "track": "General",
    "lang": "it",
    "level": "b1"
  },
  {
    "id": "general-it-b2",
    "title": "General IT B2",
    "track": "General",
    "lang": "it",
    "level": "b2"
  },
  {
    "id": "general-it-c1",
    "title": "General IT C1",
    "track": "General",
    "lang": "it",
    "level": "c1"
  },
  {
    "id": "general-it-c2",
    "title": "General IT C2",
    "track": "General",
    "lang": "it",
    "level": "c2"
  },
  {
    "id": "general-ka-a1",
    "title": "General KA A1",
    "track": "General",
    "lang": "ka",
    "level": "a1"
  },
  {
    "id": "general-ka-c1",
    "title": "General KA C1",
    "track": "General",
    "lang": "ka",
    "level": "c1"
  },
  {
    "id": "curriculum-phrasal-verbs-english-a2",
    "title": "Phrasal Verbs A2 - Pre-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "curriculum-phrasal-verbs-english-b1",
    "title": "Phrasal Verbs B1 - Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "curriculum-phrasal-verbs-english-b2",
    "title": "Phrasal Verbs B2 - Upper-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "general-pt-a1",
    "title": "General PT A1",
    "track": "General",
    "lang": "pt",
    "level": "a1"
  },
  {
    "id": "general-pt-c1",
    "title": "General PT C1",
    "track": "General",
    "lang": "pt",
    "level": "c1"
  },
  {
    "id": "general-ru-a1",
    "title": "General RU A1",
    "track": "General",
    "lang": "ru",
    "level": "a1"
  },
  {
    "id": "general-ru-a2",
    "title": "General RU A2",
    "track": "General",
    "lang": "ru",
    "level": "a2"
  },
  {
    "id": "general-ru-b1",
    "title": "General RU B1",
    "track": "General",
    "lang": "ru",
    "level": "b1"
  },
  {
    "id": "general-ru-b2",
    "title": "General RU B2",
    "track": "General",
    "lang": "ru",
    "level": "b2"
  },
  {
    "id": "general-ru-c1",
    "title": "General RU C1",
    "track": "General",
    "lang": "ru",
    "level": "c1"
  },
  {
    "id": "general-ru-c2",
    "title": "General RU C2",
    "track": "General",
    "lang": "ru",
    "level": "c2"
  },
  {
    "id": "professional-ru-b1",
    "title": "Professional RU B1",
    "track": "Professional",
    "lang": "ru",
    "level": "b1"
  },
  {
    "id": "professional-ru-b2",
    "title": "Professional RU B2",
    "track": "Professional",
    "lang": "ru",
    "level": "b2"
  },
  {
    "id": "professional-ru-c1",
    "title": "Professional RU C1",
    "track": "Professional",
    "lang": "ru",
    "level": "c1"
  },
  {
    "id": "professional-ru-c2",
    "title": "Professional RU C2",
    "track": "Professional",
    "lang": "ru",
    "level": "c2"
  },
  {
    "id": "pronunciation-ru-a1",
    "title": "Pronunciation RU A1",
    "track": "Pronunciation",
    "lang": "ru",
    "level": "a1"
  },
  {
    "id": "pronunciation-ru-a2",
    "title": "Pronunciation RU A2",
    "track": "Pronunciation",
    "lang": "ru",
    "level": "a2"
  },
  {
    "id": "pronunciation-ru-b1",
    "title": "Pronunciation RU B1",
    "track": "Pronunciation",
    "lang": "ru",
    "level": "b1"
  },
  {
    "id": "pronunciation-ru-b2",
    "title": "Pronunciation RU B2",
    "track": "Pronunciation",
    "lang": "ru",
    "level": "b2"
  },
  {
    "id": "pronunciation-ru-c1",
    "title": "Pronunciation RU C1",
    "track": "Pronunciation",
    "lang": "ru",
    "level": "c1"
  },
  {
    "id": "pronunciation-ru-c2",
    "title": "Pronunciation RU C2",
    "track": "Pronunciation",
    "lang": "ru",
    "level": "c2"
  },
  {
    "id": "spoken-ru-a1",
    "title": "Spoken RU A1",
    "track": "Spoken",
    "lang": "ru",
    "level": "a1"
  },
  {
    "id": "spoken-ru-a2",
    "title": "Spoken RU A2",
    "track": "Spoken",
    "lang": "ru",
    "level": "a2"
  },
  {
    "id": "spoken-ru-b1",
    "title": "Spoken RU B1",
    "track": "Spoken",
    "lang": "ru",
    "level": "b1"
  },
  {
    "id": "spoken-ru-b2",
    "title": "Spoken RU B2",
    "track": "Spoken",
    "lang": "ru",
    "level": "b2"
  },
  {
    "id": "spoken-ru-c1",
    "title": "Spoken RU C1",
    "track": "Spoken",
    "lang": "ru",
    "level": "c1"
  },
  {
    "id": "spoken-ru-c2",
    "title": "Spoken RU C2",
    "track": "Spoken",
    "lang": "ru",
    "level": "c2"
  },
  {
    "id": "travelling-ru-a1",
    "title": "Travelling RU A1",
    "track": "Travelling",
    "lang": "ru",
    "level": "a1"
  },
  {
    "id": "travelling-ru-a2",
    "title": "Travelling RU A2",
    "track": "Travelling",
    "lang": "ru",
    "level": "a2"
  },
  {
    "id": "travelling-ru-b1",
    "title": "Travelling RU B1",
    "track": "Travelling",
    "lang": "ru",
    "level": "b1"
  },
  {
    "id": "curriculum-spoken-english-a1",
    "title": "Spoken English A1 - Elementary",
    "track": "General",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "curriculum-spoken-english-a2",
    "title": "Spoken English A2 - Pre-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "curriculum-spoken-english-b1",
    "title": "Spoken English B1 - Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b1"
  },
  {
    "id": "curriculum-spoken-english-b2",
    "title": "Spoken English B2 - Upper-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b2"
  },
  {
    "id": "curriculum-spoken-english-c1",
    "title": "Spoken English C1 - Advanced",
    "track": "General",
    "lang": "en",
    "level": "c1"
  },
  {
    "id": "general-tt-a1",
    "title": "General TT A1",
    "track": "General",
    "lang": "tt",
    "level": "a1"
  },
  {
    "id": "general-tt-c1",
    "title": "General TT C1",
    "track": "General",
    "lang": "tt",
    "level": "c1"
  },
  {
    "id": "curriculum-vocabulary-english-a1",
    "title": "Vocabulary Practice A1 - Elementary",
    "track": "General",
    "lang": "en",
    "level": "a1"
  },
  {
    "id": "curriculum-vocabulary-english-a2",
    "title": "Vocabulary Practice A2 - Pre-Intermediate",
    "track": "General",
    "lang": "en",
    "level": "a2"
  },
  {
    "id": "curriculum-vocabulary-english-b1",
    "title": "Vocabulary Practice B1 - Intermediate",
    "track": "General",
    "lang": "en",
    "level": "b1"
  }
];

/**
 * Resolves a grant entry into an array of allowed course IDs.
 * Handles both explicit course arrays ("courses") and dynamic segment filters ("filter").
 *
 * @param {Object} grant - Grant entry from data/access-grants.json
 * @param {Array} [manifest] - Optional custom course manifest
 * @returns {Array<string>} List of course IDs or ["*"] for wildcard
 */
window.CosyAccessGrants.resolveGrantCourses = function(grant, manifest) {
  if (!grant) return [];

  // Case 1: Explicit courses array
  if (Array.isArray(grant.courses)) {
    return grant.courses;
  }

  // Case 2: Segment filter
  if (grant.filter && typeof grant.filter === "object") {
    const courseManifest = manifest || window.CosyAccessGrants.FULL_MANIFEST;
    const filter = grant.filter;

    return courseManifest.filter(course => {
      // Language filter
      if (filter.language) {
        const reqLangs = Array.isArray(filter.language) ? filter.language.map(l => l.toLowerCase()) : [filter.language.toLowerCase()];
        if (!reqLangs.includes(course.lang.toLowerCase())) return false;
      }

      // CEFR Level filter
      if (filter.level) {
        const reqLevels = Array.isArray(filter.level) ? filter.level.map(l => l.toLowerCase()) : [filter.level.toLowerCase()];
        if (!reqLevels.includes(course.level.toLowerCase()) && course.level.toLowerCase() !== "a0-c2") return false;
      }

      // Course Track filter
      if (filter.track) {
        const reqTracks = Array.isArray(filter.track) ? filter.track.map(t => t.toLowerCase()) : [filter.track.toLowerCase()];
        if (!reqTracks.includes(course.track.toLowerCase())) return false;
      }

      return true;
    }).map(course => course.id);
  }

  return [];
};
