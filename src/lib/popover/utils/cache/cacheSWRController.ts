/**
 * Controller for SWR fetching, background revalidation, and mutations.
 *
 * @module cache/cacheSWRController
 */

import type { CacheSetOptions, SWRFetchOptions } from './cacheTypes';
import type { CacheSWRRunner } from './cacheSWRRunner';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { CacheSequenceGuard } from './cacheSequenceGuard';

export interface SWRHost<TData> {
  get(key: string): TData | undefined;
  set(key: string, data: TData, opts?: number | CacheSetOptions): void;
  isStale(key: string): boolean;
}

type UpdaterFn<TData> = (prev: TData | undefined) => TData;

function isUpdaterFunction<TData>(
  value: TData | UpdaterFn<TData>,
): value is UpdaterFn<TData> {
  return typeof value === 'function';
}

function resolveUpdater<TData>(
  updater: TData | UpdaterFn<TData>,
  previous: TData | undefined,
): TData {
  return isUpdaterFunction(updater) ? updater(previous) : updater;
}

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

  public mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData {
    this.sequenceGuard.next(key);
    const next = resolveUpdater(updater, this.host.get(key));
    this.host.set(key, next);
    return next;
  }

  public clear(): void {
    this.sequenceGuard.clear();
  }
}
