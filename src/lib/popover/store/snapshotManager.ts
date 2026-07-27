/**
 * Snapshot & Session Persistence Engine for popover-trail.
 * Provides serializable snapshot export/import, localStorage/sessionStorage persistence,
 * and BroadcastChannel real-time multi-tab synchronization without modifying URLs.
 */

import { validateStorageKey } from '../utils/devWarnings';

export interface PopoverSnapshotData<TData = unknown> {
  version: string;
  timestamp: number;
  tabId?: string;
  trailKeys: string[];
  pinnedKeys: string[];
  offsets: Record<string, { x: number; y: number }>;
  payloads?: Record<string, TData>;
}

export interface SnapshotManagerOptions<TData = unknown> {
  storageKey?: string;
  storageType?: 'localStorage' | 'sessionStorage' | 'none';
  enableBroadcastChannel?: boolean;
  onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;
  serialize?: (data: PopoverSnapshotData<TData>) => string;
  deserialize?: (raw: string) => PopoverSnapshotData<TData>;
}

export class PopoverSnapshotManager<TData = unknown> {
  private storageKey: string;
  private storageType: 'localStorage' | 'sessionStorage' | 'none';
  private broadcastChannel: BroadcastChannel | null = null;
  private onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;
  private serializer?: (data: PopoverSnapshotData<TData>) => string;
  private deserializer?: (raw: string) => PopoverSnapshotData<TData>;
  private readonly tabId = Math.random().toString(36).substring(2, 9);

  constructor(options: SnapshotManagerOptions<TData> = {}) {
    this.storageKey = options.storageKey ?? 'pt_popover_trail_snapshot';
    validateStorageKey(this.storageKey);
    this.storageType = options.storageType ?? 'none';
    this.onSnapshotRestored = options.onSnapshotRestored;
    this.serializer = options.serialize;
    this.deserializer = options.deserialize;

    if (options.enableBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(`${this.storageKey}_channel`);
        this.broadcastChannel.onmessage = (event: MessageEvent<PopoverSnapshotData<TData>>) => {
          if (event.data && event.data.tabId !== this.tabId && this.onSnapshotRestored) {
            try {
              this.onSnapshotRestored(event.data);
            } catch (err) {
              console.warn('[SnapshotManager] Error executing onSnapshotRestored handler:', err);
            }
          }
        };
      } catch {
        this.broadcastChannel = null;
      }
    }
  }

  /**
   * Generates a clean serializable snapshot payload.
   */
  createSnapshot(
    trailKeys: string[],
    pinnedKeys: string[],
    offsets: Record<string, { x: number; y: number }>,
    payloads?: Record<string, TData>,
  ): PopoverSnapshotData<TData> {
    return {
      version: '1.0.3',
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

  private isValidSnapshot(data: unknown): data is PopoverSnapshotData<TData> {
    if (typeof data !== 'object' || data === null) return false;
    const snapshot = data as PopoverSnapshotData<TData>;
    if (!Array.isArray(snapshot.trailKeys) || !Array.isArray(snapshot.pinnedKeys)) return false;
    if (typeof snapshot.offsets !== 'object' || snapshot.offsets === null) return false;

    // Protection against Prototype Pollution in stored snapshots
    const offsetKeys = Object.keys(snapshot.offsets);
    for (let i = 0; i < offsetKeys.length; i++) {
      const k = offsetKeys[i];
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
    }
    return true;
  }

  /**
   * Restores snapshot from configured storage engine.
   */
  loadSnapshot(): PopoverSnapshotData<TData> | null {
    if (this.storageType === 'none' || typeof window === 'undefined') return null;

    try {
      const storage = window[this.storageType];
      const raw = storage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = this.deserializer ? this.deserializer(raw) : (JSON.parse(raw) as PopoverSnapshotData<TData>);
      return this.isValidSnapshot(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Clears saved snapshot from storage.
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
      this.broadcastChannel.onmessage = null;
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
}
