import { describe, expect, it } from 'vitest';
import { entryMeta, searchIndex } from './dictionaryClient.js';

const index = {
  mother: [{ id: 'm1', pos: 'noun', file: 'a1/family.json' }],
  motherland: [{ id: 'm2', pos: 'noun', file: 'b2/geography.json' }],
  grandmother: [{ id: 'm3', pos: 'noun', file: 'a1/family.json' }],
};

describe('searchIndex', () => {
  it('ranks exact, then prefix, then substring', () => {
    expect(searchIndex(index, 'mother').map((r) => r.term)).toEqual(['mother', 'motherland', 'grandmother']);
    expect(searchIndex(index, 'mother')[0].exact).toBe(true);
  });
  it('needs at least two characters and an index', () => {
    expect(searchIndex(index, 'm')).toEqual([]);
    expect(searchIndex(null, 'mother')).toEqual([]);
  });
});

describe('entryMeta', () => {
  it('reads level and theme from the path', () => {
    expect(entryMeta({ file: 'a1/family-life.json' })).toEqual({ level: 'A1', theme: 'family life' });
    expect(entryMeta({})).toEqual({ level: '', theme: '' });
  });
});
