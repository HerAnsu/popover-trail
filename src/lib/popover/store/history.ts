/**
 * Undo / Redo History Snapshot Manager for popover-trail.
 * Maintains isolated history stacks with bounded capacity and referential safety.
 *
 * @module history
 */

import type { TrailEntry, PopoverStateData } from '../types';
import { DEFAULT_MAX_HISTORY_DEPTH } from '../constants';

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
 * Internal Ring Buffer for O(1) history state management.
 */
class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number;
  private tail: number;
  private _length: number;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = Array.from({ length: capacity });
    this.head = 0;
    this.tail = 0;
    this._length = 0;
  }

  get length() {
    return this._length;
  }

  push(item: T) {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    if (this._length < this.capacity) {
      this._length++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined;
    this.tail = (this.tail - 1 + this.capacity) % this.capacity;
    const item = this.buffer[this.tail];
    this.buffer[this.tail] = undefined;
    this._length--;
    return item;
  }

  peekLast(): T | undefined {
    if (this._length === 0) return undefined;
    const index = (this.tail - 1 + this.capacity) % this.capacity;
    return this.buffer[index];
  }

  clear() {
    this.head = 0;
    this.tail = 0;
    this._length = 0;
    this.buffer.fill(undefined);
  }

  toArray(): T[] {
    const arr: T[] = [];
    for (let i = 0; i < this._length; i++) {
      const item = this.buffer[(this.head + i) % this.capacity];
      if (item !== undefined) {
        arr.push(item);
      }
    }
    return arr;
  }
}

/**
 * Creates an isolated history state manager for undo/redo snapshots.
 *
 * @template TData - Resolved data payload type.
 * @param maxHistory - Maximum number of history snapshots to retain (default: 30).
 * @returns History manager instance containing undo/redo stacks and push/clear methods.
 */
export function createHistoryManager<TData = unknown>(maxHistory = DEFAULT_MAX_HISTORY_DEPTH) {
  const undoBuffer = new RingBuffer<HistorySnapshot<TData>>(maxHistory);
  const redoBuffer = new RingBuffer<HistorySnapshot<TData>>(maxHistory);

  const pushSnapshot = <TContext>(state: PopoverStateData<TData, TContext>) => {
    const lastSnapshot = undoBuffer.peekLast();
    if (
      lastSnapshot &&
      lastSnapshot.trail === state.trail &&
      lastSnapshot.floating === state.floating &&
      lastSnapshot.ownerId === state.ownerId
    ) {
      return;
    }

    undoBuffer.push({
      trail: state.trail,
      floating: state.floating,
      offsets: { ...state.offsets },
      pinnedStates: { ...state.pinnedStates },
      zIndexOrder: [...state.zIndexOrder],
      ownerId: state.ownerId,
    });
    redoBuffer.clear();
  };

  const canUndo = () => undoBuffer.length > 0;
  const canRedo = () => redoBuffer.length > 0;

  const undo = <TContext>(
    current: PopoverStateData<TData, TContext>,
  ): HistorySnapshot<TData> | null => {
    if (undoBuffer.length === 0) return null;
    const prev = undoBuffer.pop();
    if (!prev) return null;

    redoBuffer.push({
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
    if (redoBuffer.length === 0) return null;
    const next = redoBuffer.pop();
    if (!next) return null;

    undoBuffer.push({
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
    undoBuffer.clear();
    redoBuffer.clear();
  };

  return {
    get undoStack() {
      return undoBuffer.toArray();
    },
    get redoStack() {
      return redoBuffer.toArray();
    },
    canUndo,
    canRedo,
    pushSnapshot,
    undo,
    redo,
    clearHistory,
  };
}
