// Pure helpers for answer persistence (local cache + server sync).

export const localKey = (lessonId) => `cosy_ans_${lessonId}`; // same key as the legacy pages
export const pendingKey = (lessonId) => `cosy_pending_${lessonId}`;

export const rowsToMap = (rows = []) => Object.fromEntries(rows.map((r) => [r.field_key, r.value ?? '']));

/** Server wins, except for keys still waiting to sync: those keep the local (newer) value. */
export function mergeAnswers(local = {}, server = {}, pending = []) {
  const merged = { ...local, ...server };
  for (const k of pending) if (k in local) merged[k] = local[k];
  return merged;
}

/** Lesson ids may be legacy paths or "<lang>:<cefr>:<slug>". Reject anything that could escape. */
export function isValidLessonId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9:_./-]{1,200}$/.test(id) && !id.split('/').some((p) => p === '..' || p === '.');
}
