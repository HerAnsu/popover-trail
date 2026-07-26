/**
 * Snapshot & Session Persistence Engine for popover-trail.
 * Provides serializable snapshot export/import, localStorage/sessionStorage persistence,
 * and BroadcastChannel real-time multi-tab synchronization without modifying URLs.
 */

export interface PopoverSnapshotData<TData = unknown> {
  version: string;
  timestamp: number;
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
}

export class PopoverSnapshotManager<TData = unknown> {
  private storageKey: string;
  private storageType: 'localStorage' | 'sessionStorage' | 'none';
  private broadcastChannel: BroadcastChannel | null = null;
  private onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;

  constructor(options: SnapshotManagerOptions<TData> = {}) {
    this.storageKey = options.storageKey ?? 'pt_popover_trail_snapshot';
    this.storageType = options.storageType ?? 'none';
    this.onSnapshotRestored = options.onSnapshotRestored;

    if (options.enableBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(`${this.storageKey}_channel`);
        this.broadcastChannel.onmessage = (event: MessageEvent<PopoverSnapshotData<TData>>) => {
          if (event.data && this.onSnapshotRestored) {
            this.onSnapshotRestored(event.data);
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
      version: '1.0.2',
      timestamp: Date.now(),
      trailKeys,
      pinnedKeys,
      offsets,
      payloads,
    };
  }

  /**
   * Saves snapshot to configured storage engine and broadcasts to neighbor tabs.
   */
  saveSnapshot(snapshot: PopoverSnapshotData<TData>): void {
    if (this.storageType !== 'none' && typeof window !== 'undefined') {
      try {
        const storage = window[this.storageType];
        storage.setItem(this.storageKey, JSON.stringify(snapshot));
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
   * Restores snapshot from configured storage engine.
   */
  loadSnapshot(): PopoverSnapshotData<TData> | null {
    if (this.storageType === 'none' || typeof window === 'undefined') return null;

    try {
      const storage = window[this.storageType];
      const raw = storage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as PopoverSnapshotData<TData>;
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
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
}
