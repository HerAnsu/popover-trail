import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverTransitionScheduler } from './transitionScheduler';

describe('PopoverTransitionScheduler', () => {
  let scheduler: PopoverTransitionScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new PopoverTransitionScheduler();
  });

  afterEach(() => {
    scheduler.dispose();
    vi.useRealTimers();
  });

  it('schedules and executes hover-leave timer', () => {
    const callback = vi.fn();
    scheduler.scheduleHoverLeave('card-1', 300, callback);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('debounces hover-leave when rescheduled', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    scheduler.scheduleHoverLeave('card-1', 300, callback1);
    vi.advanceTimersByTime(150);

    // Reschedule
    scheduler.scheduleHoverLeave('card-1', 300, callback2);
    vi.advanceTimersByTime(200);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('cancels hover timer upon cancelHover', () => {
    const callback = vi.fn();
    scheduler.scheduleHoverLeave('card-1', 300, callback);
    scheduler.cancelHover('card-1');

    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });

  it('schedules exit transition and cancels any pending hover', () => {
    const hoverCb = vi.fn();
    const exitCb = vi.fn();

    scheduler.scheduleHoverLeave('card-1', 500, hoverCb);
    scheduler.scheduleExitTransition('card-1', 200, exitCb);

    vi.advanceTimersByTime(200);
    expect(exitCb).toHaveBeenCalledTimes(1);
    expect(hoverCb).not.toHaveBeenCalled();
  });

  it('cancels all timers for multiple keys (cascade cancellation)', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    scheduler.scheduleHoverLeave('card-1', 300, cb1);
    scheduler.scheduleExitTransition('card-2', 300, cb2);

    scheduler.cancelAllForKeys(['card-1', 'card-2']);
    vi.advanceTimersByTime(500);

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });

  it('cleans up on dispose()', () => {
    const callback = vi.fn();
    scheduler.scheduleHoverLeave('card-1', 300, callback);
    scheduler.dispose();

    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });
});
