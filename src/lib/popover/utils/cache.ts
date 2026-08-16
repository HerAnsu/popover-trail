/**
 * In-Memory LRU & TTL Caching Engine for popover data resolution.
 * Supports Time-To-Live expiration, true LRU capacity eviction, and telemetry auditing.
 *
 * @module cache
 */

import type { PopoverCache } from '../types';

function hasUnrefMethod(timer: unknown): timer is { unref: () => void } {
  return (
    typeof timer === 'object' &&
    timer !== null &&
    'unref' in timer &&
    typeof (timer as Record<string, unknown>).unref === 'function'
  );
}

const UNSAFE_KEYS_SET = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

function isSafeKey(key: string): boolean {
  return key.trim().length > 0 && !UNSAFE_KEYS_SET.has(key);
}

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

/**
 * Cache hit/miss performance statistics for auditing.
 */
export interface CacheStats {
  /** Current active item count. */
  size: number;
  /** Total successful cache hits. */
  hits: number;
  /** Total cache misses. */
  misses: number;
  /** Hit ratio between 0.0 and 1.0. */
  hitRatio: number;
}

/**
 * Strongly typed cache interface mapping popover keys to their exact resolved data payload types.
 *
 * @template TCacheMap - Record mapping popover key strings to their resolved data types.
 */
export interface TypedPopoverCache<TCacheMap extends Record<string, unknown>> {
  /** Retrieves a cached entry by key. */
  get<K extends Extract<keyof TCacheMap, string>>(key: K): TCacheMap[K] | undefined;
  /** Sets a cached payload for a key with optional TTL override. */
  set<K extends Extract<keyof TCacheMap, string>>(key: K, data: TCacheMap[K], ttlMs?: number): void;
  /** Checks if key exists and is non-expired. */
  has<K extends Extract<keyof TCacheMap, string>>(key: K): boolean;
  /** Deletes an entry by key. */
  delete<K extends Extract<keyof TCacheMap, string>>(key: K): boolean | void;
  /** Clears all entries. */
  clear(): void;
}

/**
 * Standard in-memory caching engine for popover data payloads.
 * Supports Time-To-Live (TTL) record expiration, true LRU eviction, and hit/miss auditing statistics.
 *
 * @template TData - The type of data stored inside the cache entries.
 */
export class SimplePopoverCache<TData = unknown> implements PopoverCache<TData> {
  private readonly cache = new Map<string, { data: TData; expiry: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private hitsCount = 0;
  private missesCount = 0;
  private autoPruneTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Creates an instance of SimplePopoverCache.
   *
   * @param ttlMs - Default time-to-live duration in milliseconds (default: 5 minutes / 300000ms).
   * @param maxSize - Maximum number of entries before LRU eviction (default: 500).
   * @param autoPruneIntervalMs - Optional background auto-prune interval in ms (default: 0 / disabled).
   */
  constructor(ttlMs = 5 * 60 * 1000, maxSize = 500, autoPruneIntervalMs = 0) {
    this.ttl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : 5 * 60 * 1000;
    this.maxSize = Number.isFinite(maxSize) && maxSize > 0 ? maxSize : 500;

    if (autoPruneIntervalMs > 0 && typeof setInterval !== 'undefined') {
      this.autoPruneTimer = setInterval(() => this.pruneExpired(), autoPruneIntervalMs);
      if (hasUnrefMethod(this.autoPruneTimer)) {
        this.autoPruneTimer.unref();
      }
    }
  }

  private isExpired(entry: { expiry: number }, now: number = Date.now()): boolean {
    return now > entry.expiry;
  }

  /**
   * Intelligently evicts one item when reaching max capacity.
   * Prioritizes already expired items before evicting the least recently used (LRU) entry.
   */
  private evictOne(): void {
    const now = Date.now();

    // Phase 1: Try to evict an already expired entry first
    for (const [k, entry] of this.cache.entries()) {
      if (this.isExpired(entry, now)) {
        this.cache.delete(k);
        return;
      }
    }

    // Phase 2: Evict the oldest/least recently used entry in insertion order
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Checks if a non-expired entry exists for the given key without retrieving it.
   *
   * @param key - The unique cache key.
   * @returns True if a valid (non-expired) entry exists.
   */
  has(key: string): boolean {
    if (!isSafeKey(key)) return false;
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Retrieves a cached entry if it exists and has not expired yet.
   * Automatically moves the accessed entry to the end of Map order (True LRU).
   *
   * @param key - The unique cache key.
   * @returns The cached data payload if valid; otherwise `undefined`.
   */
  get(key: string): TData | undefined {
    if (!isSafeKey(key)) return undefined;

    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      this.missesCount++;
      return undefined;
    }

    this.hitsCount++;

    // True LRU: re-insert to mark as most recently used
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Saves data in the cache, stamping it with the configured or custom TTL threshold.
   *
   * @param key - The unique cache key.
   * @param data - The data payload to cache.
   * @param ttlMs - Optional custom TTL override in milliseconds.
   */
  set(key: string, data: TData, ttlMs?: number): void {
    if (!isSafeKey(key)) return;

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      this.evictOne();
    }

    const effectiveTtl =
      typeof ttlMs === 'number' && Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : this.ttl;

    this.cache.set(key, {
      data,
      expiry: Date.now() + effectiveTtl,
    });

    // Auto-purge rejected promises from cache to prevent permanent error caching
    if (data && typeof (data as { catch?: unknown }).catch === 'function') {
      (data as unknown as Promise<unknown>).catch(() => {
        if (this.cache.get(key)?.data === data) {
          this.cache.delete(key);
        }
      });
    }
  }

  /**
   * Removes a specific item from the cache immediately.
   *
   * @param key - The unique cache key to delete.
   * @returns True if the item was found and deleted.
   */
  delete(key: string): boolean {
    if (!isSafeKey(key)) return false;
    return this.cache.delete(key);
  }

  /**
   * Proactively sweeps and purges all expired entries from the cache map.
   *
   * @returns Total number of purged expired entries.
   */
  pruneExpired(): number {
    if (this.cache.size === 0) return 0;
    const now = Date.now();
    let purgedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry, now)) {
        this.cache.delete(key);
        purgedCount++;
      }
    }
    return purgedCount;
  }

  /**
   * Returns hit/miss performance statistics for cache auditing.
   */
  stats(): CacheStats {
    const total = this.hitsCount + this.missesCount;
    return {
      size: this.cache.size,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRatio: total > 0 ? Math.round((this.hitsCount / total) * 1000) / 1000 : 0,
    };
  }

  /**
   * Returns the current number of active cached items.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clears all cached entries completely, resetting stats.
   */
  clear(): void {
    this.cache.clear();
    this.hitsCount = 0;
    this.missesCount = 0;
  }

  /**
   * Stops background auto-prune interval timer and clears entries.
   */
  destroy(): void {
    if (this.autoPruneTimer) {
      clearInterval(this.autoPruneTimer);
      this.autoPruneTimer = null;
    }
    this.clear();
  }

  /**
   * Disposable resource cleanup handle for TS 5.2+ explicit resource management (`using`).
   */
  dispose(): void {
    this.destroy();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
