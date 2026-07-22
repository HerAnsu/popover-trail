import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTimerManager } from './timers';

describe('TimerManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('manages hover close timers correctly', () => {
    const manager = createTimerManager();
    const mockTimer = setTimeout(() => {}, 1000);

    manager.hoverCloseTimers.set('card-1', mockTimer);
    expect(manager.hoverCloseTimers.has('card-1')).toBe(true);

    manager.clearHoverTimer('card-1');
    expect(manager.hoverCloseTimers.has('card-1')).toBe(false);
  });

  it('manages transition timers correctly', () => {
    const manager = createTimerManager();
    const mockTimer = setTimeout(() => {}, 1000);

    manager.transitionTimers.set('card-1', mockTimer);
    expect(manager.transitionTimers.has('card-1')).toBe(true);

    manager.clearTransitionTimer('card-1');
    expect(manager.transitionTimers.has('card-1')).toBe(false);
  });

  it('clears all hover and transition timers on clearAllTimers()', () => {
    const manager = createTimerManager();
    manager.hoverCloseTimers.set(
      'c1',
      setTimeout(() => {}, 1000),
    );
    manager.transitionTimers.set(
      't1',
      setTimeout(() => {}, 1000),
    );

    expect(manager.hoverCloseTimers.size).toBe(1);
    expect(manager.transitionTimers.size).toBe(1);

    manager.clearAllTimers();

    expect(manager.hoverCloseTimers.size).toBe(0);
    expect(manager.transitionTimers.size).toBe(0);
  });
});
