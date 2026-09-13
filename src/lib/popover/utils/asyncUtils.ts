/**
 * Asynchronous and Promise Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/asyncUtils
 */

import { isRecordObject, isFunction } from './typeGuards';
import { noop, constant } from './functional';
import { clamp } from './math';

export function isPromise<T>(value: unknown): value is Promise<T> {
  if (value instanceof Promise) return true;
  return isRecordObject(value) && 'then' in value && isFunction(value.then);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, clamp(ms, 0, Infinity)));
}

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
 * Creates an uncoupled Deferred promise container.
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
 */
export async function retryAsync<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const retries = options?.retries ?? 3;
  const delayMs = options?.delayMs ?? 100;
  const backoffMultiplier = options?.backoffMultiplier ?? 2;
  const maxDelayMs = options?.maxDelayMs ?? 5000;
  const shouldRetry = options?.shouldRetry ?? constant(true);

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

