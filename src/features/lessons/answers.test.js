import { describe, expect, it } from 'vitest';
import { isValidLessonId, mergeAnswers, rowsToMap } from './answers.js';

describe('mergeAnswers', () => {
  it('lets the server win except for unsynced local keys', () => {
    expect(mergeAnswers({ a: '1', b: 'local' }, { a: 'server', b: 'server' }, ['b'])).toEqual({ a: 'server', b: 'local' });
  });
  it('keeps server-only keys', () => {
    expect(mergeAnswers({}, { x: 'y' })).toEqual({ x: 'y' });
  });
});

describe('rowsToMap', () => {
  it('maps rows and tolerates null values', () => {
    expect(rowsToMap([{ field_key: 'k', value: null }, { field_key: 'j', value: 'v' }])).toEqual({ k: '', j: 'v' });
  });
});

describe('isValidLessonId', () => {
  it('accepts canonical ids and legacy paths, rejects traversal', () => {
    expect(isValidLessonId('en:a1:greetings')).toBe(true);
    expect(isValidLessonId('lessons/general-en/a1/01.xml')).toBe(true);
    expect(isValidLessonId('lessons/../secret')).toBe(false);
    expect(isValidLessonId('a b')).toBe(false);
    expect(isValidLessonId('')).toBe(false);
  });
});
