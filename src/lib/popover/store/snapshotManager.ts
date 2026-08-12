/**
 * Snapshot & Session Persistence Engine for popover-trail.
 * Provides serializable snapshot export/import, localStorage/sessionStorage persistence,
 * and BroadcastChannel real-time multi-tab synchronization without modifying URLs.
 *
 * @module snapshotManager
 */

import { validateStorageKey } from '../utils/devWarnings';
import { generateTabId } from '../utils/uuid';

/** Current schema version tag for stored snapshot payloads. */
export const SNAPSHOT_VERSION = '1.0.3';

/**
 * Serializable snapshot data contract representing full popover trail state.
 *
 * @template TData - The resolved data payload type.
 */
export interface PopoverSnapshotData<TData = unknown> {
  /** Schema version identifier. */
  version: string;
  /** Epoch timestamp in milliseconds. */
  timestamp: number;
  /** Unique tab session ID preventing self-echo on BroadcastChannel. */
  tabId?: string;
  /** Active popover key sequence in trail order. */
  trailKeys: string[];
  /** Pinned popover keys. */
  pinnedKeys: string[];
  /** Map of drag coordinates by key. */
  offsets: Record<string, { x: number; y: number }>;
  /** Optional serialized data payloads map. */
  payloads?: Record<string, TData>;
}

/** Alias type for a serializable, versioned popover store snapshot. */
export type PopoverStoreSnapshot<TData = unknown> = PopoverSnapshotData<TData>;

/**
 * Configuration options for PopoverSnapshotManager.
 *
 * @template TData - The resolved data payload type.
 */
export interface SnapshotManagerOptions<TData = unknown> {
  /** Custom storage key identifier (default: 'pt_popover_trail_snapshot'). */
  storageKey?: string;
  /** Storage mechanism target ('localStorage', 'sessionStorage', or 'none'). */
  storageType?: 'localStorage' | 'sessionStorage' | 'none';
  /** Enables real-time cross-tab synchronization via BroadcastChannel. */
  enableBroadcastChannel?: boolean;
  /** Callback fired when a snapshot is received from another tab. */
  onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;
  /** Custom serializer function for custom compression or encryption. */
  serialize?: (data: PopoverSnapshotData<TData>) => string;
  /** Custom deserializer function matching custom serializer. */
  deserialize?: (raw: string) => PopoverSnapshotData<TData>;
}

export function areKeysSafe(keys: Iterable<unknown>): boolean {
  for (const key of keys) {
    if (typeof key !== 'string' || UNSAFE_KEYS_SET.has(key)) return false;
  }
  return true;
}

function isSnapshotMessageEvent<TData>(
  event: Event,
): event is MessageEvent<PopoverSnapshotData<TData>> {
  if (typeof event !== 'object' || event === null || !('data' in event)) return false;
  const d = (event as MessageEvent).data;
  return (
    typeof d === 'object' &&
    d !== null &&
    Array.isArray((d as Record<string, unknown>).trailKeys) &&
    Array.isArray((d as Record<string, unknown>).pinnedKeys)
  );
}

const UNSAFE_KEYS_SET = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

export const DEFAULT_SNAPSHOT_STORAGE_KEY = 'pt_popover_trail_snapshot';

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

/**
 * Manages persisting, loading, and cross-tab broadcasting of popover state snapshots.
 *
 * @template TData - The resolved data payload type.
 */
export class PopoverSnapshotManager<TData = unknown> {
  private readonly storageKey: string;
  private readonly storageType: 'localStorage' | 'sessionStorage' | 'none';
  private broadcastChannel: BroadcastChannel | null = null;
  private readonly onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;
  private readonly serializer?: (data: PopoverSnapshotData<TData>) => string;
  private readonly deserializer?: (raw: string) => PopoverSnapshotData<TData>;
  private readonly tabId: string = generateTabId();
  private messageHandler: EventListener | null = null;

  constructor(options: SnapshotManagerOptions<TData> = {}) {
    this.storageKey = options.storageKey ?? DEFAULT_SNAPSHOT_STORAGE_KEY;
    validateStorageKey(this.storageKey);
    this.storageType = options.storageType ?? 'none';
    this.onSnapshotRestored = options.onSnapshotRestored;
    this.serializer = options.serialize;
    this.deserializer = options.deserialize;

    if (options.enableBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(`${this.storageKey}_channel`);
        this.broadcastChannel = channel;
        this.messageHandler = (event: Event) => {
          if (isSnapshotMessageEvent<TData>(event)) {
            if (event.data && event.data.tabId !== this.tabId && this.onSnapshotRestored) {
              try {
                this.onSnapshotRestored(event.data);
              } catch (err) {
                console.warn('[SnapshotManager] Error executing onSnapshotRestored handler:', err);
              }
            }
          }
        };
        channel.addEventListener('message', this.messageHandler);
      } catch {
        this.broadcastChannel = null;
      }
    }
  }

  /**
   * Generates a clean serializable snapshot payload.
   *
   * @param trailKeys - Ordered active popover keys.
   * @param pinnedKeys - Pinned popover keys.
   * @param offsets - Map of drag offset positions.
   * @param payloads - Optional payloads map.
   * @returns Fresh PopoverSnapshotData object.
   */
  createSnapshot(
    trailKeys: string[],
    pinnedKeys: string[],
    offsets: Record<string, { x: number; y: number }>,
    payloads?: Record<string, TData>,
  ): PopoverSnapshotData<TData> {
    return {
      version: SNAPSHOT_VERSION,
      timestamp: Date.now(),
      tabId: this.tabId,
      trailKeys: [...trailKeys],
      pinnedKeys: [...pinnedKeys],
      offsets: { ...offsets },
      payloads: payloads ? { ...payloads } : undefined,
    };
  }

  /**
   * Saves snapshot to configured storage engine and broadcasts to neighbor tabs.
   *
   * @param snapshot - Snapshot data to persist.
   */
  saveSnapshot(snapshot: PopoverSnapshotData<TData>): void {
    if (this.storageType !== 'none' && typeof window !== 'undefined') {
      try {
        const storage = window[this.storageType];
        const raw = this.serializer ? this.serializer(snapshot) : JSON.stringify(snapshot);
        storage.setItem(this.storageKey, raw);
      } catch (err) {
        console.warn('[SnapshotManager] Failed to write snapshot to storage:', err);
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(snapshot);
      } catch (err) {
        console.warn('[SnapshotManager] BroadcastChannel sync failed:', err);
      }
    }
  }

  /**
   * Type predicate validating snapshot structure and protecting against prototype pollution.
   */
  private isValidSnapshot(data: unknown): data is PopoverSnapshotData<TData> {
    if (typeof data !== 'object' || data === null) return false;
    const record = data as Record<string, unknown>;
    const { trailKeys, pinnedKeys, offsets } = record;

    if (!Array.isArray(trailKeys) || !Array.isArray(pinnedKeys)) return false;
    if (typeof offsets !== 'object' || offsets === null) return false;

    if (
      !areKeysSafe(trailKeys) ||
      !areKeysSafe(pinnedKeys) ||
      !areKeysSafe(Object.keys(offsets as object))
    ) {
      return false;
    }
    if (record.payloads) {
      if (typeof record.payloads !== 'object' || record.payloads === null) return false;
      if (!areKeysSafe(Object.keys(record.payloads as object))) return false;
    }
    return true;
  }

  /**
   * Restores snapshot from configured storage engine.
   *
   * @returns Deserialized snapshot object or null if invalid/empty.
   */
  loadSnapshot(): PopoverSnapshotData<TData> | null {
    if (this.storageType === 'none' || typeof window === 'undefined') return null;

    try {
      const storage = window[this.storageType];
      const raw = storage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed: unknown = this.deserializer ? this.deserializer(raw) : JSON.parse(raw);
      return this.isValidSnapshot(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Clears saved snapshot from configured storage engine.
   */
  clearSnapshot(): void {
    if (this.storageType !== 'none' && typeof window !== 'undefined') {
      try {
        const storage = window[this.storageType];
        storage.removeItem(this.storageKey);
      } catch {
        // Ignore storage removal errors
      }
    }
  }

  /**
   * Destroys resources and channel listeners.
   */
  destroy(): void {
    if (this.broadcastChannel) {
      if (this.messageHandler) {
        this.broadcastChannel.removeEventListener('message', this.messageHandler);
        this.messageHandler = null;
      }
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }

  /**
   * ScopeDisposable compliance handle for TS 5.2+ explicit resource management using statement.
   */
  dispose(): void {
    this.destroy();
  }

  [DISPOSE_SYMBOL](): void {
    this.destroy();
  }
}
