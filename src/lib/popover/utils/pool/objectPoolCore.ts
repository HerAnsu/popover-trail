/**
 * Generic High-Performance Object Pool for Zero-GC Execution.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/objectPoolCore
 */

import { Ok, Err, type Result } from '../result';
import type { ObjectPoolOptions, ScopedPooledItem } from './poolTypes';
import { resolvePoolOptions, validatePoolOptions } from './poolConfig';
import { runWithItem, runWithItemResult, runWithItemAsync, createScopedItem } from './poolScope';
import { runWithPair, runWithTriple, runWithPairAsync, runWithMany } from './poolMultiScope';
import { mapWithItem, forEachWithItem } from './poolPipeline';
import { assertPoolClean } from './poolAssert';
import { acquireManyItems, releaseManyItems } from './poolBatch';
import { DEFAULT_POOL_INITIAL, DEFAULT_POOL_MAX } from './poolBranded';
import type { InvalidPoolOptionsError } from './poolErrors';
import { ObjectPoolBase } from './poolBase';

export class ObjectPool<T> extends ObjectPoolBase<T> {
  static create<T>(opts: ObjectPoolOptions<T>): Result<ObjectPool<T>, InvalidPoolOptionsError> {
    const valid = validatePoolOptions<T>(opts);
    if (!valid.success) return Err(valid.error);
    return Ok(new ObjectPool<T>(opts));
  }

  constructor(options: ObjectPoolOptions<T>);
  constructor(factory: () => T, reset?: (item: T) => void, initCap?: number, maxCap?: number);
  constructor(
    target: (() => T) | ObjectPoolOptions<T>,
    reset?: (i: T) => void,
    init: number = DEFAULT_POOL_INITIAL,
    max: number = DEFAULT_POOL_MAX,
  ) {
    const cfg = resolvePoolOptions(target, reset, init, max);
    super(cfg);
    this.preallocate(cfg.safeInitial);
  }

  acquireMany(count: number, out: T[] = []): T[] { return acquireManyItems(() => this.acquire(), count, out); }
  releaseMany(items: Iterable<T | null | undefined>): void { releaseManyItems((i) => this.release(i), items); }
  acquireWith(init: (item: T) => void): T { const item = this.acquire(); init(item); return item; }
  runWith<R>(fn: (item: T) => R): R { return runWithItem(() => this.acquire(), (i) => this.release(i), fn); }
  runWithInit<R>(init: (i: T) => void, fn: (i: T) => R): R { return runWithItem(() => this.acquireWith(init), (i) => this.release(i), fn); }
  runWithAsync<R>(fn: (item: T) => Promise<R>): Promise<R> { return runWithItemAsync(() => this.acquire(), (i) => this.release(i), fn); }
  use<R>(fn: (item: T) => R): R { return this.runWith(fn); }
  useResult<R, E>(fn: (item: T) => Result<R, E>): Result<R, E> { return runWithItemResult(() => this.acquire(), (i) => this.release(i), fn); }
  useAsync<R>(fn: (item: T) => Promise<R>): Promise<R> { return this.runWithAsync(fn); }
  usePair<R>(fn: (a: T, b: T) => R): R { return runWithPair(() => this.acquire(), (i) => this.release(i), fn); }
  useTriple<R>(fn: (a: T, b: T, c: T) => R): R { return runWithTriple(() => this.acquire(), (i) => this.release(i), fn); }
  usePairAsync<R>(fn: (a: T, b: T) => Promise<R>): Promise<R> { return runWithPairAsync(() => this.acquire(), (i) => this.release(i), fn); }
  useMany<R>(count: number, fn: (items: readonly T[]) => R): R {
    return runWithMany(() => this.acquire(), (i) => this.release(i), count, fn);
  }

  scope(): ScopedPooledItem<T> { return this.acquireScoped(); }
  acquireScoped(): ScopedPooledItem<T> { return createScopedItem(() => this.acquire(), (i) => this.release(i)); }
  get isClean(): boolean { return this.inUse === 0; }
  assertClean(): boolean { return assertPoolClean(this); }
  mapItems<In, Out>(items: Iterable<In>, fn: (pooled: T, input: In, index: number) => Out, out: Out[] = []): Out[] {
    return mapWithItem(this, items, fn, out);
  }
  forEachItem<In>(items: Iterable<In>, fn: (pooled: T, input: In, index: number) => void): void {
    forEachWithItem(this, items, fn);
  }
}
