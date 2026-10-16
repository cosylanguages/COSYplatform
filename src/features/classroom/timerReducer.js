// Pure timer state machine, replacing the window.timerSeconds globals duplicated in 3 pages.
export const DEFAULT_SECONDS = 5 * 60;
export const initialTimer = { seconds: DEFAULT_SECONDS, running: false };

export function timerReducer(state, action) {
  switch (action.type) {
    case 'start':
      return state.seconds > 0 ? { ...state, running: true } : state;
    case 'pause':
      return { ...state, running: false };
    case 'reset':
      return { seconds: action.seconds ?? DEFAULT_SECONDS, running: false };
    case 'add':
      return { ...state, seconds: Math.max(0, state.seconds + action.minutes * 60) };
    case 'tick': {
      if (!state.running) return state;
      const seconds = Math.max(0, state.seconds - 1);
      return { seconds, running: seconds > 0 };
    }
    default:
      return state;
  }
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
