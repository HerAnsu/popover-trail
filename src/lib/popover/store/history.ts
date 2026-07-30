/**
 * Undo / Redo History Snapshot Manager for popover-trail.
 * Maintains isolated history stacks with bounded capacity and referential safety.
 *
 * @module history
 */

import type { TrailEntry, PopoverStore } from '../types';

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

  const pushSnapshot = <TContext, TPopoverKey extends string>(
    state: PopoverStore<TData, TContext, TPopoverKey>,
  ) => {
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

  const clearHistory = () => {
    undoStack.length = 0;
    redoStack.length = 0;
  };

  return {
    undoStack,
    redoStack,
    pushSnapshot,
    clearHistory,
  };
}
