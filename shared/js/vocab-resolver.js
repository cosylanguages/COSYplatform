/**
 * COSYplatform - COSYdata Vocabulary Resolver Client
 * Resolves vocabulary data, levels, and lexical theme categories from COSYdata repository indexes.
 */

(function (global) {
  'use strict';

  const COSYDATA_BASE_URL = 'https://raw.githubusercontent.com/cosylanguages/COSYdata/main';

  const SUB_THEME_CATEGORY_MAP = {
    clothes: "everyday_basics", colors: "everyday_basics", common_nouns: "everyday_basics",
    family: "everyday_basics", food_drink: "everyday_basics", house_furniture: "everyday_basics",
    living: "everyday_basics", measurement: "everyday_basics", money_shopping: "everyday_basics",
    numbers: "everyday_basics", objects: "everyday_basics", shopping: "everyday_basics",
    time: "everyday_basics", consumer_items: "everyday_basics", weather: "everyday_basics",
    abstract_nouns: "everyday_basics", abstract_concepts: "everyday_basics",

    directions: "travel_places", geography: "travel_places", places_transport: "travel_places",
    tourism: "travel_places", transport: "travel_places", urban_housing: "travel_places",

    animals: "people_relationships", appearance: "people_relationships", body_health: "people_relationships",
    cultural_identity_belonging: "people_relationships", emotions: "people_relationships", feelings: "people_relationships",
    nationalities: "people_relationships", personality: "people_relationships", psychology: "people_relationships", relationships: "people_relationships",

    business: "work_business", economy: "work_business", financial_specialization: "work_business",
    jobs: "work_business", work: "work_business", work_culture: "work_business",

    academic_english: "education_science", academic_vocabulary: "education_science", education: "education_science",
    innovation: "education_science", it_specialists: "education_science", science: "education_science",
    school: "education_science", statistics: "education_science", technology: "education_science",
    teachers_scientists: "education_science",

    cooking: "health_lifestyle", food_health: "health_lifestyle", health: "health_lifestyle",
    lifestyle: "health_lifestyle", medical_specialization: "health_lifestyle", sports: "health_lifestyle",
    sports_hobbies: "health_lifestyle",

    arts: "society_culture", conflict: "society_culture", crime: "society_culture", culture: "society_culture",
    environment: "society_culture", ethics: "society_culture", global_issues: "society_culture",
    legal_english: "society_culture", legal_specialization: "society_culture", media: "society_culture",
    migration: "society_culture", nature: "society_culture", politics: "society_culture", society: "society_culture",

    adjectives: "language_communication", adverbs_connectors: "language_communication", advanced_verbs: "language_communication",
    auxiliary_verbs: "language_communication", cause_effect: "language_communication", classroom_phrases: "language_communication",
    collocations: "language_communication", communication: "language_communication", comparisons: "language_communication",
    daily_verbs: "language_communication", expressions: "language_communication", general_adjectives: "language_communication",
    grammar: "language_communication", idioms: "language_communication", linking_words: "language_communication",
    literary_devices: "language_communication", nuanced_verbs: "language_communication", opinions: "language_communication",
    phrasal_verbs: "language_communication", prepositions: "language_communication", pronouns: "language_communication",
    rare_adjectives: "language_communication", rare_verbs: "language_communication", register: "language_communication",
    rhetoric: "language_communication", shapes_materials: "language_communication", sophisticated_adjectives: "language_communication",
    synonyms: "language_communication", verbs: "language_communication", verbs_cognition: "language_communication",
    word_building: "language_communication"
  };

  const LEVEL_METADATA = [
    {
      id: "a0_a1",
      cefrEquivalent: "A0-A1",
      displayName: {
        en: "A0-A1 Beginner & Elementary",
        fr: "A0-A1 Débutant & Élémentaire",
        ru: "A0-A1 Начальный и элементарный",
        el: "A0-A1 Αρχάριο & Στοιχειώδες",
        it: "A0-A1 Principiante & Elementare"
      }
    },
    {
      id: "a2",
      cefrEquivalent: "A2",
      displayName: {
        en: "A2 Pre-Intermediate",
        fr: "A2 Pré-intermédiaire",
        ru: "A2 Ниже среднего",
        el: "A2 Προ-ενδιάμεσο",
        it: "A2 Pre-intermedio"
      }
    },
    {
      id: "b1",
      cefrEquivalent: "B1",
      displayName: {
        en: "B1 Intermediate",
        fr: "B1 Intermédiaire",
        ru: "B1 Средний",
        el: "B1 Ενδιάμεσο",
        it: "B1 Intermedio"
      }
    },
    {
      id: "b2",
      cefrEquivalent: "B2",
      displayName: {
        en: "B2 Upper-Intermediate",
        fr: "B2 Intermédiaire Supérieur",
        ru: "B2 Выше среднего",
        el: "B2 Ανώτερο Ενδιάμεσο",
        it: "B2 Intermedio Superiore"
      }
    },
    {
      id: "c1",
      cefrEquivalent: "C1",
      displayName: {
        en: "C1 Advanced",
        fr: "C1 Avancé",
        ru: "C1 Продвинутый",
        el: "C1 Προχωρημένο",
        it: "C1 Avanzato"
      }
    },
    {
      id: "c2",
      cefrEquivalent: "C2",
      displayName: {
        en: "C2 Mastery & Proficiency",
        fr: "C2 Maîtrise / Perfectionnement",
        ru: "C2 Совершенное владение",
        el: "C2 Άριστη Γνώση / Επαγγελματικό",
        it: "C2 Padrronanza / Madrelingua"
      }
    }
  ];

  const THEME_METADATA = [
    { id: "everyday_basics", displayName: { en: "Everyday Life & Basics", fr: "Vie Quotidienne & Bases", ru: "Повседневная жизнь и основы", el: "Καθημερινή Ζωή & Βασικά", it: "Vita Quotidiana & Basi" } },
    { id: "travel_places", displayName: { en: "Travel, Places & Geography", fr: "Voyages, Lieux & Géographie", ru: "Путешествия, места и география", el: "Ταξίδια, Τοποθεσίες & Γεωγραφία", it: "Viaggi, Luoghi & Geografia" } },
    { id: "people_relationships", displayName: { en: "People, Relationships & Feelings", fr: "Personnes, Relations & Émotions", ru: "Люди, отношения и чувства", el: "Άνθρωποι, Σχέσεις & Συναισθήματα", it: "Persone, Relazioni & Sentimenti" } },
    { id: "work_business", displayName: { en: "Work, Business & Career", fr: "Travail, Affaires & Carrière", ru: "Работа, бизнес и карьера", el: "Εργασία, Επιχειρήσεις & Καριέρα", it: "Lavoro, Affari & Carriera" } },
    { id: "education_science", displayName: { en: "Education, Science & Technology", fr: "Éducation, Science & Technologie", ru: "Образование, наука и технологии", el: "Εκπαίδευση, Επιστήμη & Τεχνολογία", it: "Istruzione, Scienza & Tecnologia" } },
    { id: "health_lifestyle", displayName: { en: "Health, Body & Lifestyle", fr: "Santé, Corps & Mode de Vie", ru: "Здоровье, тело и образ жизни", el: "Υγεία, Σώμα & Τρόπος Ζωής", it: "Salute, Corpo & Stile di Vita" } },
    { id: "society_culture", displayName: { en: "Society, Culture, Law & Environment", fr: "Société, Culture, Droit & Environnement", ru: "Общество, культура, право и экология", el: "Κοινωνία, Πολιτισμός, Νόμος & Περιβάλλον", it: "Società, Cultura, Diritto & Ambiente" } },
    { id: "language_communication", displayName: { en: "Language, Grammar & Communication", fr: "Langue, Grammaire & Communication", ru: "Язык, грамматика и общение", el: "Γλώσσα, Γραμματική & Επικοινωνία", it: "Lingua, Grammatica & Comunicazione" } }
  ];

  const CosyVocabResolver = {
    COSYDATA_BASE_URL: COSYDATA_BASE_URL,

    /**
     * Resolves a word or vocabulary ID against local COSYdata index or remote fallback.
     */
    async resolveWord(term, lang = 'en') {
      if (!term) return null;
      const normalized = term.trim().toLowerCase();

      if (global.CosyVocabIndex && global.CosyVocabIndex[normalized]) {
        return global.CosyVocabIndex[normalized];
      }

      try {
        const indexUrl = `${COSYDATA_BASE_URL}/vocabulary/${lang}/index.json`;
        const res = await fetch(indexUrl);
        if (res.ok) {
          const remoteIndex = await res.json();
          if (remoteIndex[normalized]) {
            return remoteIndex[normalized];
          }
        }
      } catch (err) {
        console.warn(`CosyVocabResolver: Remote fetch failed for term "${term}"`, err);
      }

      return null;
    },

    search(query, lang = 'en', maxResults = 20) {
      if (!query || !query.trim()) return [];
      const q = query.trim().toLowerCase();
      const index = global.CosyVocabIndex || {};
      const matches = [];

      for (const word in index) {
        if (word.includes(q)) {
          index[word].forEach(entry => {
            matches.push({ word: word, id: entry.id, pos: entry.pos, file: entry.file });
          });
          if (matches.length >= maxResults) break;
        }
      }

      return matches;
    },

    /**
     * Gets the theme category ID for a given sub-theme file name.
     */
    getThemeForSubTheme(subThemeName) {
      const clean = subThemeName.replace('.json', '').split('/').pop();
      return SUB_THEME_CATEGORY_MAP[clean] || 'everyday_basics';
    },

    /**
     * Gets all main levels with counts of available practice words.
     */
    getLevels() {
      const index = global.CosyVocabIndex || {};
      const levelCounts = { a0_a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 };
      const levelFiles = { a0_a1: new Set(), a2: new Set(), b1: new Set(), b2: new Set(), c1: new Set(), c2: new Set() };

      for (const word in index) {
        index[word].forEach(entry => {
          const [lvl, filename] = entry.file.split('/');
          if (levelCounts[lvl] !== undefined) {
            levelCounts[lvl]++;
            levelFiles[lvl].add(filename);
          }
        });
      }

      return LEVEL_METADATA.map(lvl => ({
        ...lvl,
        totalWords: levelCounts[lvl.id] || 0,
        totalFiles: levelFiles[lvl.id] ? levelFiles[lvl.id].size : 0
      }));
    },

    /**
     * Gets all educational lexical themes with word counts for a specific level (or overall).
     */
    getThemesForLevel(levelId = null) {
      const index = global.CosyVocabIndex || {};
      const themeCounts = {};
      const themeFiles = {};

      THEME_METADATA.forEach(t => {
        themeCounts[t.id] = 0;
        themeFiles[t.id] = new Set();
      });

      for (const word in index) {
        index[word].forEach(entry => {
          const [lvl, filename] = entry.file.split('/');
          if (!levelId || lvl === levelId) {
            const subTheme = filename.replace('.json', '');
            const themeId = SUB_THEME_CATEGORY_MAP[subTheme] || 'everyday_basics';
            themeCounts[themeId] = (themeCounts[themeId] || 0) + 1;
            if (themeFiles[themeId]) themeFiles[themeId].add(entry.file);
          }
        });
      }

      return THEME_METADATA.map(t => ({
        ...t,
        totalWords: themeCounts[t.id] || 0,
        totalFiles: themeFiles[t.id] ? themeFiles[t.id].size : 0
      }));
    },

    /**
     * Gets practice card entries filtered by level, lexical theme, sub-theme, or search query.
     * Allows students to practice all words in practice data under structured categories.
     */
    getWordsForCategory(options = {}) {
      const { level, theme, subTheme, query } = options;
      const index = global.CosyVocabIndex || {};
      const results = [];
      const q = query ? query.trim().toLowerCase() : null;

      for (const word in index) {
        if (q && !word.toLowerCase().includes(q)) continue;

        index[word].forEach(entry => {
          const [lvl, filename] = entry.file.split('/');
          if (level && lvl !== level) return;

          const currentSubTheme = filename.replace('.json', '');
          if (subTheme && currentSubTheme !== subTheme) return;

          const currentTheme = SUB_THEME_CATEGORY_MAP[currentSubTheme] || 'everyday_basics';
          if (theme && currentTheme !== theme) return;

          results.push({
            word: word,
            id: entry.id,
            pos: entry.pos,
            file: entry.file,
            level: lvl,
            theme: currentTheme,
            subTheme: currentSubTheme
          });
        });
      }

      return results;
    },

    /**
     * Returns all practice card entries across the entire dataset.
     */
    getAllPracticeWords() {
      return this.getWordsForCategory({});
    }
  };

  global.CosyVocabResolver = CosyVocabResolver;

})(typeof window !== 'undefined' ? window : global);
