import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useT } from '../../shared/i18n/I18nContext.jsx';

// TODO(sync): persist to Supabase once the `lesson_notes` table and the
// save_lesson_note / join_lesson_note RPCs exist in supabase/migrations.
const storageKey = (userId, scope) => `cosy:notes:${userId || 'anon'}:${scope}`;

export function NotesPanel({ scope = 'general' }) {
  const t = useT();
  const { user } = useAuth();
  const key = storageKey(user?.id, scope);
  const [text, setText] = useState(() => { try { return localStorage.getItem(key) || ''; } catch { return ''; } });
  const [status, setStatus] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (e) => {
    const value = e.target.value;
    setText(value);
    setStatus(t('notes.saving'));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { localStorage.setItem(key, value); setStatus(t('notes.savedLocally')); } catch { setStatus(t('notes.saveFailed')); }
    }, 500);
  };

  return (
    <div>
      <textarea rows={10} value={text} onChange={onChange} placeholder={t('classroom.notesPlaceholder')} aria-label={t('classroom.notesTitle')} />
      <p className="muted" aria-live="polite">{status}</p>
    </div>
  );
}
