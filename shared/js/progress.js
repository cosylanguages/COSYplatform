/**
 * COSYplatform - CosyProgress
 * Handles saving and loading student lesson answers with Supabase sync and localStorage fallback.
 */

window.CosyProgress = window.CosyProgress || {};

(function(global) {
  'use strict';

  const debounceTimers = new Map();
  const PENDING_STORAGE_KEY = 'cosy_pending_answers';
  const DEBOUNCE_DELAY = 800; // ms

  function getClient() {
    return (global.CosyAuth && global.CosyAuth.client) ? global.CosyAuth.client : null;
  }

  async function getUserId() {
    const client = getClient();
    if (!client) return null;
    try {
      const { data: { session } } = await client.auth.getSession();
      return (session && session.user) ? session.user.id : null;
    } catch (e) {
      return null;
    }
  }

  function getPendingFromStorage() {
    try {
      const raw = localStorage.getItem(PENDING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function savePendingToStorage(obj) {
    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function queuePendingItem(lessonId, fieldKey, value, isCorrect) {
    const key = `${lessonId}::${fieldKey}`;
    const stored = getPendingFromStorage();
    stored[key] = { lessonId, fieldKey, value, isCorrect: isCorrect ?? null, time: Date.now() };
    savePendingToStorage(stored);
  }

  function removePendingItem(lessonId, fieldKey) {
    const key = `${lessonId}::${fieldKey}`;
    const stored = getPendingFromStorage();
    if (stored[key]) {
      delete stored[key];
      savePendingToStorage(stored);
    }
  }

  async function performUpsert(lessonId, fieldKey, value, isCorrect) {
    const client = getClient();
    if (!client) return false;

    const userId = await getUserId();
    if (!userId) return false;

    try {
      const payload = {
        student_id: userId,
        lesson_id: lessonId,
        field_key: fieldKey,
        value: value,
        is_correct: isCorrect !== undefined ? isCorrect : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('lesson_answers')
        .upsert(payload, { onConflict: 'student_id,lesson_id,field_key' });

      if (error) {
        console.warn('CosyProgress: upsert error', error);
        return false;
      }
      removePendingItem(lessonId, fieldKey);
      return true;
    } catch (err) {
      console.warn('CosyProgress: save error', err);
      return false;
    }
  }

  const CosyProgress = {
    /**
     * Saves an answer with ~800ms debounce. Updates offline queue and attempts sync.
     */
    saveAnswer(lessonId, fieldKey, value, isCorrect) {
      if (!lessonId || !fieldKey) return;

      queuePendingItem(lessonId, fieldKey, value, isCorrect);

      const timerKey = `${lessonId}::${fieldKey}`;
      if (debounceTimers.has(timerKey)) {
        clearTimeout(debounceTimers.get(timerKey));
      }

      const timer = setTimeout(async () => {
        debounceTimers.delete(timerKey);
        await performUpsert(lessonId, fieldKey, value, isCorrect);
      }, DEBOUNCE_DELAY);

      debounceTimers.set(timerKey, timer);
    },

    /**
     * Loads answers for a given lessonId from Supabase.
     * Returns an object mapping field_key -> value.
     */
    async loadAnswers(lessonId) {
      if (!lessonId) return {};

      const client = getClient();
      if (!client) return {};

      const userId = await getUserId();
      if (!userId) return {};

      try {
        const { data, error } = await client
          .from('lesson_answers')
          .select('field_key, value, is_correct, updated_at')
          .eq('student_id', userId)
          .eq('lesson_id', lessonId);

        if (error || !data) return {};

        const answers = {};
        data.forEach(item => {
          answers[item.field_key] = item.value;
        });
        return answers;
      } catch (err) {
        console.warn('CosyProgress: loadAnswers error', err);
        return {};
      }
    },

    /**
     * Immediately flushes debounced / unsynced pending answers to Supabase.
     */
    async flush() {
      for (const [timerKey, timer] of debounceTimers.entries()) {
        clearTimeout(timer);
      }
      debounceTimers.clear();

      const stored = getPendingFromStorage();
      const entries = Object.entries(stored);

      if (entries.length === 0) return;

      const client = getClient();
      const userId = await getUserId();
      if (!client || !userId) return;

      for (const [key, item] of entries) {
        const success = await performUpsert(item.lessonId, item.fieldKey, item.value, item.isCorrect);
        if (!success) {
          break;
        }
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      CosyProgress.flush();
    });
    window.addEventListener('beforeunload', () => {
      CosyProgress.flush();
    });
  }

  global.CosyProgress = CosyProgress;
})(typeof window !== 'undefined' ? window : this);
