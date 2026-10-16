// Pure access helpers. These only decide what the UI shows;
// Supabase RLS is the real gate for protected content.

export const ROLES = ['student', 'teacher', 'founder'];
export const roleHome = (role) => (role === 'founder' ? '/founder' : role === 'teacher' ? '/teacher' : '/student');

export const normalizeRole = (role) => {
  const r = String(role || '').toLowerCase();
  return ROLES.includes(r) ? r : 'student';
};

/** Only same-site relative paths are allowed as post-login targets (no open redirect). */
export function safeRedirect(target, fallback = '/hub') {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) {
    return fallback;
  }
  return target;
}

/** Ported from CosyAuth.isCourseAccessible. course_level may be "*", "a1", or an array. */
export function isCourseAccessible(course, profile) {
  if (!profile) return false;
  if (profile.role === 'founder') return true;
  if (course.status === 'not_yet_available') return false;

  const langs = Array.isArray(profile.language_access) ? profile.language_access : [];
  const courseLang = String(course.language || course.lang || '').toLowerCase();
  if (!(langs.includes('*') || langs.some((l) => String(l).toLowerCase() === courseLang))) return false;

  const level = profile.course_level || '*';
  const req = String(course.cefr || course.level || '').toLowerCase();
  const allowed = Array.isArray(level) ? level : [level];
  return allowed.includes('*') || allowed.some((l) => String(l).toLowerCase() === req);
}
