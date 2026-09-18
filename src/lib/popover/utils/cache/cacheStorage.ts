/**
 * In-memory storage adapter and cross-tab synchronization channel.
 *
 * @module cache/cacheStorage
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';

/**
 * Standard high-performance in-memory storage adapter based on native `Map`.
 *
 * @template T - Type of cached payload.
 *
 * @example
 * ```typescript
 * const memoryStorage = new MemoryStorageAdapter<string>();
 * memoryStorage.set('key', { data: 'hello', expiry: Date.now() + 5000 });
 * ```
 */
export class MemoryStorageAdapter<T = unknown> implements StorageAdapter<T> {
  private readonly map = new Map<string, CacheEntry<T>>();

  public get(key: string): CacheEntry<T> | undefined {
    return this.map.get(key);
  }

  public set(key: string, entry: CacheEntry<T>): void {
    this.map.set(key, entry);
  }

  public delete(key: string): boolean {
    return this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }

  public keys(): Iterable<string> {
    return this.map.keys();
  }

  public entries(): Iterable<[string, CacheEntry<T>]> {
    return this.map.entries();
  }

  public get size(): number {
    return this.map.size;
  }
}

/**
 * Cross-tab synchronization manager using browser `BroadcastChannel`.
 * Broadcasts key invalidation events across multiple open browser tabs.
 *
 * @example
 * ```typescript
 * const sync = new CrossTabSync('my-cache-channel', (invalidatedKey) => {
 *   console.log('Key invalidated from another tab:', invalidatedKey);
 * });
 * sync.broadcastInvalidate('user:123');
 * ```
 */
export class CrossTabSync {
  private channel: BroadcastChannel | null = null;

  constructor(channelName?: string, onInvalidate?: (key: string) => void) {

    if (channelName && typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(channelName);
        this.channel.addEventListener('message', (event: MessageEvent) => {
          if (event.data?.type === 'invalidate' && typeof event.data.key === 'string') {
            onInvalidate?.(event.data.key);
          }
        });
      } catch {
        // BroadcastChannel unavailable in environment
      }
    }
  }

  public broadcastInvalidate(key: string): void {
    try {
      this.channel?.postMessage({ type: 'invalidate', key });
    } catch {
      // Ignore broadcast errors
    }
  }

  public destroy(): void {
    try {
      this.channel?.close();
    } catch {
      // Ignore close errors
    }
    this.channel = null;
  }
}
