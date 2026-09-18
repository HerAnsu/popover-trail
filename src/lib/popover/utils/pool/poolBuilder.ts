/**
 * Fluent Builder Pattern for Declarative ObjectPool Configuration and Instantiation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolBuilder
 */

import { ObjectPool } from './objectPoolCore';

export class PoolBuilder<T> {
  private readonly factory: () => T;
  private resetFn?: (item: T) => void;
  private onEvictFn?: (item: T) => void;
  private initCap?: number;
  private maxCap?: number;
  private idleDrainMs?: number;
  private leakDetect = false;
  private leakTimeout?: number;

  constructor(factory: () => T) {
    this.factory = factory;
  }

  withReset(reset: (item: T) => void): this {
    this.resetFn = reset;
    return this;
  }

  withEviction(onEvict: (item: T) => void): this {
    this.onEvictFn = onEvict;
    return this;
  }

  withInitialCapacity(capacity: number): this {
    this.initCap = capacity;
    return this;
  }

  withMaxCapacity(capacity: number): this {
    this.maxCap = capacity;
    return this;
  }

  withIdleDrain(timeoutMs: number): this {
    this.idleDrainMs = timeoutMs;
    return this;
  }

  withLeakDetection(enabled = true, timeoutMs = 10000): this {
    this.leakDetect = enabled;
    this.leakTimeout = timeoutMs;
    return this;
  }

  build(): ObjectPool<T> {
    return new ObjectPool<T>({
      factory: this.factory,
      reset: this.resetFn,
      onEvict: this.onEvictFn,
      initialCapacity: this.initCap,
      maxCapacity: this.maxCap,
      idleDrainTimeoutMs: this.idleDrainMs,
      enableLeakDetection: this.leakDetect,
      leakTimeoutMs: this.leakTimeout,
    });
  }
}

export function poolBuilder<T>(factory: () => T): PoolBuilder<T> {
  return new PoolBuilder(factory);
}
