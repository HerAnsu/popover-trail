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

  it('schedules and cancels transition batches', () => {
    const batchCb = vi.fn();
    const handle = scheduler.scheduleBatch(200, batchCb);
    vi.advanceTimersByTime(100);
    scheduler.cancelBatch(handle);
    vi.advanceTimersByTime(200);
    expect(batchCb).not.toHaveBeenCalled();

    const batchCb2 = vi.fn();
    scheduler.scheduleBatch(200, batchCb2);
    vi.advanceTimersByTime(200);
    expect(batchCb2).toHaveBeenCalledTimes(1);
  });

  it('cancels all hover and exit timers via cancelAllHover and cancelAllExit', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    scheduler.scheduleHoverLeave('card-1', 300, cb1);
    scheduler.cancelAllHover();
    vi.advanceTimersByTime(500);
    expect(cb1).not.toHaveBeenCalled();

    scheduler.scheduleExitTransition('card-2', 300, cb2);
    scheduler.cancelAllExit();
    vi.advanceTimersByTime(500);
    expect(cb2).not.toHaveBeenCalled();
  });

  it('checks active transition state predicates', () => {
    expect(scheduler.hasPendingTransitions()).toBe(false);
    expect(scheduler.hasActiveHover('card-1')).toBe(false);
    expect(scheduler.hasActiveExit('card-1')).toBe(false);

    scheduler.scheduleHoverLeave('card-1', 300, () => {});
    expect(scheduler.hasActiveHover('card-1')).toBe(true);
    expect(scheduler.hasPendingTransitions()).toBe(true);

    scheduler.scheduleExit('card-2', 300, () => {});
    expect(scheduler.hasActiveExit('card-2')).toBe(true);
    scheduler.cancelExit('card-2');
    expect(scheduler.hasActiveExit('card-2')).toBe(false);

    // cancelAllForKey test
    const hCb = vi.fn();
    const eCb = vi.fn();
    scheduler.scheduleHoverLeave('card-k', 300, hCb);
    scheduler.scheduleExitTransition('card-k', 300, eCb);
    scheduler.cancelAllForKey('card-k');
    vi.advanceTimersByTime(500);
    expect(hCb).not.toHaveBeenCalled();
    expect(eCb).not.toHaveBeenCalled();
  });
});
