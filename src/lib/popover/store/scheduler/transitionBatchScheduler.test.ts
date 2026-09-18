import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransitionBatchScheduler } from './transitionBatchScheduler';

describe('TransitionBatchScheduler', () => {
  let scheduler: TransitionBatchScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new TransitionBatchScheduler();
  });

  afterEach(() => {
    scheduler.dispose();
    vi.useRealTimers();
  });

  it('schedules and executes batch callbacks', () => {
    const cb = vi.fn();
    const handle = scheduler.schedule(200, cb);

    expect(handle.batchId).toBeGreaterThan(0);
    expect(scheduler.size).toBe(1);

    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(scheduler.size).toBe(0);
  });

  it('cancels pending batch callback before execution', () => {
    const cb = vi.fn();
    const handle = scheduler.schedule(200, cb);

    scheduler.cancel(handle);
    vi.advanceTimersByTime(300);
    expect(cb).not.toHaveBeenCalled();
    expect(scheduler.size).toBe(0);
  });

  it('cleans up all pending batches on clear() and dispose()', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    scheduler.schedule(200, cb1);
    scheduler.schedule(300, cb2);
    expect(scheduler.size).toBe(2);

    scheduler.clear();
    expect(scheduler.size).toBe(0);
    vi.advanceTimersByTime(500);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });
});
