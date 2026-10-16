// Turns a lesson body (XML or JSON text) into a plain node tree: { tag, attrs, children: (node|string)[] }.
// Rendering happens from this tree with React elements, so lesson text is never injected as HTML.

const MAX_BODY_CHARS = 2_000_000;

export function xmlElementToNode(el) {
  const attrs = {};
  for (const a of el.attributes) attrs[a.name] = a.value;
  const children = [];
  for (const c of el.childNodes) {
    if (c.nodeType === 3 || c.nodeType === 4) children.push(c.nodeValue);
    else if (c.nodeType === 1) children.push(xmlElementToNode(c));
    // Comments and processing instructions keep a placeholder so field-key indexes
    // match the legacy renderer, which counted them.
    else if (c.nodeType === 7 || c.nodeType === 8) children.push({ tag: '#skip', attrs: {}, children: [] });
  }
  return { tag: el.tagName.toLowerCase(), attrs, children };
}

export function findAll(node, tag, out = []) {
  if (!node || typeof node === 'string') return out;
  if (node.tag === tag) out.push(node);
  node.children.forEach((c) => findAll(c, tag, out));
  return out;
}

export function textOf(node) {
  if (typeof node === 'string') return node;
  return node.children.map(textOf).join('');
}

function parseXml(text, DOMParserImpl) {
  const doc = new DOMParserImpl().parseFromString(text, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid lesson XML');
  const root = doc.documentElement;
  const slides = [...doc.getElementsByTagName('cosy-slide')].map((s, i) => ({
    id: s.getAttribute('id') || `slide-${i + 1}`,
    title: s.getAttribute('title') || '',
    stage: s.getAttribute('stage') || '',
    children: xmlElementToNode(s).children,
  }));
  return { title: root.getAttribute?.('title') || '', slides };
}

const el = (tag, children = [], attrs = {}) => ({ tag, attrs, children });

function jsonElementToNode(e) {
  switch (e.type) {
    case 'instruction': return el('cosy-instruction', [String(e.content ?? '')]);
    case 'blockquote': return el('cosy-blockquote', [String(e.content ?? '')]);
    case 'input': return el('cosy-input', [], { placeholder: e.placeholder || '' });
    case 'image': return el('cosy-image', [], { src: e.src || e.resourceId || '' });
    case 'test':
      return el('cosy-test', [
        el('cosy-test-question', [
          el('cosy-test-question-text', [String(e.question ?? '')]),
          ...(e.options || []).map((o) => el('cosy-test-item', [String(o)])),
        ]),
      ]);
    default: return el('#skip');
  }
}

function parseJson(text) {
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.slides)) throw new Error('Invalid lesson JSON');
  return {
    title: data.title || '',
    slides: data.slides.map((s, i) => ({
      id: s.id || `slide-${i + 1}`,
      title: s.title || '',
      stage: s.stage || '',
      children: (s.elements || []).map(jsonElementToNode),
    })),
  };
}

/** Auto-detects XML vs JSON (lesson ids are no longer file paths, so extensions are not reliable). */
export function parseLessonBody(text, DOMParserImpl = globalThis.DOMParser) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Lesson content is unavailable.');
  if (text.length > MAX_BODY_CHARS) throw new Error('Lesson is too large.');
  return text.trimStart().startsWith('<') ? parseXml(text, DOMParserImpl) : parseJson(text);
}
