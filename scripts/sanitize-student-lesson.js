const { JSDOM } = require('jsdom');

const SENSITIVE_KEYS = new Set([
  'answer',
  'answers',
  'answerkey',
  'correct',
  'correctanswer',
  'solution',
  'solutions',
  'teacherNotes'.toLowerCase()
]);

function removeSensitiveJson(value) {
  if (Array.isArray(value)) {
    return value.map(removeSensitiveJson);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SENSITIVE_KEYS.has(key.replace(/[^a-z]/gi, '').toLowerCase()))
        .map(([key, entry]) => [key, removeSensitiveJson(entry)])
    );
  }
  return value;
}

function sanitizeStudentLessonContent(filePath, content) {
  if (filePath.endsWith('.json')) {
    return JSON.stringify(removeSensitiveJson(JSON.parse(content)));
  }

  if (filePath.endsWith('.xml')) {
    const document = new JSDOM(content, { contentType: 'text/xml' }).window.document;
    if (document.querySelector('parsererror')) {
      throw new Error(`Invalid XML lesson: ${filePath}`);
    }

    document.querySelectorAll('cosy-teacher-notes, cosy-input-answers')
      .forEach(element => element.remove());

    document.querySelectorAll('cosy-select-answers, cosy-test-answers')
      .forEach(element => element.replaceWith(...Array.from(element.childNodes)));

    document.querySelectorAll('*').forEach(element => {
      Array.from(element.attributes).forEach(attribute => {
        if (SENSITIVE_KEYS.has(attribute.name.replace(/[^a-z]/gi, '').toLowerCase())) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    return document.documentElement.outerHTML;
  }

  throw new Error(`Unsupported lesson format: ${filePath}`);
}

module.exports = { sanitizeStudentLessonContent };