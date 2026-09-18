/**
 * Development & Testing Assertions for Pool Leak Auditing.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolAssert
 */

import type { LeakedItemInfo } from './poolTypes';

export interface PoolAuditable<T> {
  readonly inUse: number;
  readonly capacity: number;
  getLeakedObjects: () => Map<T, LeakedItemInfo>;
}

export function checkPoolClean(pool: { inUse: number }): boolean {
  return pool.inUse === 0;
}

export function assertPoolClean<T>(pool: PoolAuditable<T>): boolean {
  if (pool.inUse === 0) return true;

  const leaks = pool.getLeakedObjects();
  let details = '';
  let count = 0;

  for (const [, info] of leaks.entries()) {
    count++;
    if (count <= 3 && info.stack) {
      details += `\n[Leak #${count}] Acquired at ${info.acquiredAt}:\n${info.stack.split('\n').slice(1, 4).join('\n')}`;
    }
  }

  const overflow = count > 3 ? `\n...and ${count - 3} more leaked item(s)` : '';
  throw new Error(
    `[ObjectPool Assertion Failed]: Pool has ${pool.inUse} unreleased item(s) in flight.${details}${overflow}`,
  );
}
