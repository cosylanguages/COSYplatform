import { describe, expect, it } from 'vitest';
import { formatTime, initialTimer, timerReducer } from './timerReducer.js';

describe('timerReducer', () => {
  it('counts down and stops at zero', () => {
    let s = timerReducer({ seconds: 2, running: false }, { type: 'start' });
    s = timerReducer(s, { type: 'tick' });
    expect(s).toEqual({ seconds: 1, running: true });
    s = timerReducer(s, { type: 'tick' });
    expect(s).toEqual({ seconds: 0, running: false });
  });
  it('ignores ticks while paused', () => {
    expect(timerReducer(initialTimer, { type: 'tick' })).toBe(initialTimer);
  });
  it('adds minutes, never below zero, and resets', () => {
    expect(timerReducer({ seconds: 30, running: false }, { type: 'add', minutes: 1 }).seconds).toBe(90);
    expect(timerReducer({ seconds: 30, running: false }, { type: 'add', minutes: -5 }).seconds).toBe(0);
    expect(timerReducer({ seconds: 3, running: true }, { type: 'reset' })).toEqual({ seconds: 300, running: false });
  });
  it('formats mm:ss', () => {
    expect(formatTime(65)).toBe('01:05');
  });
});
