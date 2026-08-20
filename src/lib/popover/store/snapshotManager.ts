/**
 * Snapshot & Session Persistence Engine for popover-trail.
 * Provides serializable snapshot export/import, localStorage/sessionStorage persistence,
 * and BroadcastChannel real-time multi-tab synchronization without modifying URLs.
 *
 * @module snapshotManager
 */

import { validateStorageKey } from '../validators';
import { generateTabId } from '../utils/uuid';
import { wrapResult, isOk, isErr } from '../utils/result';
import { DISPOSE_SYMBOL } from '../utils/disposable';

/** Current schema version tag for stored snapshot payloads. */
const SNAPSHOT_VERSION = '1.0.3';

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

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function areKeysSafe(keys: Iterable<unknown>): boolean {
  for (const key of keys) {
    if (typeof key !== 'string' || UNSAFE_KEYS_SET.has(key)) return false;
  }
  return true;
}

function isSnapshotMessageEvent<TData>(
  event: Event,
): event is MessageEvent<PopoverSnapshotData<TData>> {
  if (typeof MessageEvent !== 'undefined' && event instanceof MessageEvent) {
    const d = event.data;
    return (
      typeof d === 'object' &&
      d !== null &&
      'trailKeys' in d &&
      Array.isArray(d.trailKeys) &&
      'pinnedKeys' in d &&
      Array.isArray(d.pinnedKeys)
    );
  }
  if ('data' in event) {
    const d = event.data;
    return (
      typeof d === 'object' &&
      d !== null &&
      'trailKeys' in d &&
      Array.isArray(d.trailKeys) &&
      'pinnedKeys' in d &&
      Array.isArray(d.pinnedKeys)
    );
  }
  return false;
}

/** Keys that are rejected unconditionally to prevent prototype pollution vulnerability attacks. */
const UNSAFE_KEYS_SET = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

const DEFAULT_SNAPSHOT_STORAGE_KEY = 'pt_popover_trail_snapshot';

/**
 * Sanitizes serialized payload data objects:
 * 1. Filters out functions, promises, and undefined values that cannot be JSON serialized.
 * 2. Filters out object keys matching prototype pollution properties (`__proto__`, etc.).
 */
function sanitizePayloads<TData>(
  payloads?: Record<string, TData>,
): Record<string, TData> | undefined {
  if (!payloads || typeof payloads !== 'object') return undefined;
  const clean: Record<string, TData> = {};
  for (const [k, v] of Object.entries(payloads)) {
    if (
      v !== undefined &&
      typeof v !== 'function' &&
      !(v instanceof Promise) &&
      !UNSAFE_KEYS_SET.has(k)
    ) {
      clean[k] = v;
    }
  }
  return clean;
}

/** Validates and clamps point coordinates to safe finite numbers. */
function sanitizePoint(
  pt: { x: number; y: number } | null | undefined,
): { x: number; y: number } | null {
  if (!pt || typeof pt !== 'object') return null;
  return {
    x: Number.isFinite(pt.x) ? pt.x : 0,
    y: Number.isFinite(pt.y) ? pt.y : 0,
  };
}

/** Sanitizes coordinate offset dictionary to ensure no unsafe keys or non-finite numbers. */
function sanitizeOffsets(
  offsets?: Record<string, { x: number; y: number }>,
): Record<string, { x: number; y: number }> {
  if (!offsets || typeof offsets !== 'object') return {};
  const clean: Record<string, { x: number; y: number }> = {};
  for (const [k, pt] of Object.entries(offsets)) {
    if (UNSAFE_KEYS_SET.has(k)) continue;
    const cleanPt = sanitizePoint(pt);
    if (cleanPt) clean[k] = cleanPt;
  }
  return clean;
}

function isPayloadSafe(payloads: unknown): boolean {
  if (payloads === undefined) return true;
  if (typeof payloads !== 'object' || payloads === null) return false;
  return areKeysSafe(Object.keys(payloads));
}

function areSnapshotKeysValid(trailKeys: unknown, pinnedKeys: unknown, offsets: unknown): boolean {
  if (!Array.isArray(trailKeys) || !Array.isArray(pinnedKeys)) return false;
  if (typeof offsets !== 'object' || offsets === null) return false;
  return areKeysSafe(trailKeys) && areKeysSafe(pinnedKeys) && areKeysSafe(Object.keys(offsets));
}

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
      const channelResult = wrapResult(() => new BroadcastChannel(`${this.storageKey}_channel`));
      if (isOk(channelResult)) {
        const channel = channelResult.data;
        this.broadcastChannel = channel;
        this.messageHandler = (event: Event) => {
          if (
            isSnapshotMessageEvent<TData>(event) &&
            event.data &&
            event.data.tabId !== this.tabId &&
            this.onSnapshotRestored
          ) {
            const restoreResult = wrapResult(() => this.onSnapshotRestored?.(event.data));
            if (isErr(restoreResult)) {
              console.warn(
                '[SnapshotManager] Error executing onSnapshotRestored handler:',
                restoreResult.error,
              );
            }
          }
        };
        channel.addEventListener('message', this.messageHandler);
      } else {
        this.broadcastChannel = null;
      }
    }
  }

  /**
   * Constructs a validated snapshot object.
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
      offsets: sanitizeOffsets(offsets),
      payloads: sanitizePayloads(payloads),
    };
  }

  /**
   * Saves snapshot to configured storage engine and broadcasts to neighbor tabs.
   *
   * @param snapshot - Snapshot data to persist.
   */
  saveSnapshot(snapshot: PopoverSnapshotData<TData>): void {
    if (this.storageType !== 'none' && typeof window !== 'undefined') {
      const writeResult = wrapResult(() => {
        const storage =
          this.storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
        const raw = this.serializer ? this.serializer(snapshot) : JSON.stringify(snapshot);
        storage.setItem(this.storageKey, raw);
      });
      if (isErr(writeResult)) {
        console.warn('[SnapshotManager] Failed to write snapshot to storage:', writeResult.error);
      }
    }

    if (this.broadcastChannel) {
      const postResult = wrapResult(() => this.broadcastChannel?.postMessage(snapshot));
      if (isErr(postResult)) {
        console.warn('[SnapshotManager] BroadcastChannel sync failed:', postResult.error);
      }
    }
  }

  /**
   * Type predicate validating snapshot structure and protecting against prototype pollution.
   */
  private isValidSnapshot(data: unknown): data is PopoverSnapshotData<TData> {
    if (!isRecord(data)) return false;
    if (data.version !== SNAPSHOT_VERSION) return false;
    if (!areSnapshotKeysValid(data.trailKeys, data.pinnedKeys, data.offsets)) return false;
    return isPayloadSafe(data.payloads);
  }

  /**
   * Restores snapshot from configured storage engine.
   *
   * @returns Deserialized snapshot object or null if invalid/empty.
   */
  loadSnapshot(): PopoverSnapshotData<TData> | null {
    if (this.storageType === 'none' || typeof window === 'undefined') return null;

    const loadResult = wrapResult(() => {
      const storage =
        this.storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
      const raw = storage.getItem(this.storageKey);
      if (!raw) return null;
      try {
        const parsed: unknown = this.deserializer ? this.deserializer(raw) : JSON.parse(raw);
        return this.isValidSnapshot(parsed) ? parsed : null;
      } catch {
        return null;
      }
    });

    return isOk(loadResult) ? loadResult.data : null;
  }

  /**
   * Clears saved snapshot from configured storage engine.
   */
  clearSnapshot(): void {
    if (this.storageType !== 'none' && typeof window !== 'undefined') {
      wrapResult(() => {
        const storage =
          this.storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
        storage.removeItem(this.storageKey);
      });
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
