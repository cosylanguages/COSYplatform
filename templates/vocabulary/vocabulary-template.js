/**
 * COSYlanguages Vocabulary Template
 *
 * Follow project/docs/SCHEMA.md for field requirements and project/docs/CONTENT_ARCHITECTURE.md for codes.
 * File naming: theme-slug.js (e.g., food-drink.js)
 */
(function() {
    const lang = 'xx'; // ISO code: en | fr | it | ru | el | es | de | pt | hy | ka | tt | ba | br
    const data = [
        {
            /**
             * REQUIRED FIELDS
             * id format: {lang}_{level}_{theme_slug}_{sequence}
             */
            "id": "xx_level_theme_001",
            "word": "word",
            "lang": "xx",
            "level": "starter", // starter | elementary | intermediate | upper_intermediate | advanced | proficiency
            "theme": "theme",   // Slug from project/docs/CONTENT_ARCHITECTURE.md (e.g., animals, food_drink)
            "form": "noun",     // noun | verb | adjective | adverb | phrase | other
            "definitions": [
                {
                    "text": "Definition in the target language.",
                    "examples": [
                        "Example sentence in the target language."
                    ]
                }
            ],
            "transcription": "ipa_transcription", // No brackets or slashes
            "emoji": "✨",

            /**
             * OPTIONAL FIELDS (strongly recommended for B1+)
             */
            "sub_theme": null,    // Optional sub-theme from project/docs/CONTENT_ARCHITECTURE.md
            "synonyms": [],       // Array of strings
            "antonyms": [],       // Array of strings
            "collocations": [],   // Array of strings in the target language
            "subtext": "",        // Usage note or register info
            "etymology": {
                "origin_lang": "Language", // Required if etymology object is present
                "origin_word": "",
                "origin_meaning": "",
                "entered_via": "",
                "notes": ""
            },
            "grammar_refs": [
                {
                    "layer": "morphology", // morphology | syntax | phonology | particles
                    "category": "verbs",    // verbs | nouns | adjectives | etc.
                    "group_id": ""
                }
            ]
        }
    ];

    window.vocabularyData = window.vocabularyData || {};
    window.vocabularyData[lang] = [...(window.vocabularyData[lang] || []), ...data];

    /**
     * NOTE: For files in speaking/ folder (debates.js, opinions.js, etc.):
     * window.speakingData = window.speakingData || {};
     * window.speakingData[lang] = [...(window.speakingData[lang] || []), ...data];
     */
})();
