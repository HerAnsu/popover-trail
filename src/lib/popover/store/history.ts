/**
 * Undo / Redo History Snapshot Manager for popover-trail.
 * Maintains isolated history stacks with bounded capacity and referential safety.
 *
 * @module history
 */

import type { TrailEntry, PopoverStateData } from '../types';

/**
 * Snapshot of popover store state used for undo/redo history operations.
 *
 * @template TData - Resolved data payload type.
 */
export type HistorySnapshot<TData = unknown> = {
  trail: readonly TrailEntry<TData>[];
  floating: readonly TrailEntry<TData>[];
  offsets: Readonly<Record<string, Readonly<{ x: number; y: number }>>>;
  pinnedStates: Readonly<Record<string, boolean>>;
  zIndexOrder: readonly string[];
  ownerId: string | null;
};

/**
 * Creates an isolated history state manager for undo/redo snapshots.
 *
 * @template TData - Resolved data payload type.
 * @param maxHistory - Maximum number of history snapshots to retain (default: 30).
 * @returns History manager instance containing undo/redo stacks and push/clear methods.
 */
export function createHistoryManager<TData = unknown>(maxHistory = 30) {
  const undoStack: HistorySnapshot<TData>[] = [];
  const redoStack: HistorySnapshot<TData>[] = [];

  const pushSnapshot = <TContext>(state: PopoverStateData<TData, TContext>) => {
    const lastSnapshot = undoStack[undoStack.length - 1];
    if (
      lastSnapshot &&
      lastSnapshot.trail === state.trail &&
      lastSnapshot.floating === state.floating &&
      lastSnapshot.ownerId === state.ownerId
    ) {
      return;
    }

    if (undoStack.length >= maxHistory) {
      undoStack.shift();
    }
    undoStack.push({
      trail: state.trail,
      floating: state.floating,
      offsets: { ...state.offsets },
      pinnedStates: { ...state.pinnedStates },
      zIndexOrder: [...state.zIndexOrder],
      ownerId: state.ownerId,
    });
    redoStack.length = 0;
  };

  const canUndo = () => undoStack.length > 0;
  const canRedo = () => redoStack.length > 0;

  const undo = <TContext>(
    current: PopoverStateData<TData, TContext>,
  ): HistorySnapshot<TData> | null => {
    if (undoStack.length === 0) return null;
    const prev = undoStack.pop();
    if (!prev) return null;
    if (redoStack.length >= maxHistory) {
      redoStack.shift();
    }
    redoStack.push({
      trail: current.trail,
      floating: current.floating,
      offsets: current.offsets,
      pinnedStates: current.pinnedStates,
      zIndexOrder: current.zIndexOrder,
      ownerId: current.ownerId,
    });
    return prev;
  };

  const redo = <TContext>(
    current: PopoverStateData<TData, TContext>,
  ): HistorySnapshot<TData> | null => {
    if (redoStack.length === 0) return null;
    const next = redoStack.pop();
    if (!next) return null;
    if (undoStack.length >= maxHistory) {
      undoStack.shift();
    }
    undoStack.push({
      trail: current.trail,
      floating: current.floating,
      offsets: current.offsets,
      pinnedStates: current.pinnedStates,
      zIndexOrder: current.zIndexOrder,
      ownerId: current.ownerId,
    });
    return next;
  };

  const clearHistory = () => {
    undoStack.length = 0;
    redoStack.length = 0;
  };

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    pushSnapshot,
    undo,
    redo,
    clearHistory,
  };
}
