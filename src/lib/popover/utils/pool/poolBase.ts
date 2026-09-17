/**
 * Foundation Class for Generic Object Pool State, Metrics, and Lifecycle.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolBase
 */

import { DISPOSE_SYMBOL } from '../disposable';
import { Ok, Err, type Result } from '../result';
import { clamp } from '../math';
import type { ObjectPoolMetrics, LeakedItemInfo } from './poolTypes';
import { PoolMetricsTracker } from './poolMetrics';
import type { ObjectPoolResolvedConfig } from './poolConfig';
import { PoolLeakSentinel } from './poolLeakSentinel';
import { AdaptiveDrainController } from './poolAdaptive';
import { PoolStorage } from './poolStorage';
import { acquirePooled, releasePooled, tryEvictItem, tryResetItem } from './poolOperations';
import { type PoolDomainError, createPoolDisposedError } from './poolErrors';
import { shrinkPoolToFit, warmupPool } from './poolMemory';
import { assessPoolHealth, type PoolHealthReport } from './poolHealth';
import { PoolObserverHub, type PoolObserver } from './poolObserver';

export abstract class ObjectPoolBase<T> {
  protected readonly storage: PoolStorage<T>;
  protected readonly tracker = new PoolMetricsTracker();
  protected readonly sentinel: PoolLeakSentinel<T>;
  protected readonly adaptive: AdaptiveDrainController;
  protected readonly observers = new PoolObserverHub<T>();
  protected readonly factory: () => T;
  protected readonly reset?: (item: T) => void;
  protected readonly onEvict?: (item: T) => void;
  protected isDisposed = false;

  constructor(cfg: ObjectPoolResolvedConfig<T>) {
    this.factory = cfg.factory;
    this.reset = cfg.reset;
    this.onEvict = cfg.onEvict;
    this.storage = new PoolStorage<T>(cfg.safeMax);
    this.sentinel = new PoolLeakSentinel(cfg.enableLeakDetection, cfg.leakTimeoutMs);
    this.adaptive = new AdaptiveDrainController(
      () => this.drain(cfg.safeInitial),
      cfg.idleDrainTimeoutMs,
    );
  }

  addObserver(observer: PoolObserver<T>): () => void {
    return this.observers.subscribe(observer);
  }
  acquire(): T {
    this.adaptive.notifyAcquire();
    return acquirePooled(this.storage, this.factory, this.tracker, this.sentinel, this.observers);
  }
  acquireResult(): Result<T, PoolDomainError> {
    return this.isDisposed ? Err(createPoolDisposedError()) : Ok(this.acquire());
  }
  release(item?: T | null): void {
    if (
      releasePooled(
        this.storage,
        item,
        this.reset,
        this.onEvict,
        this.tracker,
        this.sentinel,
        this.observers,
      )
    ) {
      this.adaptive.notifyRelease();
    }
  }
  preallocate(count: number): void {
    const added = this.storage.preallocate(count, this.factory);
    this.tracker.recordPreallocate(added);
    this.observers.notifyPreallocate(added);
  }
  warmup(target?: number): number {
    const added = warmupPool(this.storage, target ?? this.storage.capacity, this.factory);
    this.tracker.recordPreallocate(added);
    return added;
  }
  shrinkToFit(minCap = 0): number {
    return shrinkPoolToFit(this.storage, minCap, this.onEvict);
  }
  drain(keep = 0): void {
    const drained = this.storage.drain(keep);
    for (const item of drained) {
      tryEvictItem(this.onEvict, item);
      this.observers.notifyEvict(item);
    }
    this.observers.notifyDrain(drained.length);
  }
  clear(): void {
    this.sentinel.clear();
    this.drain(0);
  }
  dispose(): void {
    this.isDisposed = true;
    this.adaptive.dispose();
    this.clear();
  }
  resetItem(item: T): void {
    tryResetItem(this.reset, item);
  }
  getHealth(): PoolHealthReport {
    return assessPoolHealth(this.getMetrics(), this.sentinel.getLeakedItems().size);
  }
  inspect(): string {
    return `[ObjectPool size=${this.storage.size}/${this.storage.capacity} inUse=${this.inUse} hitRate=${Math.trunc(this.getMetrics().hitRate * 100)}%]`;
  }
  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
  get size(): number {
    return this.storage.size;
  }
  get capacity(): number {
    return this.storage.capacity;
  }
  get inUse(): number {
    return clamp(this.tracker.acquired - this.tracker.released, 0, Infinity);
  }
  getMetrics(): ObjectPoolMetrics {
    return this.tracker.getSnapshot(this.storage.size, this.storage.capacity);
  }
  getLeakedObjects(tMs?: number, now?: number): Map<T, LeakedItemInfo> {
    return this.sentinel.getLeakedItems(tMs, now);
  }
}
