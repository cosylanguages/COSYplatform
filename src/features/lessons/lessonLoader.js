import { supabase } from '../../shared/supabase/client.js';
import { isValidLessonId } from './answers.js';
import { parseLessonBody } from './parseLesson.js';

/**
 * Loads a lesson through RLS:
 *  - everyone: lesson_student_content.body (sanitized student view)
 *  - teacher/founder: also lesson_protected rows (answer keys, teacher notes, session scripts)
 * Students never receive protected rows; RLS enforces that even if this code were changed.
 */
export async function loadLesson(lessonId, { teacher = false } = {}) {
  if (!isValidLessonId(lessonId)) throw new Error('Lesson content is unavailable.');
  if (!supabase) throw new Error('Lesson content is unavailable.');

  const [{ data: student }, protectedRes] = await Promise.all([
    supabase.from('lesson_student_content').select('body').eq('lesson_id', lessonId).maybeSingle(),
    teacher ? supabase.from('lesson_protected').select('kind, content').eq('lesson_id', lessonId) : Promise.resolve({ data: [] }),
  ]);

  const protectedRows = protectedRes.data || [];
  const sources = [];
  // Teacher view prefers the full session body when present and parseable.
  if (teacher) protectedRows.filter((r) => r.kind === 'session-body').forEach((r) => sources.push(r.content));
  if (student?.body) sources.push(student.body);

  let lesson = null;
  for (const body of sources) {
    try {
      const parsed = parseLessonBody(body);
      if (parsed.slides.length) { lesson = parsed; break; }
    } catch { /* try next source */ }
  }
  if (!lesson) throw new Error('Lesson content is unavailable.');

  return {
    lesson,
    notes: protectedRows.filter((r) => r.kind === 'teacher-notes' || r.kind === 'answer-key'),
  };
}
