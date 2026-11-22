#!/usr/bin/env node
/*
 * Fills the legacy placeholder lessons with draft curriculum metadata.
 *
 * A placeholder is a lesson with status "needs_review" and source
 * "ported-from-legacy". The generated lessons keep their title and slug but
 * gain grammar, vocabulary, practice types, duration and a can-do statement.
 * They are marked status "draft" and source "generated-from-title" so a later
 * review can tell them apart from authored lessons.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'curriculums', 'en');
const DRY_RUN = process.argv.includes('--dry-run');

const GRAMMAR_PATTERNS = [
  [/\bpresent simple\b.*\bpresent continuous\b|\bpresent continuous\b.*\bpresent simple\b/, 'Present simple vs present continuous'],
  [/\bto be\b.*\bnegative\b|\bnegative\b.*\bto be\b/, 'Verb to be: negative forms'],
  [/\bto be\b.*\bquestions?\b|\bquestions?\b.*\bto be\b/, 'Verb to be: questions and short answers'],
  [/\bto be\b.*\bpast\b|\bpast forms? of to be\b/, 'Verb to be: past forms'],
  [/\blike love hate\b/, 'Like / love / hate + -ing'],
  [/\bpresent perfect continuous\b/, 'Present perfect continuous'],
  [/\bpresent perfect\b/, 'Present perfect'],
  [/\bpresent simple\b/, 'Present simple'],
  [/\bpresent continuous\b/, 'Present continuous'],
  [/\bpast simple\b.*\birregular\b|\birregular verbs?\b/, 'Past simple: irregular verbs'],
  [/\bpast simple\b/, 'Past simple'],
  [/\bpast continuous\b/, 'Past continuous'],
  [/\bpast perfect\b/, 'Past perfect'],
  [/\bnarrative tenses\b/, 'Narrative tenses'],
  [/\bgoing to\b/, 'Future forms: be going to'],
  [/\bfuture tenses? lexical\b/, 'Future forms and lexical means'],
  [/\bfuture forms?\b|\bfuture tenses?\b/, 'Future forms'],
  [/\bdegrees? of comparison\b/, 'Comparatives and superlatives'],
  [/\bcomparative\b.*\bsuperlative\b|\bsuperlative\b.*\bcomparative\b/, 'Comparatives and superlatives'],
  [/\bcomparative\b/, 'Comparatives'],
  [/\bsuperlative\b/, 'Superlatives'],
  [/\bcan for abilities\b|\bcan\b.*\babilit/, 'Modal verb can for ability'],
  [/\bmodals?\b|\bmust\b|\bshould\b|\bhave to\b|\bmight\b|\bmay\b/, 'Modal verbs'],
  [/\bimperative\b/, 'Imperatives'],
  [/\bthere is\b|\bthere are\b/, 'There is / there are'],
  [/\bhave got\b/, 'Have got'],
  [/\bprepositions? of place\b/, 'Prepositions of place'],
  [/\bprepositions? of time\b/, 'Prepositions of time'],
  [/\bprepositions?\b/, 'Prepositions'],
  [/\badverbs? of frequency\b/, 'Adverbs of frequency'],
  [/\badverbs?\b/, 'Adverbs'],
  [/\blinkers?\b|\blinking words?\b|\bconnectors?\b/, 'Linking words and connectors'],
  [/\bword order\b/, 'Word order'],
  [/\bconditionals?\b/, 'Conditionals'],
  [/\bpassive\b/, 'Passive voice'],
  [/\breported speech\b/, 'Reported speech'],
  [/\brelative clauses?\b/, 'Relative clauses'],
  [/\bgerunds?\b|\bgerundial\b|\bving\b/, 'Gerunds and infinitives'],
  [/\binfinitives?\b|\binfinitive complexes?\b/, 'Infinitives and complex infinitive constructions'],
  [/\bparticiples?\b/, 'Participle clauses'],
  [/\bused to\b|\bbe get used to\b|\bwould\b.*\bpast\b/, 'Used to / be used to / would'],
  [/\bcausatives?\b|\bhave get make\b/, 'Causative verbs (have, get, make)'],
  [/\binversion\b/, 'Inversion'],
  [/\bcleft\b/, 'Cleft sentences'],
  [/\bsubjunctive\b/, 'Subjunctive'],
  [/\bnominalisation\b|\bnominalization\b/, 'Nominalisation'],
  [/\bellipsis\b|\bsubstitution\b/, 'Ellipsis and substitution'],
  [/\bhedging\b/, 'Hedging and cautious language'],
  [/\bemphasis\b|\bfronting\b/, 'Emphasis and fronting'],
  [/\bdiscourse markers?\b/, 'Discourse markers'],
  [/\bcontinuous aspect\b|\bperfect aspect\b|\baspect\b/, 'Continuous and perfect aspect'],
  [/\bordinal\b/, 'Ordinal numbers'],
  [/\bnumbers?\b|\bnumerals?\b/, 'Numbers and numerals'],
  [/\bdates?\b/, 'Dates and ordinal numbers'],
  [/\btime\b/, 'Telling the time'],
  [/\bto be\b|\bam is are\b|\bpronouns?\b/, 'Verb to be and subject pronouns'],
  [/\bnegative forms?\b/, 'Negative forms'],
  [/\bquestions? (and|&) short answers\b/, 'Questions and short answers'],
  [/\barticles?\b|\ba an\b/, 'Articles (a, an, the)'],
  [/\bplural nouns?\b/, 'Plural nouns'],
  [/\bpossessive s\b/, "Possessive 's"],
  [/\bpossessive adjectives?\b/, 'Possessive adjectives'],
  [/\bobject(ive)? pronouns?\b/, 'Object pronouns'],
  [/\bdemonstratives?\b|\bthis that these those\b/, 'Demonstratives (this, that, these, those)'],
  [/\bsome any no\b|\bquantifiers?\b/, 'Quantifiers (some, any, no)'],
  [/\buncountable\b|\bcountable\b/, 'Countable and uncountable nouns'],
  [/\bwould like\b/, 'Would like + infinitive'],
  [/\bmixed tenses\b/, 'Mixed tenses review'],
  [/\bintroductory\b/, 'Integrated skills review']
];

const SYLLABUS = {
  A1: ['Present simple', 'Present continuous', 'Past simple', 'Comparatives and superlatives', 'Modal verbs', 'Future forms: be going to', 'Prepositions of place and time', 'Countable and uncountable nouns'],
  A2: ['Past continuous', 'Present perfect', 'Future forms', 'First conditional', 'Modal verbs', 'Relative clauses', 'Comparatives and superlatives', 'Gerunds and infinitives', 'Passive voice', 'Quantifiers'],
  B1: ['Present perfect continuous', 'Past perfect', 'Second conditional', 'Passive voice', 'Reported speech', 'Relative clauses', 'Modals of deduction', 'Gerunds and infinitives', 'Linking words'],
  B2: ['Third and mixed conditionals', 'Advanced passive', 'Inversion', 'Cleft sentences', 'Participle clauses', 'Reported speech', 'Modals of speculation', 'Cohesive devices'],
  C1: ['Advanced inversion', 'Subjunctive', 'Nominalisation', 'Complex conditionals', 'Ellipsis and substitution', 'Discourse markers', 'Hedging', 'Emphasis and fronting'],
  C2: ['Nuanced modality', 'Advanced syntax', 'Stylistic inversion', 'Rhetorical devices', 'Complex nominal groups', 'Register and stance']
};

const TOPICS = [
  { keys: ['identity', 'first contact', 'personal', 'introduce', 'name', 'hello', 'greeting'], words: ['name', 'surname', 'age', 'address', 'phone number', 'nationality', 'occupation', 'email'] },
  { keys: ['family', 'relationship', 'people', 'marriage', 'parent', 'child', 'generation'], words: ['mother', 'father', 'sister', 'brother', 'grandparent', 'cousin', 'partner', 'relative'] },
  { keys: ['object', 'personal space', 'bag', 'possession', 'fridge', 'thing', 'phone', 'key', 'wallet'], words: ['bag', 'phone', 'key', 'wallet', 'book', 'furniture', 'object', 'possession'] },
  { keys: ['home', 'house', 'flat', 'room', 'furniture', 'living', 'where i live', 'mess', 'cosy', 'neighbour', 'redecorate', 'rent', 'tenant', 'landlord'], words: ['flat', 'house', 'room', 'kitchen', 'furniture', 'rent', 'neighbour', 'move'] },
  { keys: ['food', 'drink', 'meal', 'restaurant', 'cook', 'recipe', 'diet', 'kitchen', 'gastro'], words: ['meal', 'recipe', 'ingredient', 'restaurant', 'menu', 'order', 'bill', 'diet'] },
  { keys: ['shop', 'shopping', 'store', 'money', 'price', 'consumer', 'checkout', 'bakery', 'butcher', 'gift', 'present', 'complaint', 'return', 'refund'], words: ['shop', 'price', 'discount', 'receipt', 'refund', 'customer', 'product', 'checkout'] },
  { keys: ['clothes', 'fashion', 'appearance', 'shirt', 'style', 'wear'], words: ['shirt', 'trousers', 'size', 'fit', 'style', 'fashion', 'wear', 'accessory'] },
  { keys: ['health', 'body', 'doctor', 'medical', 'illness', 'symptom', 'wellbeing', 'mental'], words: ['doctor', 'symptom', 'medicine', 'appointment', 'treatment', 'pain', 'healthy', 'lifestyle'] },
  { keys: ['travel', 'trip', 'holiday', 'hotel', 'flight', 'plane', 'train', 'tourism', 'destination', 'visa'], words: ['journey', 'ticket', 'luggage', 'passport', 'hotel', 'booking', 'destination', 'sightseeing'] },
  { keys: ['work', 'job', 'career', 'office', 'professional', 'business', 'interview', 'meeting', 'hire', 'recruit'], words: ['job', 'interview', 'salary', 'colleague', 'manager', 'deadline', 'office', 'career'] },
  { keys: ['education', 'school', 'study', 'learn', 'teacher', 'student', 'exam', 'university'], words: ['school', 'teacher', 'student', 'exam', 'course', 'lesson', 'homework', 'university'] },
  { keys: ['technology', 'digital', 'internet', 'online', 'app', 'device', 'computer', 'ai', 'smart'], words: ['device', 'app', 'online', 'screen', 'data', 'password', 'internet', 'digital'] },
  { keys: ['environment', 'climate', 'ecology', 'sustainable', 'pollution', 'energy', 'nature', 'green', 'bottle', 'recycle'], words: ['climate', 'pollution', 'recycle', 'energy', 'sustainable', 'waste', 'nature', 'planet'] },
  { keys: ['media', 'news', 'advertising', 'influencer', 'social media', 'content', 'communication'], words: ['news', 'article', 'headline', 'social media', 'advertising', 'influencer', 'audience', 'content'] },
  { keys: ['society', 'culture', 'community', 'tradition', 'policy', 'public', 'values', 'tolerance'], words: ['community', 'culture', 'tradition', 'generation', 'inequality', 'policy', 'public', 'values'] },
  { keys: ['relationship', 'friendship', 'friend', 'love', 'date', 'marriage', 'partner'], words: ['friendship', 'partner', 'date', 'marriage', 'trust', 'argument', 'support', 'love'] },
  { keys: ['emotion', 'feeling', 'feel', 'happy', 'sad', 'stress', 'burnout', 'wellness', 'mood', 'bad day'], words: ['happy', 'anxious', 'confident', 'frustrated', 'calm', 'stressed', 'grateful', 'mood'] },
  { keys: ['money', 'finance', 'bank', 'budget', 'credit', 'invest', 'payment', 'cash'], words: ['budget', 'bank', 'account', 'credit', 'loan', 'save', 'invest', 'bill'] },
  { keys: ['transport', 'public transport', 'train', 'plane', 'car', 'ship', 'city', 'traffic'], words: ['bus', 'train', 'plane', 'car', 'ticket', 'station', 'route', 'traffic'] },
  { keys: ['weather', 'climate', 'season', 'snow', 'rain', 'sun'], words: ['sunny', 'rainy', 'cloudy', 'forecast', 'temperature', 'season', 'storm', 'climate'] },
  { keys: ['hobby', 'free time', 'sport', 'music', 'reading', 'cooking', 'game', 'club'], words: ['hobby', 'sport', 'music', 'reading', 'cooking', 'travel', 'game', 'club'] },
  { keys: ['city', 'urban', 'neighbourhood', 'housing', 'smart city', 'public space'], words: ['city', 'neighbourhood', 'transport', 'housing', 'facility', 'pollution', 'community', 'public space'] },
  { keys: ['science', 'research', 'space', 'genius', 'experiment', 'evidence', 'theory'], words: ['research', 'experiment', 'evidence', 'theory', 'discovery', 'technology', 'ethics', 'data'] },
  { keys: ['politics', 'government', 'election', 'policy', 'law', 'rights', 'democracy'], words: ['government', 'election', 'policy', 'law', 'rights', 'debate', 'public', 'power'] },
  { keys: ['law', 'court', 'jury', 'crime', 'justice', 'legal'], words: ['law', 'court', 'judge', 'jury', 'evidence', 'rights', 'crime', 'justice'] },
  { keys: ['business', 'company', 'market', 'startup', 'negotiation', 'strategy', 'brand'], words: ['company', 'market', 'customer', 'strategy', 'profit', 'negotiation', 'brand', 'startup'] },
  { keys: ['communication', 'conversation', 'body language', 'listen', 'speak', 'presentation'], words: ['conversation', 'message', 'tone', 'body language', 'listen', 'respond', 'clarify', 'feedback'] },
  { keys: ['personality', 'character', 'confident', 'generous', 'patient', 'ambitious'], words: ['confident', 'generous', 'patient', 'ambitious', 'reserved', 'reliable', 'curious', 'honest'] },
  { keys: ['appearance', 'look', 'beautiful', 'hair', 'eyes'], words: ['tall', 'short', 'hair', 'eyes', 'style', 'clothes', 'attractive', 'look'] },
  { keys: ['time', 'routine', 'schedule', 'day', 'week', 'month', 'year'], words: ['morning', 'afternoon', 'evening', 'week', 'month', 'year', 'schedule', 'routine'] },
  { keys: ['number', 'date', 'price', 'count'], words: ['one', 'two', 'ten', 'hundred', 'first', 'second', 'date', 'price'] },
  { keys: ['exam', 'test', 'score', 'revision', 'practice'], words: ['exam', 'task', 'answer', 'score', 'practice', 'strategy', 'time limit', 'review'] },
  { keys: ['pronunciation', 'accent', 'sound', 'speak'], words: ['stress', 'intonation', 'sound', 'vowel', 'consonant', 'rhythm', 'accent', 'clarity'] }
];

const GENERIC = {
  A1: ['people', 'place', 'thing', 'time', 'day', 'like', 'want', 'need'],
  A2: ['experience', 'activity', 'choice', 'plan', 'problem', 'solution', 'describe', 'compare'],
  B1: ['situation', 'opinion', 'reason', 'result', 'advantage', 'disadvantage', 'example', 'decision'],
  B2: ['issue', 'impact', 'evidence', 'perspective', 'policy', 'trend', 'consequence', 'debate'],
  C1: ['implication', 'assumption', 'framework', 'discourse', 'nuance', 'cohesion', 'argument', 'evaluation'],
  C2: ['rhetoric', 'register', 'ambiguity', 'synthesis', 'critique', 'stance', 'idiom', 'precision']
};

const STOPWORDS = new Set(('a an the and or but to of in on at for with from by is are was were be been being do does did have has had i you he she it we they my your his her its our their this that these those what how why when where who which not no so than as if then there here up down out off over under again more most some any all one two three ge a0 a1 a2 b1 b2 c1 c2 vs versus part lesson').split(/\s+/));

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value) {
  return value.replace(/\b[a-z]/g, letter => letter.toUpperCase());
}

function isPlaceholder(lesson) {
  return lesson.status === 'needs_review' && lesson.source === 'ported-from-legacy';
}

function isGenerated(lesson) {
  return lesson.status === 'draft' && lesson.source === 'generated-from-title';
}

function quoteTitle(title) {
  return `'${String(title).replace(/'/g, '\u2019')}'`;
}

const GRAMMAR_HINT = /\b(present|past|future|perfect|continuous|conditionals?|passive|reported|relative|clauses?|modals?|articles?|prepositions?|pronouns?|possessive|plural|comparatives?|superlatives?|comparisons?|imperatives?|gerunds?|infinitives?|participles?|inversion|cleft|subjunctive|nominalisation|ellipsis|hedging|determiners?|quantifiers?|uncountable|countable|word order|linkers?|linking|connectors?|adverbs?|auxiliary|questions?|negatives?|affirmative|tenses?|aspect|causatives?|used to|would like|have got|there is|there are|going to)\b/;

function isGrammarTitle(title) {
  const normalized = normalize(title);
  return /^ge\s+(a0|a1|a2|b1|b2|c1|c2)\b/.test(normalized)
    || /^(time|dates?|numerals?|numbers?)\s+(a0|a1|a2|b1|b2|c1|c2)\b/.test(normalized)
    || GRAMMAR_HINT.test(normalized);
}

function inferGrammar(course, title, level, counters) {
  const normalized = normalize(title);
  if (isGrammarTitle(title)) {
    for (const [pattern, grammar] of GRAMMAR_PATTERNS) {
      if (pattern.test(normalized)) return { grammar: [grammar], specific: true };
    }
    return { grammar: ['Integrated grammar review'], specific: true };
  }
  const syllabus = SYLLABUS[level] || SYLLABUS.A1;
  const key = `${course}/${level}`;
  const index = counters.get(key) || 0;
  counters.set(key, index + 1);
  return { grammar: [syllabus[index % syllabus.length]], specific: false };
}

function inferVocabulary(title, unitTitle, level, specific) {
  const lessonText = normalize(title);
  const unitText = normalize(unitTitle);
  let best = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    let score = 0;
    for (const key of topic.keys) {
      const weight = key.split(' ').length;
      if (lessonText.includes(key)) score += weight * 10;
      if (unitText.includes(key)) score += weight;
    }
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  const words = best ? best.words.slice() : (GENERIC[level] || GENERIC.A1).slice();
  if (!specific) {
    for (const word of normalize(title).split(' ')) {
      if (word.length > 2 && !STOPWORDS.has(word) && !words.includes(word)) words.push(word);
    }
  }
  return [...new Set(words)].slice(0, 8);
}

function inferPracticeTypes(course, lessonType) {
  if (course === 'spoken' || lessonType === 'spoken') return ['speaking', 'role-play', 'discussion'];
  if (course === 'exam' || lessonType === 'exam') return ['exam', 'reading', 'writing'];
  if (course === 'pronunciation' || lessonType === 'pron' || lessonType === 'pronunciation') return ['pronunciation', 'speaking', 'listening'];
  if (lessonType === 'vocab') return ['vocabulary', 'reading', 'writing'];
  return ['vocabulary', 'grammar', 'speaking'];
}

function inferDuration(course) {
  if (course === 'exam') return 60;
  if (course === 'spoken' || course === 'discussion') return 50;
  if (course === 'pronunciation') return 30;
  return 45;
}

function buildCanDo(course, title, grammar, lessonType, specific) {
  const grammarText = grammar.slice(0, 2).join(' and ');
  if (course === 'spoken' || lessonType === 'spoken') {
    return `Can discuss ${quoteTitle(title)} in a conversation, using ${grammarText} and topic vocabulary.`;
  }
  if (course === 'exam' || lessonType === 'exam') {
    return `Can complete ${quoteTitle(title)} tasks under exam conditions.`;
  }
  if (course === 'pronunciation' || lessonType === 'pron' || lessonType === 'pronunciation') {
    return `Can pronounce topic vocabulary for ${quoteTitle(title)} clearly, with correct stress and intonation.`;
  }
  if (course === 'discussion') {
    return `Can participate in a discussion about ${quoteTitle(title)} using ${grammarText}.`;
  }
  if (specific) return `Can use ${grammarText} accurately to talk about ${quoteTitle(title)}.`;
  return `Can talk about ${quoteTitle(title)} using ${grammarText} and topic vocabulary.`;
}

function nextCode(course, level, counters) {
  const key = `${course}/${level}`;
  const next = (counters.get(key) || 0) + 1;
  counters.set(key, next);
  const prefix = course === 'spoken' ? 'SPK' : course === 'general' ? 'GEN' : String(course || 'GEN').slice(0, 3).toUpperCase();
  return `EN-${prefix}-${level}-D${String(next).padStart(3, '0')}`;
}

function teacherNotes(course, lessonType, code, canDo, title) {
  const quoted = quoteTitle(title);
  const lines = [`code: "${code}"`, `cando: "${canDo}"`];
  if (course === 'spoken' || lessonType === 'spoken') {
    lines.push(`task: "Role-play: ${quoted}. Take turns and use the target grammar."`);
    lines.push('speaking_focus: "Stress key words and use linking phrases to keep the conversation flowing."');
  } else if (course === 'exam' || lessonType === 'exam') {
    lines.push('strategy: "Read the task, underline key words, and check your answer against the evidence."');
  } else if (course === 'professional') {
    lines.push('domain_hints: "Adapt the task to the learner\'s workplace context and register."');
  } else {
    lines.push(`speaking: "Pair discussion about ${quoted}."`);
    lines.push(`listening: "Short dialogue about ${quoted}."`);
    lines.push(`reading: "Short text about ${quoted}."`);
    lines.push(`writing: "Write five sentences about ${quoted}."`);
  }
  lines.push('review: "Generated from the lesson title and unit theme; review before publishing."');
  return lines.join('\n');
}

function enrichLesson(lesson, unit, course, level, code, canDo, grammar, vocabulary, practiceTypes) {
  const quoted = quoteTitle(lesson.title);
  lesson.grammar = grammar;
  lesson.vocabulary = vocabulary;
  lesson.practice_types = practiceTypes;
  lesson.duration_minutes = inferDuration(course);
  lesson.code = code;
  lesson.recycled = 'Foundational communication & basic level vocabulary';
  lesson.teacher_notes = teacherNotes(course, lesson.type, code, canDo, lesson.title);

  if (course === 'spoken' || lesson.type === 'spoken') {
    lesson.speaking_percent = 85;
  } else if (course === 'exam' || lesson.type === 'exam') {
    lesson.speaking_percent = 15;
  }

  if (course === 'general' && lesson.type !== 'spoken') {
    lesson.ageAdaptation = {
      children: `Use pictures, songs and a short game to practise ${quoted} in a supportive group.`,
      teens: `Use a quick pair challenge and a short digital quiz to practise ${quoted}.`,
      adults: `Use a real-life role-play and a short discussion to practise ${quoted}.`,
      seniors: `Use large-print prompts, a slower pace and repetition to practise ${quoted}.`
    };
    lesson.growingTask = {
      selfPortrait: `My one-minute talk: ${lesson.title}. I can use three new words from this lesson.`,
      dialogue: `A: What do you think about ${lesson.title}?\nB: I think ... because ...`
    };
  }
}

function stringify(data) {
  return JSON.stringify(data, null, 2)
    .replace(/[\u007f-\uffff]/g, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`) + '\n';
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (entry.name.endsWith('.json')) files.push(target);
  }
  return files;
}

const counters = new Map();
const codeCounters = new Map();
let generated = 0;
const samples = [];

for (const file of walk(ROOT)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const course = data.course_type;
  const level = data.level;
  let changed = false;

  for (const unit of data.units || []) {
    for (const lesson of unit.lessons || []) {
      if (!isPlaceholder(lesson) && !isGenerated(lesson)) continue;
      const { grammar, specific } = inferGrammar(course, lesson.title, level, counters);
      const vocabulary = inferVocabulary(lesson.title, unit.title, level, specific);
      const practiceTypes = inferPracticeTypes(course, lesson.type);
      const canDo = buildCanDo(course, lesson.title, grammar, lesson.type, specific);
      const code = nextCode(course, level, codeCounters);

      enrichLesson(lesson, unit, course, level, code, canDo, grammar, vocabulary, practiceTypes);
      lesson.status = 'draft';
      lesson.source = 'generated-from-title';

      generated += 1;
      changed = true;
      if (samples.length < 30 && generated % 25 === 1) {
        samples.push({ file: path.relative(process.cwd(), file), title: lesson.title, grammar, vocabulary, practice_types: practiceTypes, cando: canDo });
      }
    }
  }

  if (changed && !DRY_RUN) {
    fs.writeFileSync(file, stringify(data));
  }
}

console.log(`${DRY_RUN ? 'Would generate' : 'Generated'} ${generated} draft lessons.`);
for (const sample of samples) console.log(JSON.stringify(sample));
