import { supabase } from '../../shared/supabase/client.js';

export const CEFR_LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

/** Courses are public-preview rows (RLS: is_public_preview). */
export async function fetchCourses() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('courses')
    .select('id, language, cefr, course_type, title, description, total_lessons')
    .order('language')
    .order('course_type')
    .order('cefr');
  if (error) throw error;
  return data || [];
}

/** course_preview is one row per (course, lesson). */
export async function fetchCourseLessons(courseId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('course_preview')
    .select('course_id, course_title, lesson_id, lesson_number, unit, section_number, lesson_title, lesson_summary, status, teacher_led, is_optional, is_milestone, is_exam')
    .eq('course_id', courseId)
    .order('lesson_number');
  if (error) throw error;
  return data || [];
}

const norm = (v) => String(v ?? '').toLowerCase();

/** Pure filter used by the catalog. Empty filter values mean "no constraint". */
export function filterCourses(courses, { q = '', language = '', type = '', level = '' } = {}) {
  const needle = norm(q).trim();
  return courses.filter(
    (c) =>
      (!language || norm(c.language) === norm(language)) &&
      (!type || norm(c.course_type) === norm(type)) &&
      (!level || norm(c.cefr) === norm(level)) &&
      (!needle || norm(c.title).includes(needle) || norm(c.description).includes(needle)),
  );
}

/** Distinct, sorted option values for a filter (CEFR sorted by level order). */
export function distinct(courses, field) {
  const set = [...new Set(courses.map((c) => norm(c[field])).filter(Boolean))];
  return field === 'cefr' ? set.sort((a, b) => CEFR_LEVELS.indexOf(a) - CEFR_LEVELS.indexOf(b)) : set.sort();
}

/** Group lesson rows into units, preserving lesson order. Rows without a unit go under "". */
export function groupLessonsByUnit(rows) {
  const units = [];
  const byKey = new Map();
  for (const row of [...rows].sort((a, b) => a.lesson_number - b.lesson_number)) {
    const key = row.unit ?? '';
    if (!byKey.has(key)) {
      const unit = { unit: key, lessons: [] };
      byKey.set(key, unit);
      units.push(unit);
    }
    byKey.get(key).lessons.push(row);
  }
  return units;
}
