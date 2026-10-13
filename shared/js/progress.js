/**
 * COSYplatform - CosyProgress
 * Handles saving and loading student lesson answers with Supabase sync and localStorage fallback.
 */

window.CosyProgress = window.CosyProgress || {};

(function(global) {
  'use strict';

  const debounceTimers = new Map();
  const PENDING_STORAGE_KEY_PREFIX = 'cosy_pending_answers';
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

  function getStorageKey(userId) {
    return userId ? `${PENDING_STORAGE_KEY_PREFIX}_${userId}` : PENDING_STORAGE_KEY_PREFIX;
  }

  function getPendingFromStorage(userId) {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function savePendingToStorage(userId, obj) {
    try {
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (e) {}
  }

  function queuePendingItem(userId, lessonId, fieldKey, value, isCorrect) {
    const key = `${lessonId}::${fieldKey}`;
    const stored = getPendingFromStorage(userId);
    stored[key] = { userId, lessonId, fieldKey, value, isCorrect: isCorrect ?? null, time: Date.now() };
    savePendingToStorage(userId, stored);
  }

  function removePendingItem(userId, lessonId, fieldKey) {
    const key = `${lessonId}::${fieldKey}`;
    const stored = getPendingFromStorage(userId);
    if (stored[key]) {
      delete stored[key];
      savePendingToStorage(userId, stored);
    }
  }

  async function performUpsert(userId, lessonId, fieldKey, value, isCorrect) {
    const client = getClient();
    if (!client) return false;

    const currentUserId = await getUserId();
    if (!currentUserId || currentUserId !== userId) return false;

    try {
      const payload = {
        student_id: currentUserId,
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
      removePendingItem(currentUserId, lessonId, fieldKey);
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
    async saveAnswer(lessonId, fieldKey, value, isCorrect) {
      if (!lessonId || !fieldKey) return;

      const userId = await getUserId();
      if (!userId) return;

      queuePendingItem(userId, lessonId, fieldKey, value, isCorrect);

      const timerKey = `${userId}::${lessonId}::${fieldKey}`;
      if (debounceTimers.has(timerKey)) {
        clearTimeout(debounceTimers.get(timerKey));
      }

      const timer = setTimeout(async () => {
        debounceTimers.delete(timerKey);
        await performUpsert(userId, lessonId, fieldKey, value, isCorrect);
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

      const client = getClient();
      const currentUserId = await getUserId();
      if (!client || !currentUserId) return;

      const stored = getPendingFromStorage(currentUserId);
      const entries = Object.entries(stored);

      if (entries.length === 0) return;

      for (const [key, item] of entries) {
        if (item.userId && item.userId !== currentUserId) continue;
        const success = await performUpsert(currentUserId, item.lessonId, item.fieldKey, item.value, item.isCorrect);
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
