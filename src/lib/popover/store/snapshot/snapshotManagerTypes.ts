/**
 * Snapshot & Session Persistence Types and Constants.
 *
 * @module snapshotManagerTypes
 */

export const SNAPSHOT_VERSION = '1.0.3';
export const DEFAULT_SNAPSHOT_STORAGE_KEY = 'popover_trail_snapshot';

export interface PopoverSnapshotData<TData = unknown> {
  version: string | number;
  timestamp: number;
  tabId: string;
  trailKeys: string[];
  pinnedKeys: string[];
  offsets: Record<string, { x: number; y: number }>;
  payloads?: Record<string, TData>;
}

export type PopoverStoreSnapshot<TData = unknown> = PopoverSnapshotData<TData>;

export interface SnapshotManagerOptions<TData = unknown> {
  storageKey?: string;
  storageType?: 'localStorage' | 'sessionStorage' | 'none';
  enableBroadcastChannel?: boolean;
  onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;
  serialize?: (data: PopoverSnapshotData<TData>) => string;
  deserialize?: (raw: string) => PopoverSnapshotData<TData>;
}
