/**
 * Snapshot & Session Persistence Types and Constants.
 *
 * @module snapshotManagerTypes
 */

/** Current persistence schema version string. */
export const SNAPSHOT_VERSION = '1.0.3';

/** Default localStorage/sessionStorage key identifier for popover snapshots. */
export const DEFAULT_SNAPSHOT_STORAGE_KEY = 'popover_trail_snapshot';

/**
 * Serialized representation of a popover cascade state snapshot.
 *
 * @template TData - Popover payload data type.
 */
export interface PopoverSnapshotData<TData = unknown> {
  /** Persistence schema version identifier. */
  version: string | number;
  /** Unix epoch timestamp when snapshot was captured. */
  timestamp: number;
  /** Unique sender tab identifier to prevent echo loops in multi-tab sync. */
  tabId: string;
  /** Ordered list of active cascading popover keys. */
  trailKeys: string[];
  /** Keys of popovers pinned into floating state. */
  pinnedKeys: string[];
  /** 2D coordinate offsets for active popovers. */
  offsets: Record<string, { x: number; y: number }>;
  /** Optional serialized payloads associated with active popovers. */
  payloads?: Record<string, TData>;
}

/**
 * Type alias for popover store snapshot data.
 *
 * @template TData - Popover payload data type.
 */
export type PopoverStoreSnapshot<TData = unknown> = PopoverSnapshotData<TData>;

/**
 * Configuration options for the PopoverSnapshotManager.
 *
 * @template TData - Popover payload data type.
 */
export interface SnapshotManagerOptions<TData = unknown> {
  /** Custom platform storage key identifier. */
  storageKey?: string;
  /** Storage mechanism used to persist snapshot data ('localStorage', 'sessionStorage', or 'none'). */
  storageType?: 'localStorage' | 'sessionStorage' | 'none';
  /** Whether to sync snapshots across browser tabs using BroadcastChannel. */
  enableBroadcastChannel?: boolean;
  /** Callback fired when an external tab broadcasts a restored snapshot. */
  onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void;
  /** Custom serialization strategy for snapshot payload. */
  serialize?: (data: PopoverSnapshotData<TData>) => string;
  /** Custom deserialization strategy for raw string data. */
  deserialize?: (raw: string) => PopoverSnapshotData<TData>;
}

