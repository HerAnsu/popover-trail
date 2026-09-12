/**
 * Asynchronous and Promise Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/asyncUtils
 */

import { isRecordObject, isFunction } from './typeGuards';

export function isPromise<T>(value: unknown): value is Promise<T> {
  if (value instanceof Promise) return true;
  return isRecordObject(value) && 'then' in value && isFunction(value.then);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export function deferMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    Promise.resolve()
      .then(fn)
      .catch(() => {});
  }
}
