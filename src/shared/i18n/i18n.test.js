import { describe, expect, it } from 'vitest';
import { interpolate, resolveLanguage, translate } from './i18n.js';

describe('resolveLanguage', () => {
  it('prefers pinned, then url, profile, browser, then en', () => {
    expect(resolveLanguage({ pinned: 'fr', urlParam: 'it' })).toBe('fr');
    expect(resolveLanguage({ urlParam: 'it', profileLang: 'ru' })).toBe('it');
    expect(resolveLanguage({ profileLang: 'ru', browserLang: 'el' })).toBe('ru');
    expect(resolveLanguage({ browserLang: 'el-GR' })).toBe('el');
  });
  it('falls back to en for course-only languages like Breton', () => {
    expect(resolveLanguage({ profileLang: 'br', browserLang: 'ka' })).toBe('en');
  });
});

describe('translate', () => {
  it('interpolates params', () => {
    expect(interpolate('Hi {name}', { name: 'Ana' })).toBe('Hi Ana');
    expect(translate('en', 'common.userLabel', { email: 'a@b.c' })).toBe('User: a@b.c');
  });
  it('selects plural forms', () => {
    expect(translate('en', 'common.lessons', { count: 1 })).toBe('1 lesson');
    expect(translate('en', 'common.lessons', { count: 5 })).toBe('5 lessons');
  });
  it('falls back to the key when missing everywhere', () => {
    expect(translate('fr', 'nope.nothing')).toBe('nope.nothing');
  });
});
