/**
 * Snapshot & Session Persistence Engine for popover-trail.
 *
 * @module snapshotManager
 */

import { validateStorageKey } from '../../validators';
import { generateTabId } from '../../utils/uuid';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import {
  SNAPSHOT_VERSION,
  DEFAULT_SNAPSHOT_STORAGE_KEY,
  type PopoverSnapshotData,
  type SnapshotManagerOptions,
} from './snapshotManagerTypes';
import { sanitizeOffsets, sanitizePayloads } from './snapshotSanitizers';
import {
  initSnapshotChannel,
  saveSnapshotToPlatform,
  loadSnapshotFromPlatform,
  removeSnapshotFromPlatform,
} from './snapshotStorageAdapter';

export * from './snapshotManagerTypes';
export * from './snapshotSanitizers';

/**
 * High-performance state snapshot and cross-tab synchronization manager.
 * Handles serializing active trail hierarchies and coordinate offsets to `localStorage` or `sessionStorage`,
 * and listens for remote tab changes over `BroadcastChannel`.
 *
 * @template TData - Popover payload data type.
 *
 * @example
 * ```typescript
 * const snapshotManager = new PopoverSnapshotManager({
 *   storageType: 'localStorage',
 *   storageKey: 'my_app_popover_trail',
 *   enableBroadcastChannel: true,
 *   onSnapshotRestored: (snapshot) => {
 *     console.log('Restored snapshot from another tab:', snapshot);
 *   },
 * });
 * ```
 */
export class PopoverSnapshotManager<TData = unknown> {
  private readonly storageKey: string;
  private readonly storageType: 'localStorage' | 'sessionStorage' | 'none';
  private broadcastChannel: BroadcastChannel | null = null;
  private messageHandler: EventListener | null = null;
  private readonly serializer?: (data: PopoverSnapshotData<TData>) => string;
  private readonly deserializer?: (raw: string) => PopoverSnapshotData<TData>;
  private readonly tabId: string = generateTabId();

  /**
   * Initializes a new PopoverSnapshotManager.
   *
   * @param options - Storage configuration, serialization callbacks, and broadcast options.
   */
  constructor(options: SnapshotManagerOptions<TData> = {}) {
    this.storageKey = options.storageKey ?? DEFAULT_SNAPSHOT_STORAGE_KEY;
    validateStorageKey(this.storageKey);
    this.storageType = options.storageType ?? 'none';
    this.serializer = options.serialize;
    this.deserializer = options.deserialize;

    if (options.enableBroadcastChannel) {
      const { channel, handler } = initSnapshotChannel(
        this.storageKey,
        this.tabId,
        options.onSnapshotRestored,
      );
      this.broadcastChannel = channel;
      this.messageHandler = handler;
    }
  }

  /**
   * Creates a sanitized, serializable snapshot object representing the current state of popovers.
   *
   * @param trailKeys - Ordered keys of active cascading trail cards.
   * @param pinnedKeys - Keys of cards pinned into floating mode.
   * @param offsets - Map of card coordinates { x, y }.
   * @param payloads - Optional map of resolved card payload data.
   * @returns A timestamped, sanitized `PopoverSnapshotData` instance.
   *
   * @example
   * ```typescript
   * const snapshot = snapshotManager.createSnapshot(['root', 'child'], ['pinned-1'], offsets);
   * ```
   */
  public createSnapshot(
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
   * Persists a state snapshot to the configured platform storage and broadcasts to other tabs.
   *
   * @param snapshot - Snapshot data object to save.
   *
   * @example
   * ```typescript
   * snapshotManager.saveSnapshot(snapshot);
   * ```
   */
  public saveSnapshot(snapshot: PopoverSnapshotData<TData>): void {
    saveSnapshotToPlatform(
      this.storageType,
      this.storageKey,
      snapshot,
      this.broadcastChannel,
      this.serializer,
    );
  }

  /**
   * Reads and parses a persisted snapshot from platform storage.
   *
   * @returns Deserialized and validated snapshot, or `null` if none exists or parsing failed.
   *
   * @example
   * ```typescript
   * const previous = snapshotManager.loadSnapshot();
   * if (previous) {
   *   console.log('Restored keys:', previous.trailKeys);
   * }
   * ```
   */
  public loadSnapshot(): PopoverSnapshotData<TData> | null {
    return loadSnapshotFromPlatform(this.storageType, this.storageKey, this.deserializer);
  }

  /**
   * Removes any persisted snapshot from platform storage.
   */
  public clearSnapshot(): void {
    removeSnapshotFromPlatform(this.storageType, this.storageKey);
  }

  /**
   * Closes the active BroadcastChannel connection and unbinds message listeners.
   */
  public destroy(): void {
    if (this.broadcastChannel) {
      if (this.messageHandler)
        this.broadcastChannel.removeEventListener('message', this.messageHandler);
      this.broadcastChannel.close();
      this.broadcastChannel = null;
      this.messageHandler = null;
    }
  }

  /**
   * Resource disposal contract for RAII cleanup.
   */
  public dispose(): void {
    this.destroy();
  }
  public [DISPOSE_SYMBOL](): void {
    this.destroy();
  }
  public [Symbol.dispose](): void {
    this.destroy();
  }
}
