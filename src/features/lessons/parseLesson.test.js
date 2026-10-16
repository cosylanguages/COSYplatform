// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { findAll, parseLessonBody, textOf } from './parseLesson.js';

const XML = `<cosy-lesson title="Greetings">
  <cosy-slide id="s1" title="Hello" stage="warm-up">
    <p>Say <cosy-text type="strong">hello</cosy-text></p>
    <cosy-teacher-notes type="speech">Smile</cosy-teacher-notes>
  </cosy-slide>
  <cosy-slide title="Practice"><cosy-input placeholder="Type"><cosy-input-item>Hi</cosy-input-item></cosy-input></cosy-slide>
</cosy-lesson>`;

describe('parseLessonBody', () => {
  it('parses XML slides with attributes and nested nodes', () => {
    const l = parseLessonBody(XML);
    expect(l.title).toBe('Greetings');
    expect(l.slides).toHaveLength(2);
    expect(l.slides[0]).toMatchObject({ id: 's1', title: 'Hello', stage: 'warm-up' });
    expect(l.slides[1].id).toBe('slide-2');
    expect(textOf(findAll({ tag: 'x', attrs: {}, children: l.slides[0].children }, 'p')[0])).toBe('Say hello');
  });
  it('parses JSON slides into the same node shape', () => {
    const l = parseLessonBody(JSON.stringify({ title: 'T', slides: [{ title: 'A', elements: [{ type: 'instruction', content: 'Do it' }, { type: 'test', options: ['x', 'y'] }] }] }));
    expect(l.slides[0].children[0].tag).toBe('cosy-instruction');
    expect(findAll({ tag: 'r', attrs: {}, children: l.slides[0].children }, 'cosy-test-item')).toHaveLength(2);
  });
  it('rejects empty, malformed and oversized bodies', () => {
    expect(() => parseLessonBody('')).toThrow();
    expect(() => parseLessonBody('<cosy-lesson><oops></cosy-lesson>')).toThrow();
    expect(() => parseLessonBody('{"no":"slides"}')).toThrow();
    expect(() => parseLessonBody('<a>' + 'x'.repeat(2_000_001) + '</a>')).toThrow();
  });
});
