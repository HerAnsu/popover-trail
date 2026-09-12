/**
 * Promise Rejection Handler for Cache Storage.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/cache/cacheRejection
 */

import type { StorageAdapter } from './cacheTypes';

function isCatchable(val: unknown): val is { catch: (onRejected: () => void) => unknown } {
  return (
    typeof val === 'object' &&
    val !== null &&
    'catch' in val &&
    typeof val.catch === 'function'
  );
}

export function handlePromiseRejection<T>(
  storage: StorageAdapter<T>,
  key: string,
  data: T,
): void {
  if (isCatchable(data)) {
    data.catch(() => {
      if (storage.get(key)?.data === data) storage.delete(key);
    });
  }
}
