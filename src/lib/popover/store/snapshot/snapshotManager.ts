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

export class PopoverSnapshotManager<TData = unknown> {
  private readonly storageKey: string;
  private readonly storageType: 'localStorage' | 'sessionStorage' | 'none';
  private broadcastChannel: BroadcastChannel | null = null;
  private messageHandler: EventListener | null = null;
  private readonly serializer?: (data: PopoverSnapshotData<TData>) => string;
  private readonly deserializer?: (raw: string) => PopoverSnapshotData<TData>;
  private readonly tabId: string = generateTabId();

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

  public saveSnapshot(snapshot: PopoverSnapshotData<TData>): void {
    saveSnapshotToPlatform(
      this.storageType,
      this.storageKey,
      snapshot,
      this.broadcastChannel,
      this.serializer,
    );
  }

  public loadSnapshot(): PopoverSnapshotData<TData> | null {
    return loadSnapshotFromPlatform(this.storageType, this.storageKey, this.deserializer);
  }

  public clearSnapshot(): void {
    removeSnapshotFromPlatform(this.storageType, this.storageKey);
  }

  public destroy(): void {
    if (this.broadcastChannel) {
      if (this.messageHandler)
        this.broadcastChannel.removeEventListener('message', this.messageHandler);
      this.broadcastChannel.close();
      this.broadcastChannel = null;
      this.messageHandler = null;
    }
  }

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
