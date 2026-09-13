/**
 * Batch Acquisition and Release Operations for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolBatch
 */

import type { Maybe } from '../../types/utilityTypes';
import { isNonNullable } from '../predicates';

export function acquireManyItems<T>(acquireSingle: () => T, count: number, out: T[] = []): T[] {
  const targetCount = Math.max(0, count);
  for (let i = 0; i < targetCount; i++) {
    out.push(acquireSingle());
  }
  return out;
}

export function releaseManyItems<T>(
  releaseSingle: (item: T) => void,
  items: Iterable<Maybe<T>>,
): void {
  for (const item of items) {
    if (isNonNullable(item)) {
      releaseSingle(item);
    }
  }
}

