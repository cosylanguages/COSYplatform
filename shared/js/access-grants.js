/**
 * COSYlanguages Shared Access Grant Resolution Helper
 * Evaluates grant objects against course manifests dynamically.
 */

window.CosyAccessGrants = window.CosyAccessGrants || {};

/**
 * Full Platform Course Manifest
 * Serves as the source of truth for dynamic segment filter matching.
 */
window.CosyAccessGrants.FULL_MANIFEST = [
  // English
  { id: "general-english-a0", title: "General English A0 - Beginner", track: "General", lang: "en", level: "a0" },
  { id: "general-english-a1", title: "General English A1 - Elementary", track: "General", lang: "en", level: "a1" },
  { id: "general-english-a2", title: "General English A2 - Pre-Intermediate", track: "General", lang: "en", level: "a2" },
  { id: "general-english-b1", title: "General English B1 - Intermediate", track: "General", lang: "en", level: "b1" },
  { id: "general-english-b2", title: "General English B2 - Upper-Intermediate", track: "General", lang: "en", level: "b2" },
  { id: "general-english-c1", title: "General English C1 - Advanced", track: "General", lang: "en", level: "c1" },
  { id: "spoken-english-a1", title: "Spoken English A1", track: "Spoken", lang: "en", level: "a1" },
  { id: "spoken-english-a2", title: "Spoken English A2", track: "Spoken", lang: "en", level: "a2" },
  { id: "spoken-english-b1", title: "Spoken English B1", track: "Spoken", lang: "en", level: "b1" },
  { id: "spoken-english-b2", title: "Spoken English B2", track: "Spoken", lang: "en", level: "b2" },
  { id: "spoken-english-c1", title: "Spoken English C1", track: "Spoken", lang: "en", level: "c1" },
  { id: "grammar-english-a0", title: "Grammar English A0", track: "Grammar", lang: "en", level: "a0" },
  { id: "grammar-english-a1", title: "Grammar English A1", track: "Grammar", lang: "en", level: "a1" },
  { id: "grammar-english-a2", title: "Grammar English A2", track: "Grammar", lang: "en", level: "a2" },
  { id: "grammar-english-b1", title: "Grammar English B1", track: "Grammar", lang: "en", level: "b1" },
  { id: "grammar-english-b2", title: "Grammar English B2", track: "Grammar", lang: "en", level: "b2" },
  { id: "grammar-english-c1", title: "Grammar English C1", track: "Grammar", lang: "en", level: "c1" },
  { id: "phrasal-verbs-english-a2", title: "Phrasal Verbs English A2", track: "Phrasal Verbs", lang: "en", level: "a2" },
  { id: "phrasal-verbs-english-b1", title: "Phrasal Verbs English B1", track: "Phrasal Verbs", lang: "en", level: "b1" },
  { id: "phrasal-verbs-english-b2", title: "Phrasal Verbs English B2", track: "Phrasal Verbs", lang: "en", level: "b2" },
  { id: "vocabulary-english-a1", title: "Vocabulary English A1", track: "Vocabulary", lang: "en", level: "a1" },
  { id: "vocabulary-english-a2", title: "Vocabulary English A2", track: "Vocabulary", lang: "en", level: "a2" },
  { id: "vocabulary-english-b1", title: "Vocabulary English B1", track: "Vocabulary", lang: "en", level: "b1" },
  { id: "introductory-english", title: "Introductory Diagnostic First Lessons", track: "Introductory", lang: "en", level: "a0-c2" },
  { id: "en-pron-a1", title: "English Pronunciation A1", track: "Pronunciation", lang: "en", level: "a1" },
  { id: "en-pron-a2", title: "English Pronunciation A2", track: "Pronunciation", lang: "en", level: "a2" },
  { id: "en-pron-b1", title: "English Pronunciation B1", track: "Pronunciation", lang: "en", level: "b1" },
  { id: "en-pron-b2", title: "English Pronunciation B2", track: "Pronunciation", lang: "en", level: "b2" },
  { id: "en-pron-c1", title: "English Pronunciation C1", track: "Pronunciation", lang: "en", level: "c1" },
  { id: "en-pron-c2", title: "English Pronunciation C2", track: "Pronunciation", lang: "en", level: "c2" },

  // French
  { id: "fr-pron-a1", title: "French Pronunciation A1 (A0-A1)", track: "Pronunciation", lang: "fr", level: "a1" },
  { id: "fr-pron-a2", title: "French Pronunciation A2", track: "Pronunciation", lang: "fr", level: "a2" },
  { id: "fr-pron-b1", title: "French Pronunciation B1", track: "Pronunciation", lang: "fr", level: "b1" },
  { id: "fr-pron-b2", title: "French Pronunciation B2", track: "Pronunciation", lang: "fr", level: "b2" },
  { id: "fr-pron-c1", title: "French Pronunciation C1", track: "Pronunciation", lang: "fr", level: "c1" },
  { id: "fr-pron-c2", title: "French Pronunciation C2", track: "Pronunciation", lang: "fr", level: "c2" },

  // Russian
  { id: "ru-pron-a1", title: "Russian Pronunciation A1", track: "Pronunciation", lang: "ru", level: "a1" },
  { id: "ru-pron-a2", title: "Russian Pronunciation A2", track: "Pronunciation", lang: "ru", level: "a2" },
  { id: "ru-pron-b1", title: "Russian Pronunciation B1", track: "Pronunciation", lang: "ru", level: "b1" },
  { id: "ru-pron-b2", title: "Russian Pronunciation B2", track: "Pronunciation", lang: "ru", level: "b2" },
  { id: "ru-pron-c1", title: "Russian Pronunciation C1", track: "Pronunciation", lang: "ru", level: "c1" },
  { id: "ru-pron-c2", title: "Russian Pronunciation C2", track: "Pronunciation", lang: "ru", level: "c2" }
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
  if (grant.filter && typeof grant.filter === 'object') {
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
