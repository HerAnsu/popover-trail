/**
 * Encapsulated Slot Storage and Membership Tracking for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolStorage
 */

import type { PoolCapacity } from './poolBranded';
import { clamp } from '../math';

export class PoolStorage<T> {
  private readonly items: T[] = [];
  private readonly inPool = new Set<T>();
  readonly maxCapacity: PoolCapacity;

  constructor(maxCapacity: PoolCapacity) {
    this.maxCapacity = maxCapacity;
  }

  get size(): number {
    return this.items.length;
  }

  get capacity(): number {
    return this.maxCapacity;
  }

  get isFull(): boolean {
    return this.items.length >= this.maxCapacity;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  has(item: T): boolean {
    return this.inPool.has(item);
  }

  pop(): T | undefined {
    const item = this.items.pop();
    if (item !== undefined) this.inPool.delete(item);
    return item;
  }

  push(item: T): boolean {
    if (this.inPool.has(item) || this.items.length >= this.maxCapacity) {
      return false;
    }
    this.items.push(item);
    this.inPool.add(item);
    return true;
  }

  preallocate(count: number, factory: () => T): number {
    const toAdd = clamp(count, 0, this.maxCapacity - this.items.length);
    for (let i = 0; i < toAdd; i++) {
      const item = factory();
      this.items.push(item);
      this.inPool.add(item);
    }
    return toAdd;
  }

  drain(keepCapacity = 0): T[] {
    const safeKeep = Math.max(0, keepCapacity);
    const evicted: T[] = [];
    while (this.items.length > safeKeep) {
      const item = this.items.pop();
      if (item !== undefined) {
        this.inPool.delete(item);
        evicted.push(item);
      }
    }
    return evicted;
  }

  clear(): T[] {
    return this.drain(0);
  }
}
