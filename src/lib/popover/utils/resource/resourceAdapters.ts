/**
 * Standard Environment and Runtime Resource Disposable Adapters.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/resourceAdapters
 */

import { createDisposable } from './singleDisposable';
import type { ScopeDisposable } from './disposableTypes';

export function createTimerDisposable(
  timerId: ReturnType<typeof setTimeout>,
): ScopeDisposable {
  return createDisposable(() => {
    clearTimeout(timerId);
  });
}

export function createRafDisposable(rafId: number): ScopeDisposable {
  return createDisposable(() => {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafId);
    }
  });
}

export function createEventListenerDisposable<K extends string>(
  target: EventTarget | null | undefined,
  type: K,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions,
): ScopeDisposable {
  return createDisposable(() => {
    target?.removeEventListener(type, listener, options);
  });
}

export function createAbortDisposable(controller: AbortController | null | undefined): ScopeDisposable {
  return createDisposable(() => {
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  });
}

export function createSubscriptionDisposable(unsubscribe: () => void): ScopeDisposable {
  return createDisposable(unsubscribe);
}
