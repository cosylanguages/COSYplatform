import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../shared/supabase/client.js';
import { localKey, mergeAnswers, pendingKey, rowsToMap } from './answers.js';

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

/**
 * Answers for one lesson: instant local cache (same key as the legacy pages, so existing
 * answers carry over) plus debounced upsert to lesson_answers. Failed saves stay "pending"
 * and are retried on the next load or when the browser comes back online.
 */
export function useLessonAnswers(lessonId, userId, enabled = true) {
  const [answers, setAnswers] = useState(() => read(localKey(lessonId), {}));
  const latest = useRef(answers);
  const timers = useRef({});

  const upsert = useCallback(async (field) => {
    if (!supabase || !userId) return;
    const { error } = await supabase.from('lesson_answers').upsert(
      { student_id: userId, lesson_id: lessonId, field_key: field, value: latest.current[field] ?? '', is_correct: null, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,lesson_id,field_key' },
    );
    const pending = read(pendingKey(lessonId), []);
    write(pendingKey(lessonId), error ? [...new Set([...pending, field])] : pending.filter((k) => k !== field));
  }, [lessonId, userId]);

  const flushPending = useCallback(() => read(pendingKey(lessonId), []).forEach(upsert), [lessonId, upsert]);

  useEffect(() => {
    const local = read(localKey(lessonId), {});
    latest.current = local;
    setAnswers(local);
    if (!enabled || !supabase || !userId) return undefined;
    let live = true;
    supabase.from('lesson_answers').select('field_key, value').eq('student_id', userId).eq('lesson_id', lessonId).then(({ data }) => {
      if (!live || !data) return;
      const merged = mergeAnswers(latest.current, rowsToMap(data), read(pendingKey(lessonId), []));
      latest.current = merged; write(localKey(lessonId), merged); setAnswers(merged);
      flushPending();
    });
    window.addEventListener('online', flushPending);
    return () => { live = false; window.removeEventListener('online', flushPending); };
  }, [lessonId, userId, enabled, flushPending]);

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  const setAnswer = useCallback((field, value) => {
    const next = { ...latest.current, [field]: value };
    latest.current = next; write(localKey(lessonId), next); setAnswers(next);
    if (!enabled) return;
    write(pendingKey(lessonId), [...new Set([...read(pendingKey(lessonId), []), field])]);
    clearTimeout(timers.current[field]);
    timers.current[field] = setTimeout(() => upsert(field), 600);
  }, [lessonId, enabled, upsert]);

  return { answers, setAnswer };
}
