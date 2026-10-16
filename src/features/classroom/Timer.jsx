import { useEffect, useReducer, useRef } from 'react';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { useToast } from '../../shared/ui/Toast.jsx';
import { Button } from '../../shared/ui/primitives.jsx';
import { formatTime, initialTimer, timerReducer } from './timerReducer.js';

export function Timer() {
  const t = useT();
  const toast = useToast();
  const [state, dispatch] = useReducer(timerReducer, initialTimer);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (!state.running) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [state.running]);

  useEffect(() => {
    if (wasRunning.current && !state.running && state.seconds === 0) toast(t('tools.timeUp'));
    wasRunning.current = state.running;
  }, [state, toast, t]);

  return (
    <div className="timer">
      <output className="timer-display" aria-live="off">{formatTime(state.seconds)}</output>
      <div className="row">
        <Button onClick={() => dispatch({ type: state.running ? 'pause' : 'start' })}>{state.running ? t('tools.timerPause') : t('tools.timerStart')}</Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'reset' })}>{t('tools.timerReset')}</Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'add', minutes: 1 })}>{t('tools.timerPlusOne')}</Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'add', minutes: 5 })}>{t('tools.timerPlusFive')}</Button>
      </div>
    </div>
  );
}
