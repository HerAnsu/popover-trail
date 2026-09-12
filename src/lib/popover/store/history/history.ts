/**
 * Ring Buffer History Manager for Popover Trail (Zero-GC Optimization).
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module history
 */

import { DISPOSE_SYMBOL } from '../../utils/disposable';
import type {
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

export function createHistoryManager<
  TData = unknown,
  TPopoverKey extends string = string,
  _TContext = unknown,
>(capacity = 30): HistoryManager<TData, TPopoverKey, _TContext> {
  const undoPool = new HistorySnapshotPool<TData, TPopoverKey>(capacity);
  const redoPool = new HistorySnapshotPool<TData, TPopoverKey>(capacity);

  const pushSnapshot = (state: HistorySnapshotState<TData, TPopoverKey>): void => {
    const next = createHistorySnapshot(state);
    const last = undoPool.peek();
    if (last && areSnapshotsEqual(last, next)) return;
    undoPool.push(next);
    redoPool.clear();
  };

  const undo = (state: HistorySnapshotState<TData, TPopoverKey>): HistorySnapshot<TData, TPopoverKey> | null => {
    const previous = undoPool.pop();
    if (!previous) return null;
    redoPool.push(createHistorySnapshot(state));
    return previous;
  };

  const redo = (state: HistorySnapshotState<TData, TPopoverKey>): HistorySnapshot<TData, TPopoverKey> | null => {
    const next = redoPool.pop();
    if (!next) return null;
    undoPool.push(createHistorySnapshot(state));
    return next;
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
