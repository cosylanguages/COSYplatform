import { useEffect, useRef, useState } from 'react';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { Button } from '../../shared/ui/primitives.jsx';

/** Voice task. The recording stays in this browser tab (no upload). */
export function RecordWidget({ maxSeconds = 120, disabled }) {
  const t = useT();
  const [state, setState] = useState('idle'); // idle | recording | recorded
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const recorder = useRef(null);
  const stream = useRef(null);
  const stopTimer = useRef(null);

  const cleanup = () => { clearTimeout(stopTimer.current); stream.current?.getTracks().forEach((tr) => tr.stop()); };
  useEffect(() => () => { cleanup(); if (url) URL.revokeObjectURL(url); }, [url]);

  const start = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return setError(t('lesson.micUnavailable'));
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const rec = new MediaRecorder(stream.current);
      rec.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
      rec.onstop = () => {
        cleanup();
        setUrl(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })));
        setState('recorded');
      };
      recorder.current = rec;
      rec.start();
      setState('recording');
      stopTimer.current = setTimeout(() => rec.state === 'recording' && rec.stop(), maxSeconds * 1000);
    } catch {
      setError(t('lesson.micUnavailable'));
    }
  };
  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop();
  const reset = () => { if (url) URL.revokeObjectURL(url); setUrl(''); setState('idle'); };

  return (
    <div className="widget">
      <p><strong>{t('lesson.voiceTaskTitle')}</strong> <span className="muted">{t('lesson.voiceMaxTime', { seconds: maxSeconds })}</span></p>
      {state === 'idle' && <Button disabled={disabled} onClick={start}>{t('lesson.recordBtn')}</Button>}
      {state === 'recording' && <div className="row"><span role="status">{t('lesson.recording')}</span><Button variant="secondary" onClick={stop}>{t('lesson.stop')}</Button></div>}
      {state === 'recorded' && <div className="row"><audio controls src={url} /><Button variant="secondary" onClick={reset}>{t('lesson.recordAgain')}</Button></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="muted small">{t('lesson.recordPrivacy')}</p>
    </div>
  );
}
