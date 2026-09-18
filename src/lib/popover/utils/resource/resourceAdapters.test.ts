import { describe, it, expect, vi } from 'vitest';
import {
  createTimerDisposable,
  createRafDisposable,
  createEventListenerDisposable,
  createAbortDisposable,
  createSubscriptionDisposable,
} from './resourceAdapters';

describe('resourceAdapters', () => {
  it('clears timers via createTimerDisposable', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const timerId = setTimeout(() => {}, 10000);
    const d = createTimerDisposable(timerId);

    d.dispose();
    expect(clearSpy).toHaveBeenCalledWith(timerId);
    clearSpy.mockRestore();
  });

  it('cancels animation frame via createRafDisposable', () => {
    const originalCancel = globalThis.cancelAnimationFrame;
    const cancelMock = vi.fn();
    globalThis.cancelAnimationFrame = cancelMock;

    const d = createRafDisposable(12345);
    d.dispose();
    expect(cancelMock).toHaveBeenCalledWith(12345);

    globalThis.cancelAnimationFrame = originalCancel;
  });

  it('removes event listener via createEventListenerDisposable', () => {
    const target = {
      removeEventListener: vi.fn(),
    } as unknown as EventTarget;
    const listener = () => {};

    const d = createEventListenerDisposable(target, 'click', listener);
    d.dispose();
    expect(target.removeEventListener).toHaveBeenCalledWith('click', listener, undefined);
  });

  it('aborts controller via createAbortDisposable', () => {
    const controller = new AbortController();
    expect(controller.signal.aborted).toBe(false);

    const d = createAbortDisposable(controller);
    d.dispose();
    expect(controller.signal.aborted).toBe(true);
  });

  it('executes unsubscribe via createSubscriptionDisposable', () => {
    const unsub = vi.fn();
    const d = createSubscriptionDisposable(unsub);
    d.dispose();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});
