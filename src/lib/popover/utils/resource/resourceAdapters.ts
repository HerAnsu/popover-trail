/**
 * Standard Environment and Runtime Resource Disposable Adapters.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/resourceAdapters
 */

import { createDisposable } from './singleDisposable';
import type { ScopeDisposable } from './disposableTypes';

/**
 * Wraps a setTimeout/setInterval timer ID into an idempotent disposable.
 *
 * @param timerId - Return value from setTimeout or setInterval.
 * @returns Disposable that calls `clearTimeout` upon disposal.
 *
 * @example
 * ```typescript
 * const timer = createTimerDisposable(setTimeout(() => doWork(), 1000));
 * timer.dispose(); // Cancels the timer
 * ```
 */
export function createTimerDisposable(timerId: ReturnType<typeof setTimeout>): ScopeDisposable {
  return createDisposable(() => {
    clearTimeout(timerId);
  });
}

/**
 * Wraps a requestAnimationFrame ID into an idempotent disposable.
 *
 * @param rafId - Return value from requestAnimationFrame.
 * @returns Disposable that calls `cancelAnimationFrame` upon disposal.
 *
 * @example
 * ```typescript
 * const anim = createRafDisposable(requestAnimationFrame(tick));
 * anim.dispose(); // Cancels pending animation frame
 * ```
 */
export function createRafDisposable(rafId: number): ScopeDisposable {
  return createDisposable(() => {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafId);
    }
  });
}

/**
 * Wraps a DOM or EventTarget listener into an idempotent disposable.
 *
 * @template K - Event name string type.
 * @param target - EventTarget, DOM Node, or Window (safely handles null/undefined).
 * @param type - Event name (e.g. 'keydown', 'pointermove').
 * @param listener - Event listener callback or object.
 * @param options - Optional event listener options or capture boolean.
 * @returns Disposable that removes the listener upon disposal.
 *
 * @example
 * ```typescript
 * const listener = createEventListenerDisposable(window, 'keydown', onKeyDown);
 * listener.dispose(); // Removes listener
 * ```
 */
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

/**
 * Wraps an AbortController into an idempotent disposable.
 *
 * @param controller - AbortController instance (safely handles null/undefined).
 * @returns Disposable that triggers `controller.abort()` upon disposal.
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const abort = createAbortDisposable(controller);
 * abort.dispose(); // Aborts if not already aborted
 * ```
 */
export function createAbortDisposable(
  controller: AbortController | null | undefined,
): ScopeDisposable {
  return createDisposable(() => {
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  });
}

/**
 * Wraps a generic unsubscribe callback into an idempotent disposable.
 *
 * @param unsubscribe - Callback function invoked on disposal.
 * @returns Disposable that executes the unsubscribe function.
 *
 * @example
 * ```typescript
 * const sub = createSubscriptionDisposable(store.subscribe(handleChange));
 * sub.dispose(); // Unsubscribes
 * ```
 */
export function createSubscriptionDisposable(unsubscribe: () => void): ScopeDisposable {
  return createDisposable(unsubscribe);
}
