import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { useAsync } from '../../shared/hooks/useAsync.js';
import { Button, ErrorState, Spinner } from '../../shared/ui/primitives.jsx';
import { loadLesson } from './lessonLoader.js';
import { SlideContent } from './LessonRenderer.jsx';
import { useLessonAnswers } from './useLessonAnswers.js';

/** Slide-by-slide lesson. mode "teacher" adds teacher notes and a toggleable answer key. */
export function LessonViewer({ lessonId, mode = 'student' }) {
  const t = useT();
  const { user } = useAuth();
  const teacher = mode === 'teacher';
  const { data, error, loading } = useAsync(() => loadLesson(lessonId, { teacher }), [lessonId, teacher]);
  const { answers, setAnswer } = useLessonAnswers(lessonId, user?.id, !teacher);
  const [idx, setIdx] = useState(0);
  const [showKeys, setShowKeys] = useState(false);

  const total = data?.lesson.slides.length || 0;
  const go = useCallback((d) => setIdx((i) => Math.min(Math.max(i + d, 0), Math.max(total - 1, 0))), [total]);

  useEffect(() => setIdx(0), [lessonId]);
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={{ message: t('common.lessonLoadFailed') }} />;

  const { lesson, notes } = data;
  const slide = lesson.slides[idx];
  const slideTitle = slide.title || t('lesson.defaultSlideTitle');

  return (
    <article className="lesson">
      <header className="lesson-head">
        <h1>{lesson.title || t(teacher ? 'lesson.defaultTitleTeacher' : 'lesson.defaultTitle')}</h1>
        <div className="lesson-controls">
          <label className="field">
            <span className="field-label">{t('tools.sections', { count: total })}</span>
            <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
              {lesson.slides.map((s, i) => <option key={s.id} value={i}>{t('tools.slideLabel', { number: i + 1, title: s.title || t('lesson.defaultSlideTitle') })}</option>)}
            </select>
          </label>
          {teacher && <Button variant="secondary" aria-pressed={showKeys} onClick={() => setShowKeys((v) => !v)} title={t('tools.answerKeysTitle')}>{t('tools.answerKeys')}</Button>}
        </div>
      </header>

      <section aria-labelledby="slide-title">
        <h2 id="slide-title">{t('tools.slideLabel', { number: idx + 1, title: slideTitle })}</h2>
        <SlideContent slide={slide} index={idx} teacher={teacher} showKeys={showKeys} answers={answers} onAnswer={setAnswer} />
      </section>

      {teacher && notes.length > 0 && idx === total - 1 && (
        <section className="teacher-note">
          {notes.map((n, i) => <pre key={i} className="note-text">{n.content}</pre>)}
        </section>
      )}

      <nav className="slide-nav" aria-label={t('tools.sections', { count: total })}>
        <Button variant="secondary" onClick={() => go(-1)} disabled={idx === 0}>{t('lesson.previous')}</Button>
        <span className="muted">{idx + 1} / {total}</span>
        <Button onClick={() => go(1)} disabled={idx >= total - 1}>{t('lesson.next')}</Button>
      </nav>
    </article>
  );
}
