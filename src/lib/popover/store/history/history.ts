/**
 * Ring Buffer History Manager for Popover Trail (Zero-GC Optimization).
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module history
 */

import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { ok, err, type Result } from '../../utils/result';
import type {
  HistoryError,
  HistoryManager,
  HistorySnapshot,
  HistorySnapshotState,
  HistoryTimelineProjection,
} from './historyTypes';
import {
  areSnapshotsEqual,
  createHistorySnapshot,
  HistorySnapshotPool,
} from './historySnapshotPool';

export * from './historyTypes';
export * from './historySnapshotHelpers';
export * from './historySnapshotPool';
export * from './historyApply';

/**
 * Factory creating a bounded history manager for undo/redo state replay.
 *
 * @remarks
 * - Uses two bounded ring buffers (`undoPool` and `redoPool`) with a fixed capacity.
 * - Prevents unbounded memory growth by discarding older entries when the buffer is full.
 * - Deduplicates identical consecutive snapshots to keep history clean.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Popover key identifier.
 * @template _TContext - Application context.
 * @param capacity - Maximum snapshots to retain in undo/redo history (default 30).
 * @returns Fully implemented `HistoryManager` instance.
 */
export function createHistoryManager<
  TData = unknown,
  TPopoverKey extends string = string,
  _TContext = unknown,
>(capacity = 30): HistoryManager<TData, TPopoverKey, _TContext> {
  const undoPool = new HistorySnapshotPool<TData, TPopoverKey>(capacity);
  const redoPool = new HistorySnapshotPool<TData, TPopoverKey>(capacity);

  // Records state into undo stack, ignoring idempotent consecutive identical snapshots
  const pushSnapshot = (state: HistorySnapshotState<TData, TPopoverKey>): void => {
    const next = createHistorySnapshot(state);
    const last = undoPool.peek();
    if (last && areSnapshotsEqual(last, next)) return;
    undoPool.push(next);
    redoPool.clear();
  };

  // Pops previous snapshot; preserves present snapshot on redo stack
  const undo = (state: HistorySnapshotState<TData, TPopoverKey>): HistorySnapshot<TData, TPopoverKey> | null => {
    const previous = undoPool.pop();
    if (!previous) return null;
    redoPool.push(createHistorySnapshot(state));
    return previous;
  };

  // Pops next redo snapshot; preserves present snapshot on undo stack
  const redo = (state: HistorySnapshotState<TData, TPopoverKey>): HistorySnapshot<TData, TPopoverKey> | null => {
    const next = redoPool.pop();
    if (!next) return null;
    undoPool.push(createHistorySnapshot(state));
    return next;
  };

  /**
   * Restores the previous state snapshot returning a Result.
   * Returns `Err(HistoryError)` if the undo pool is empty.
   */
  const undoResult = (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ): Result<HistorySnapshot<TData, TPopoverKey>, HistoryError> => {
    const previous = undo(state);
    if (!previous) {
      return err({
        type: 'undo_underflow',
        message: 'Cannot undo: undo history journal is empty.',
      });
    }
    return ok(previous);
  };

  /**
   * Re-applies the next state snapshot returning a Result.
   * Returns `Err(HistoryError)` if the redo pool is empty.
   */
  const redoResult = (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ): Result<HistorySnapshot<TData, TPopoverKey>, HistoryError> => {
    const next = redo(state);
    if (!next) {
      return err({
        type: 'redo_underflow',
        message: 'Cannot redo: redo history journal is empty.',
      });
    }
    return ok(next);
  };

  const clearHistory = (): void => { undoPool.clear(); redoPool.clear(); };

  const getTimeline = (
    current: HistorySnapshotState<TData, TPopoverKey>,
  ): HistoryTimelineProjection<TData, TPopoverKey> => ({
    past: undoPool.toArray(),
    present: createHistorySnapshot(current),
    future: redoPool.toReversedArray(),
    canUndo: !undoPool.isEmpty,
    canRedo: !redoPool.isEmpty,
  });

  return {
    pushSnapshot,
    undo,
    redo,
    undoResult,
    redoResult,
    canUndo: () => !undoPool.isEmpty,
    canRedo: () => !redoPool.isEmpty,
    clearHistory,
    getTimeline,
    getMetrics: () => ({ undo: undoPool.getMetrics(), redo: redoPool.getMetrics() }),
    getUndoBuffer: () => undoPool.asReadonly(),
    getRedoBuffer: () => redoPool.asReadonly(),
    dispose: clearHistory,
    [DISPOSE_SYMBOL]: clearHistory,
    [Symbol.dispose]: clearHistory,
    get undoStack() { return undoPool.toArray(); },
    get redoStack() { return redoPool.toArray(); },
  };
}
