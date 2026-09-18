/**
 * Controller for SWR fetching, background revalidation, and mutations.
 *
 * @module cache/cacheSWRController
 */

import type { CacheSetOptions, SWRFetchOptions } from './cacheTypes';
import type { CacheSWRRunner } from './cacheSWRRunner';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { CacheSequenceGuard } from './cacheSequenceGuard';

/**
 * Minimal host interface required by `CacheSWRController` to read, store, and check freshness of entries.
 */
export interface SWRHost<TData> {
  get(key: string): TData | undefined;
  set(key: string, data: TData, opts?: number | CacheSetOptions): void;
  isStale(key: string): boolean;
}

type UpdaterFn<TData> = (prev: TData | undefined) => TData;

function isUpdaterFunction<TData>(value: TData | UpdaterFn<TData>): value is UpdaterFn<TData> {
  return typeof value === 'function';
}

function resolveUpdater<TData>(
  updater: TData | UpdaterFn<TData>,
  previous: TData | undefined,
): TData {
  return isUpdaterFunction(updater) ? updater(previous) : updater;
}

/**
 * Controller orchestrating Stale-While-Revalidate (SWR) reads, background revalidations,
 * deduplication tickets, and optimistic local mutations.
 *
 * @template TData - Stored data type.
 *
 * @example
 * ```ts
 * const swr = new CacheSWRController(host, runner, events);
 * const data = await swr.execute('user-profile', () => fetchUserProfile());
 * ```
 */
export class CacheSWRController<TData = unknown> {
  public readonly capacity: number;
  private readonly host: SWRHost<TData>;
  private readonly runner: CacheSWRRunner<TData>;
  private readonly events: CacheEventEmitter<TData>;
  private readonly sequenceGuard = new CacheSequenceGuard();

  constructor(
    host: SWRHost<TData>,
    runner: CacheSWRRunner<TData>,
    events: CacheEventEmitter<TData>,
    capacity = 1000,
  ) {
    this.host = host;
    this.runner = runner;
    this.events = events;
    this.capacity = capacity;
  }

  /**
   * Forces revalidation of an entry via its fetcher function.
   * Emits a 'revalidate' event on success or 'error' event on failure.
   * Race conditions from out-of-order responses are rejected via sequenceGuard tickets.
   *
   * @param key - Cache key to revalidate.
   * @param fetcher - Async loader function.
   * @param opts - Optional SWR configuration (retries, retryDelayMs).
   * @returns Promise resolving to the fresh fetched data.
   */
  public async revalidate(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData> {
    const ticket = this.sequenceGuard.next(key);
    const task = async () => {
      try {
        const data = await this.runner.runWithRetry(
          fetcher,
          opts?.retries ?? 2,
          opts?.retryDelayMs ?? 200,
        );
        if (this.sequenceGuard.isLatest(key, ticket)) {
          this.host.set(key, data, opts);
          if (this.events.hasListeners('revalidate'))
            this.events.emit('revalidate', { key, value: data });
        }
        return data;
      } catch (error) {
        if (this.events.hasListeners('error')) this.events.emit('error', { key, error });
        throw error;
      }
    };
    return this.runner.runDeduplicated(key, task);
  }

  /**
   * Reads data adhering to Stale-While-Revalidate semantics:
   * - If cached and fresh: returns immediately.
   * - If cached but stale: returns cached value immediately while triggering background revalidation.
   * - If not cached: awaits revalidation and returns fresh data.
   *
   * @param key - Cache key.
   * @param fetcher - Async loader function.
   * @param opts - Optional SWR configuration.
   * @returns Promise resolving to either fresh or stale data.
   */
  public async execute(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData> {
    const cached = this.host.get(key);
    const stale = this.host.isStale(key);
    if (cached !== undefined && !stale) return cached;

    if (cached !== undefined && stale) {
      if (this.events.hasListeners('stale')) this.events.emit('stale', { key, value: cached });
      void this.revalidate(key, fetcher, opts).catch(() => {});
      return cached;
    }
    return this.revalidate(key, fetcher, opts);
  }

  /**
   * Optimistically updates or sets data for a key, invalidating any pending background fetch tickets.
   *
   * @param key - Cache key to mutate.
   * @param updater - New value or functional updater receiving previous value.
   * @returns The updated value stored in the cache.
   *
   * @example
   * ```ts
   * swr.mutate('counter', (prev = 0) => prev + 1);
   * ```
   */
  public mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData {
    this.sequenceGuard.next(key);
    const next = resolveUpdater(updater, this.host.get(key));
    this.host.set(key, next);
    return next;
  }

  /**
   * Resets sequence ticket guards.
   */
  public clear(): void {
    this.sequenceGuard.clear();
  }
}
