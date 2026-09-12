/**
 * Batch Acquisition and Release Operations for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolBatch
 */

export function acquireManyItems<T>(acquireSingle: () => T, count: number, out: T[] = []): T[] {
  const targetCount = Math.max(0, count);
  for (let i = 0; i < targetCount; i++) {
    out.push(acquireSingle());
  }
  return out;
}

export function releaseManyItems<T>(
  releaseSingle: (item: T) => void,
  items: Iterable<T | null | undefined>,
): void {
  for (const item of items) {
    if (item !== null && item !== undefined) {
      releaseSingle(item);
    }
  }
}
