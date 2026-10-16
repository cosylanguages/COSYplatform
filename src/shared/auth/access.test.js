import { describe, expect, it } from 'vitest';
import { isCourseAccessible, roleHome, safeRedirect } from './access.js';

const course = { language: 'fr', cefr: 'a2', status: 'available' };

describe('isCourseAccessible', () => {
  it('founder sees everything', () => {
    expect(isCourseAccessible({ ...course, status: 'not_yet_available' }, { role: 'founder' })).toBe(true);
  });
  it('checks language and level', () => {
    const p = { role: 'student', language_access: ['fr'], course_level: 'a2' };
    expect(isCourseAccessible(course, p)).toBe(true);
    expect(isCourseAccessible(course, { ...p, language_access: ['en'] })).toBe(false);
    expect(isCourseAccessible(course, { ...p, course_level: 'b1' })).toBe(false);
    expect(isCourseAccessible(course, { ...p, course_level: ['a1', 'a2'] })).toBe(true);
    expect(isCourseAccessible(course, { role: 'student', language_access: ['*'], course_level: '*' })).toBe(true);
  });
  it('hides unavailable courses from non-founders', () => {
    const p = { role: 'teacher', language_access: ['*'], course_level: '*' };
    expect(isCourseAccessible({ ...course, status: 'not_yet_available' }, p)).toBe(false);
  });
});

describe('safeRedirect', () => {
  it('allows only same-site paths', () => {
    expect(safeRedirect('/student/courses')).toBe('/student/courses');
    expect(safeRedirect('https://evil.test')).toBe('/hub');
    expect(safeRedirect('//evil.test')).toBe('/hub');
    expect(safeRedirect('/\\evil.test')).toBe('/hub');
    expect(safeRedirect(undefined)).toBe('/hub');
  });
});

describe('roleHome', () => {
  it('maps roles to workspaces', () => {
    expect(roleHome('teacher')).toBe('/teacher');
    expect(roleHome('founder')).toBe('/founder');
    expect(roleHome('student')).toBe('/student');
  });
});
