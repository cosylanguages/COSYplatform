import { describe, expect, it } from 'vitest';
import { distinct, filterCourses, groupLessonsByUnit } from './courses.js';

const courses = [
  { id: '1', language: 'en', course_type: 'general', cefr: 'b1', title: 'General English B1', description: '' },
  { id: '2', language: 'fr', course_type: 'spoken', cefr: 'a1', title: 'Français parlé A1', description: 'conversation' },
  { id: '3', language: 'fr', course_type: 'general', cefr: 'a2', title: 'Français général A2', description: '' },
];

describe('filterCourses', () => {
  it('combines filters', () => {
    expect(filterCourses(courses, { language: 'fr' })).toHaveLength(2);
    expect(filterCourses(courses, { language: 'fr', type: 'spoken' }).map((c) => c.id)).toEqual(['2']);
    expect(filterCourses(courses, { q: 'conversation' }).map((c) => c.id)).toEqual(['2']);
    expect(filterCourses(courses, {})).toHaveLength(3);
  });
});

describe('distinct', () => {
  it('sorts CEFR levels by level order, not alphabetically', () => {
    expect(distinct(courses, 'cefr')).toEqual(['a1', 'a2', 'b1']);
    expect(distinct(courses, 'language')).toEqual(['en', 'fr']);
  });
});

describe('groupLessonsByUnit', () => {
  it('groups by unit in lesson order', () => {
    const rows = [
      { lesson_number: 3, unit: 'U2' },
      { lesson_number: 1, unit: 'U1' },
      { lesson_number: 2, unit: 'U1' },
    ];
    const g = groupLessonsByUnit(rows);
    expect(g.map((u) => u.unit)).toEqual(['U1', 'U2']);
    expect(g[0].lessons.map((l) => l.lesson_number)).toEqual([1, 2]);
  });
});
