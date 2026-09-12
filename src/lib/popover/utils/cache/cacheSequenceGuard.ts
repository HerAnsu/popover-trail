/**
 * Causal sequence guard providing Lamport monotonic ticketing for anti-race SWR.
 *
 * @module cache/cacheSequenceGuard
 */

import { isValidStorageKey } from '../safeKeys';

export class CacheSequenceGuard {
  public readonly capacity: number;
  private readonly sequences = new Map<string, number>();

  constructor(capacity = 1000) {
    this.capacity = capacity;
  }

  public next(key: string): number {
    if (!isValidStorageKey(key)) return 0;
    if (this.sequences.size >= this.capacity && !this.sequences.has(key)) {
      const oldest = this.sequences.keys().next().value;
      if (oldest !== undefined) this.sequences.delete(oldest);
    }
    const current = this.sequences.get(key) ?? 0;
    const nextSeq = current + 1;
    this.sequences.set(key, nextSeq);
    return nextSeq;
  }

  public isLatest(key: string, ticket: number): boolean {
    if (!isValidStorageKey(key)) return false;
    const current = this.sequences.get(key) ?? 0;
    return ticket >= current;
  }

  public delete(key: string): boolean {
    return this.sequences.delete(key);
  }

  public clear(): void {
    this.sequences.clear();
  }

  public get size(): number {
    return this.sequences.size;
  }
}
