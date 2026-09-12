/**
 * Event emitter and key subscriber registry for reactive cache updates.
 *
 * @module cache/cacheEventEmitter
 */

import type { CacheEventMap, CacheEventType } from './cacheTypes';

type EventSink = (payload: never) => void;

export class CacheEventEmitter<TData = unknown> {
  public readonly capacity = 100;
  private readonly maxListeners = 100;
  private readonly listeners = new Map<CacheEventType, Set<EventSink>>();
  private readonly keySubscribers = new Map<string, Set<(value: TData | undefined) => void>>();

  public on<E extends CacheEventType>(
    event: E,
    listener: (payload: CacheEventMap<TData>[E]) => void,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set<EventSink>();
      this.listeners.set(event, set);
    }
    if (set.size < this.maxListeners) {
      set.add(listener);
    }
    return () => {
      set?.delete(listener);
    };
  }

  public emit<E extends CacheEventType>(event: E, payload: CacheEventMap<TData>[E]): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;
    for (const listener of set) {
      try {
        Reflect.apply(listener, undefined, [payload]);
      } catch {
        // Fault-isolated execution barrier (AGENTS.md Rule 14)
      }
    }
  }

  public hasListeners(event: CacheEventType): boolean {
    const set = this.listeners.get(event);
    return set !== undefined && set.size > 0;
  }

  public subscribe(key: string, listener: (value: TData | undefined) => void): () => void {
    let set = this.keySubscribers.get(key);
    if (!set) {
      set = new Set();
      this.keySubscribers.set(key, set);
    }
    set.add(listener);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.keySubscribers.delete(key);
    };
  }

  public notify(key: string, value: TData | undefined): void {
    const set = this.keySubscribers.get(key);
    if (!set || set.size === 0) return;
    for (const listener of set) {
      try {
        listener(value);
      } catch {
        // Fault isolation
      }
    }
  }

  public hasKeySubscribers(key: string): boolean {
    const set = this.keySubscribers.get(key);
    return set !== undefined && set.size > 0;
  }

  public clear(): void {
    this.listeners.clear();
    this.keySubscribers.clear();
  }
}
