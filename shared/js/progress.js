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
  let queueRevision = 0;

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
    const item = { userId, lessonId, fieldKey, value, isCorrect: isCorrect ?? null, time: Date.now(), revision: ++queueRevision };
    stored[key] = item;
    savePendingToStorage(userId, stored);
    return item.revision;
  }

  function removePendingItem(userId, lessonId, fieldKey, expectedRevision) {
    const key = `${lessonId}::${fieldKey}`;
    const stored = getPendingFromStorage(userId);
    // An older in-flight request must never erase a newer locally queued value.
    if (stored[key] && stored[key].revision === expectedRevision) {
      delete stored[key];
      savePendingToStorage(userId, stored);
    }
  }
  async function performUpsert(userId, lessonId, fieldKey, value, isCorrect, expectedRevision) {
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
      removePendingItem(currentUserId, lessonId, fieldKey, expectedRevision);
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

      const revision = queuePendingItem(userId, lessonId, fieldKey, value, isCorrect);

      const timerKey = `${userId}::${lessonId}::${fieldKey}`;
      if (debounceTimers.has(timerKey)) {
        clearTimeout(debounceTimers.get(timerKey));
      }

      const timer = setTimeout(async () => {
        debounceTimers.delete(timerKey);
        await performUpsert(userId, lessonId, fieldKey, value, isCorrect, revision);
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

      // Keep this user's unsynced answers usable if the server read is unavailable.
      const pendingAnswers = {};
      const pending = getPendingFromStorage(userId);
      Object.values(pending).forEach(item => {
        if (item && item.userId === userId && item.lessonId === lessonId && item.fieldKey) {
          pendingAnswers[item.fieldKey] = item.value;
        }
      });

      try {
        const { data, error } = await client
          .from('lesson_answers')
          .select('field_key, value, is_correct, updated_at')
          .eq('student_id', userId)
          .eq('lesson_id', lessonId);

        if (error || !data) return pendingAnswers;

        const answers = {};
        data.forEach(item => {
          answers[item.field_key] = item.value;
        });

        // Locally queued answers are newer than the last successful server sync.
        return Object.assign(answers, pendingAnswers);
      } catch (err) {
        console.warn('CosyProgress: loadAnswers error', err);
        return pendingAnswers;
      }
    },

    /**
     * Clears this authenticated student's saved answers for one lesson.
     * Returns false when the server cannot confirm the deletion, so the UI
     * does not claim a reset that would reappear on the next lesson load.
     */
    async clearLessonAnswers(lessonId) {
      if (!lessonId) return false;
      const client = getClient();
      const userId = await getUserId();
      if (!client || !userId) return false;

      try {
        // Stop delayed upserts first so a queued write cannot race and recreate
        // a row after the server-side delete completes.
        for (const [timerKey, timer] of debounceTimers.entries()) {
          if (timerKey.startsWith(`${userId}::${lessonId}::`)) {
            clearTimeout(timer);
            debounceTimers.delete(timerKey);
          }
        }

        const { error } = await client
          .from('lesson_answers')
          .delete()
          .eq('student_id', userId)
          .eq('lesson_id', lessonId);

        if (error) {
          console.warn('CosyProgress: clear answers error', error);
          return false;
        }

        // Some RLS configurations can make DELETE affect zero rows without
        // returning an error. Verify the lesson is actually empty before
        // discarding the local retry queue or telling the student reset worked.
        const { data: remaining, error: verifyError } = await client
          .from('lesson_answers')
          .select('field_key')
          .eq('student_id', userId)
          .eq('lesson_id', lessonId);
        if (verifyError || !Array.isArray(remaining) || remaining.length > 0) {
          console.warn('CosyProgress: answer reset could not be verified', verifyError);
          return false;
        }

        const pending = getPendingFromStorage(userId);
        Object.entries(pending).forEach(([key, item]) => {
          if (item && item.userId === userId && item.lessonId === lessonId) delete pending[key];
        });
        savePendingToStorage(userId, pending);
        return true;
      } catch (err) {
        console.warn('CosyProgress: clear answers error', err);
        return false;
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
        const success = await performUpsert(currentUserId, item.lessonId, item.fieldKey, item.value, item.isCorrect, item.revision);
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
