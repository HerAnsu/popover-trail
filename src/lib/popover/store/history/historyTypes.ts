/**
 * History Manager Contract and Snapshot Types.
 *
 * @module historyTypes
 */

import type { TrailEntry, DragOffset } from '../../types';
import type { ReadonlyRingBuffer, RingBufferMetrics } from '../../utils/buffer';
import type { Result } from '../../utils/result';

/**
 * Diagnostic error union representing historical journal underflow conditions.
 */
export type HistoryError =
  | { readonly type: 'undo_underflow'; readonly message: string }
  | { readonly type: 'redo_underflow'; readonly message: string };

/**
 * Partial state input format accepted when generating a history snapshot.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Popover key identifier.
 */
export interface HistorySnapshotState<TData = unknown, TPopoverKey extends string = string> {
  readonly trail?: readonly TrailEntry<TData, TPopoverKey>[];
  readonly floating?: readonly TrailEntry<TData, TPopoverKey>[];
  readonly offsets?: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  readonly pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly zIndexOrder?: readonly TPopoverKey[];
  readonly ownerId?: string | null;
}

/**
 * Immutable normalized snapshot of the popover cascade state recorded in the history journal.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Popover key identifier.
 */
export interface HistorySnapshot<TData = unknown, TPopoverKey extends string = string> {
  /** Active cascading trail popover entries. */
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  /** Pinned floating cards. */
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  /** Custom drag and position offsets. */
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  /** Pinned state flags. */
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  /** Visual z-index order of keys. */
  readonly zIndexOrder: readonly TPopoverKey[];
  /** Identifier of the session owner. */
  readonly ownerId: string | null;
}

/**
 * Linear timeline projection partitioning the historical journal into past, present, and future.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Popover key identifier.
 */
export interface HistoryTimelineProjection<TData = unknown, TPopoverKey extends string = string> {
  /** Chronological list of snapshots available for undo. */
  readonly past: readonly HistorySnapshot<TData, TPopoverKey>[];
  /** Current state snapshot. */
  readonly present: HistorySnapshot<TData, TPopoverKey>;
  /** Reversed chronological list of snapshots available for redo. */
  readonly future: readonly HistorySnapshot<TData, TPopoverKey>[];
  /** `true` if at least one snapshot can be undone. */
  readonly canUndo: boolean;
  /** `true` if at least one snapshot can be redone. */
  readonly canRedo: boolean;
}

/**
 * Telemetry and memory metrics for undo and redo ring buffer structures.
 */
export interface HistoryManagerMetrics {
  readonly undo: RingBufferMetrics;
  readonly redo: RingBufferMetrics;
}

/**
 * History manager interface for state snapshots and undo/redo operations.
 *
 * @remarks
 * - Maintains a bounded history buffer so memory does not grow without limit.
 * - Pushing a new snapshot clears the redo stack.
 * - Supports both nullable (`undo`/`redo`) and `Result`-based (`undoResult`/`redoResult`) methods.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Popover key identifier.
 */
export interface HistoryManager<
  TData = unknown,
  TPopoverKey extends string = string,
  _TContext = unknown,
> {
  /** Records a new state snapshot into the undo journal; clears the redo stack. */
  pushSnapshot: (state: HistorySnapshotState<TData, TPopoverKey>) => void;
  /** Restores previous state snapshot, or null if undo history is empty. */
  undo: (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ) => HistorySnapshot<TData, TPopoverKey> | null;
  /** Re-applies subsequent state snapshot, or null if redo history is empty. */
  redo: (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ) => HistorySnapshot<TData, TPopoverKey> | null;
  /**
   * Restores previous state snapshot returning a `Result`.
   * Returns `Err(HistoryError)` on underflow.
   */
  undoResult: (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ) => Result<HistorySnapshot<TData, TPopoverKey>, HistoryError>;
  /**
   * Re-applies subsequent state snapshot returning a `Result`.
   * Returns `Err(HistoryError)` on underflow.
   */
  redoResult: (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ) => Result<HistorySnapshot<TData, TPopoverKey>, HistoryError>;
  /** `true` if undo stack contains entries. */
  canUndo: () => boolean;
  /** `true` if redo stack contains entries. */
  canRedo: () => boolean;
  /** Purges all undo and redo history snapshots. */
  clearHistory: () => void;
  /** Returns the partitioned timeline projection (past, present, future). */
  getTimeline: (
    current: HistorySnapshotState<TData, TPopoverKey>,
  ) => HistoryTimelineProjection<TData, TPopoverKey>;
  /** Returns ring buffer usage metrics. */
  getMetrics: () => HistoryManagerMetrics;
  /** Read-only view of the underlying undo ring buffer. */
  getUndoBuffer: () => ReadonlyRingBuffer<HistorySnapshot<TData, TPopoverKey>>;
  /** Read-only view of the underlying redo ring buffer. */
  getRedoBuffer: () => ReadonlyRingBuffer<HistorySnapshot<TData, TPopoverKey>>;
  /** Disposes history resources. */
  dispose: () => void;
  /** Array representation of snapshots currently in the undo stack. */
  readonly undoStack: readonly HistorySnapshot<TData, TPopoverKey>[];
  /** Array representation of snapshots currently in the redo stack. */
  readonly redoStack: readonly HistorySnapshot<TData, TPopoverKey>[];
  [Symbol.dispose]?: () => void;
}
