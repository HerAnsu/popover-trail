/**
 * History Manager Contract and Snapshot Types.
 *
 * @module historyTypes
 */

import type { TrailEntry, DragOffset } from '../../types';
import type { ReadonlyRingBuffer, RingBufferMetrics } from '../../utils/buffer';

export interface HistorySnapshotState<TData = unknown, TPopoverKey extends string = string> {
  readonly trail?: readonly TrailEntry<TData, TPopoverKey>[];
  readonly floating?: readonly TrailEntry<TData, TPopoverKey>[];
  readonly offsets?: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  readonly pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly zIndexOrder?: readonly TPopoverKey[];
  readonly ownerId?: string | null;
}

export interface HistorySnapshot<TData = unknown, TPopoverKey extends string = string> {
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly zIndexOrder: readonly TPopoverKey[];
  readonly ownerId: string | null;
}

export interface HistoryTimelineProjection<TData = unknown, TPopoverKey extends string = string> {
  readonly past: readonly HistorySnapshot<TData, TPopoverKey>[];
  readonly present: HistorySnapshot<TData, TPopoverKey>;
  readonly future: readonly HistorySnapshot<TData, TPopoverKey>[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export interface HistoryManagerMetrics {
  readonly undo: RingBufferMetrics;
  readonly redo: RingBufferMetrics;
}

export interface HistoryManager<
  TData = unknown,
  TPopoverKey extends string = string,
  _TContext = unknown,
> {
  pushSnapshot: (state: HistorySnapshotState<TData, TPopoverKey>) => void;
  undo: (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ) => HistorySnapshot<TData, TPopoverKey> | null;
  redo: (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ) => HistorySnapshot<TData, TPopoverKey> | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getTimeline: (
    current: HistorySnapshotState<TData, TPopoverKey>,
  ) => HistoryTimelineProjection<TData, TPopoverKey>;
  getMetrics: () => HistoryManagerMetrics;
  getUndoBuffer: () => ReadonlyRingBuffer<HistorySnapshot<TData, TPopoverKey>>;
  getRedoBuffer: () => ReadonlyRingBuffer<HistorySnapshot<TData, TPopoverKey>>;
  dispose: () => void;
  readonly undoStack: readonly HistorySnapshot<TData, TPopoverKey>[];
  readonly redoStack: readonly HistorySnapshot<TData, TPopoverKey>[];
  [Symbol.dispose]?: () => void;
}
