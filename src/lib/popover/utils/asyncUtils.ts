/**
 * Asynchronous and Promise Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/asyncUtils
 */

import { isRecordObject, isFunction } from './typeGuards';
import { noop, constant } from './functional';
import { clamp } from './math';

/**
 * Type guard verifying whether an unknown value is a Promise or Thenable object.
 *
 * @template T - Promise resolved value type.
 * @param value - Value to inspect.
 * @returns True if `value` conforms to the standard PromiseLike interface.
 *
 * @example
 * ```typescript
 * if (isPromise(result)) {
 *   const data = await result;
 * }
 * ```
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  if (value instanceof Promise) return true;
  return isRecordObject(value) && 'then' in value && isFunction(value.then);
}

/**
 * Returns a Promise that resolves after the specified duration in milliseconds.
 *
 * @param ms - Delay in milliseconds (sanitized to non-negative finite range).
 * @returns Promise resolving after the timeout.
 *
 * @example
 * ```typescript
 * await sleep(150);
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, clamp(ms, 0, Infinity)));
}

/**
 * Defers execution of a synchronous task to the next microtask cycle.
 * Falls back to `Promise.resolve().then(...)` when `queueMicrotask` is unavailable.
 *
 * @param fn - Void callback to schedule.
 *
 * @example
 * ```typescript
 * deferMicrotask(() => {
 *   store.notifySubscribers();
 * });
 * ```
 */
export function deferMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    Promise.resolve()
      .then(fn)
      .catch(noop);
  }
}

/**
 * Detached promise control object allowing external resolution and status inspection.
 */
export interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T | PromiseLike<T>): void;
  reject(reason?: unknown): void;
  isSettled(): boolean;
  status(): 'pending' | 'resolved' | 'rejected';
}

/**
 * Creates an uncoupled Deferred promise container allowing external resolution and rejection.
 *
 * @template T - Resolution value type.
 * @returns Deferred object containing promise and resolution controllers.
 *
 * @example
 * ```typescript
 * const signal = deferred<string>();
 * signal.promise.then(console.log);
 * signal.resolve('ready');
 * ```
 */
export function deferred<T>(): Deferred<T> {
  let resolveFn!: (value: T | PromiseLike<T>) => void;
  let rejectFn!: (reason?: unknown) => void;
  let currentStatus: 'pending' | 'resolved' | 'rejected' = 'pending';

  const promise = new Promise<T>((res, rej) => {
    resolveFn = (val) => {
      if (currentStatus === 'pending') {
        currentStatus = 'resolved';
        res(val);
      }
    };
    rejectFn = (reason) => {
      if (currentStatus === 'pending') {
        currentStatus = 'rejected';
        rej(reason);
      }
    };
  });

  return {
    promise,
    resolve: resolveFn,
    reject: rejectFn,
    isSettled: () => currentStatus !== 'pending',
    status: () => currentStatus,
  };
}

/**
 * Enforces a maximum timeout on an asynchronous Promise, rejecting if not settled within duration.
 * Automatically clears internal timer on early promise settlement to prevent memory leaks.
 *
 * @template T - Promise return type.
 * @param promise - Target promise to monitor.
 * @param timeoutMs - Maximum allowable duration in milliseconds.
 * @param customError - Optional custom error instance or message string on timeout.
 * @returns Settled promise value, or rejects with timeout error.
 *
 * @example
 * ```typescript
 * const data = await withTimeout(fetchPopoverData(id), 5000, 'Data resolution timed out');
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  customError?: Error | string,
): Promise<T> {
  if (timeoutMs <= 0 || !Number.isFinite(timeoutMs)) {
    return promise;
  }

  let timerId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      timerId = null;
      const error =
        customError instanceof Error
          ? customError
          : new Error(
              typeof customError === 'string'
                ? customError
                : `[popover-trail]: Operation timed out after ${timeoutMs}ms`,
            );
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }
}

export interface DebouncedFunction<Args extends readonly unknown[]> {
  (...args: Args): void;
  cancel(): void;
  flush(): void;
  isPending(): boolean;
}

/**
 * Creates a debounced version of a procedure delaying execution until waitMs elapses after last call.
 * Augmented with `.cancel()`, `.flush()`, and `.isPending()` control handles.
 *
 * @template Args - Parameter types tuple.
 * @param fn - Procedure to debounce.
 * @param waitMs - Debounce cooldown in milliseconds.
 * @returns Debounced procedure with cancellation and flush handles.
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   filterTrail(query);
 * }, 200);
 * debouncedSearch('settings');
 * debouncedSearch.cancel();
 * ```
 */
export function debounce<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): DebouncedFunction<Args> {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const debounced = (...args: Args) => {
    lastArgs = args;
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(
      () => {
        timerId = null;
        if (lastArgs !== null) {
          const argsToCall = lastArgs;
          lastArgs = null;
          fn(...argsToCall);
        }
      },
      clamp(waitMs, 0, Infinity),
    );
  };

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timerId !== null && lastArgs !== null) {
      clearTimeout(timerId);
      timerId = null;
      const argsToCall = lastArgs;
      lastArgs = null;
      fn(...argsToCall);
    }
  };

  debounced.isPending = () => timerId !== null;

  return debounced;
}

export interface ThrottledFunction<Args extends readonly unknown[]> {
  (...args: Args): void;
  cancel(): void;
}

/**
 * Creates a throttled version of a procedure executing at most once per waitMs window.
 * Trailing executions are scheduled automatically if called during cooldown.
 *
 * @template Args - Parameter types tuple.
 * @param fn - Procedure to throttle.
 * @param waitMs - Throttle cooldown in milliseconds.
 * @returns Throttled procedure with cancellation handle.
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((ev: Event) => {
 *   updateScrollCoordinates();
 * }, 50);
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): ThrottledFunction<Args> {
  let lastExecTime = 0;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastTrailingArgs: Args | null = null;

  const throttled = (...args: Args) => {
    const now = Date.now();
    const remaining = waitMs - (now - lastExecTime);

    if (remaining <= 0 || remaining > waitMs) {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      lastTrailingArgs = null;
      lastExecTime = now;
      fn(...args);
    } else {
      lastTrailingArgs = args;
      if (timerId === null) {
        timerId = setTimeout(() => {
          lastExecTime = Date.now();
          timerId = null;
          if (lastTrailingArgs !== null) {
            const argsToCall = lastTrailingArgs;
            lastTrailingArgs = null;
            fn(...argsToCall);
          }
        }, remaining);
      }
    }
  };

  throttled.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastTrailingArgs = null;
    lastExecTime = 0;
  };

  return throttled;
}

/**
 * Options configuring the exponential backoff retry policy.
 */
export interface RetryOptions {
  readonly retries?: number;
  readonly delayMs?: number;
  readonly backoffMultiplier?: number;
  readonly maxDelayMs?: number;
  readonly shouldRetry?: (error: unknown) => boolean;
}

/**
 * Retries an asynchronous operation with exponential backoff.
 *
 * @template T - Return type.
 * @param fn - Asynchronous function to execute.
 * @param options - Configuration options for retries, delays, and backoff.
 * @returns Result of the resolved asynchronous operation.
 *
 * @example
 * ```typescript
 * const data = await retryAsync(() => fetchUserData(userId), {
 *   retries: 3,
 *   delayMs: 200,
 *   backoffMultiplier: 2,
 * });
 * ```
 */
export async function retryAsync<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const {
    retries = 3,
    delayMs = 100,
    backoffMultiplier = 2,
    maxDelayMs = 5000,
    shouldRetry = constant(true),
  } = options ?? {};

  const attempt = async (remainingRetries: number, currentDelay: number): Promise<T> => {
    try {
      return await fn();
    } catch (err: unknown) {
      if (remainingRetries <= 0 || !shouldRetry(err)) {
        throw err;
      }
      if (currentDelay > 0) {
        await sleep(currentDelay);
      }
      const nextDelay = clamp(currentDelay * backoffMultiplier, 0, maxDelayMs);
      return attempt(remainingRetries - 1, nextDelay);
    }
  };

  return attempt(retries, clamp(delayMs, 0, Infinity));
}

/**
 * Asynchronous mutex lock for serializing critical asynchronous sections.
 */
export interface AsyncMutex {
  runExclusive<T>(fn: () => Promise<T>): Promise<T>;
  isLocked(): boolean;
}

/**
 * Creates an asynchronous mutex lock guaranteeing sequential FIFO execution without race conditions.
 *
 * @returns An AsyncMutex instance.
 *
 * @example
 * ```typescript
 * const mutex = createAsyncMutex();
 * await mutex.runExclusive(async () => {
 *   await savePopoverTransaction();
 * });
 * ```
 */
export function createAsyncMutex(): AsyncMutex {
  let pending: Promise<unknown> = Promise.resolve();
  let locked = false;

  return {
    async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
      const current = pending;
      let release: () => void = noop;
      pending = new Promise<void>((resolve) => {
        release = resolve;
      });

      try {
        await current;
      } catch {
        // Proceed even if previous task encountered an unhandled rejection
      }

      locked = true;
      try {
        return await fn();
      } finally {
        locked = false;
        release();
      }
    },
    isLocked: () => locked,
  };
}

