/**
 * Undo / Redo History Snapshot Manager for popover-trail.
 * Maintains isolated history stacks with bounded capacity and referential safety.
 *
 * @module history
 */

import type { TrailEntry, PopoverStateData, DragOffset } from '../types';
import { DEFAULT_MAX_HISTORY_DEPTH } from '../constants';
import { EMPTY_ARRAY, EMPTY_OBJECT } from './storeDefaults';
import { shallowEqual } from '../utils/equality';
import { DISPOSE_SYMBOL } from '../utils/disposable';

export type HistorySnapshot<TData = unknown, TPopoverKey extends string = string> = {
  trail: readonly TrailEntry<TData, TPopoverKey>[];
  floating: readonly TrailEntry<TData, TPopoverKey>[];
  offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  zIndexOrder: readonly TPopoverKey[];
  ownerId: string | null;
};

export interface HistoryTimelineProjection<TData = unknown, TPopoverKey extends string = string> {
  past: readonly HistorySnapshot<TData, TPopoverKey>[];
  present: HistorySnapshot<TData, TPopoverKey>;
  future: readonly HistorySnapshot<TData, TPopoverKey>[];
  canUndo: boolean;
  canRedo: boolean;
}

class RingBuffer<T> {
  private readonly buffer: (T | undefined)[];
  private head: number;
  private tail: number;
  private _length: number;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = Math.max(1, Math.floor(capacity) || 1);
    this.buffer = Array.from({ length: this.capacity });
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
    const arr: T[] = Array.from({ length: this._length });
    for (let i = 0; i < this._length; i++) {
      const item = this.buffer[(this.head + i) % this.capacity];
      if (item !== undefined) {
        arr[i] = item;
      }
    }
    return arr;
  }
}

function cloneNonEmptyRecord<T extends object>(record?: T): T {
  if (!record || Object.keys(record).length === 0) {
    return EMPTY_OBJECT as T;
  }
  return { ...record };
}

function cloneNonEmptyArray<T>(arr?: readonly T[]): readonly T[] {
  if (!arr || arr.length === 0) return EMPTY_ARRAY;
  return [...arr];
}

/**
 * Reuses the previous snapshot's record reference when content-equal, so
 * accepted pushes do not clone untouched history slices on every interaction.
 */
function reuseOrCloneRecord<T extends object>(last: T | undefined, next?: T): T {
  if (last !== undefined && next !== undefined && shallowEqual(last, next)) {
    return last;
  }
  return cloneNonEmptyRecord(next);
}

/** Array counterpart of {@link reuseOrCloneRecord} using element-wise identity. */
function reuseOrCloneArray<T>(last: readonly T[] | undefined, next?: readonly T[]): readonly T[] {
  if (
    last !== undefined &&
    next !== undefined &&
    last.length === next.length &&
    last.every((v, i) => v === next[i])
  ) {
    return last;
  }
  return cloneNonEmptyArray(next);
}

/**
 * Creates an immutable snapshot from the current popover store state for history tracking.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover string key type.
 * @param state - Current popover store state.
 * @returns Snapshot representation of the trail, pinned cards, and offsets.
 */
export function createHistorySnapshot<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): HistorySnapshot<TData, TPopoverKey> {
  return {
    trail: state.trail ?? EMPTY_ARRAY,
    floating: state.floating ?? EMPTY_ARRAY,
    offsets: cloneNonEmptyRecord(state.offsets),
    pinnedStates: cloneNonEmptyRecord(state.pinnedStates),
    zIndexOrder: cloneNonEmptyArray(state.zIndexOrder),
    ownerId: state.ownerId ?? null,
  };
}

/**
 * Creates a bounded RingBuffer history manager supporting Undo/Redo time travel.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Popover string key type.
 * @param maxHistory - Maximum history depth capacity (defaults to `DEFAULT_MAX_HISTORY_DEPTH`).
 * @returns History manager instance with `pushSnapshot`, `undo`, `redo`, `canUndo`, and `getTimeline`.
 *
 * @example
 * ```typescript
 * const history = createHistoryManager();
 * history.pushSnapshot(store.getState());
 * if (history.canUndo()) {
 *   const prev = history.undo(store.getState());
 * }
 * ```
 */
export function createHistoryManager<TData = unknown, TPopoverKey extends string = string>(
  maxHistory = DEFAULT_MAX_HISTORY_DEPTH,
) {
  const undoBuffer = new RingBuffer<HistorySnapshot<TData, TPopoverKey>>(maxHistory);
  const redoBuffer = new RingBuffer<HistorySnapshot<TData, TPopoverKey>>(maxHistory);

  const pushSnapshot = <TContext>(state: PopoverStateData<TData, TContext, TPopoverKey>) => {
    const lastSnapshot = undoBuffer.peekLast();
    const offsets = state.offsets ?? EMPTY_OBJECT;
    const pinnedStates = state.pinnedStates ?? EMPTY_OBJECT;
    const zIndexOrder = state.zIndexOrder ?? EMPTY_ARRAY;

    if (
      lastSnapshot?.trail === state.trail &&
      lastSnapshot.floating === state.floating &&
      lastSnapshot.ownerId === state.ownerId &&
      shallowEqual(lastSnapshot.offsets, offsets) &&
      shallowEqual(lastSnapshot.pinnedStates, pinnedStates) &&
      lastSnapshot.zIndexOrder.length === zIndexOrder.length &&
      lastSnapshot.zIndexOrder.every((k, i) => k === zIndexOrder[i])
    ) {
      return;
    }

    undoBuffer.push({
      trail: state.trail ?? EMPTY_ARRAY,
      floating: state.floating ?? EMPTY_ARRAY,
      offsets: reuseOrCloneRecord(lastSnapshot?.offsets, offsets),
      pinnedStates: reuseOrCloneRecord(lastSnapshot?.pinnedStates, pinnedStates),
      zIndexOrder: reuseOrCloneArray(lastSnapshot?.zIndexOrder, zIndexOrder),
      ownerId: state.ownerId ?? null,
    });
    redoBuffer.clear();
  };

  const canUndo = () => undoBuffer.length > 0;
  const canRedo = () => redoBuffer.length > 0;

  const undo = <TContext>(
    current: PopoverStateData<TData, TContext, TPopoverKey>,
  ): HistorySnapshot<TData, TPopoverKey> | null => {
    if (undoBuffer.length === 0) return null;
    const prev = undoBuffer.pop();
    if (!prev) return null;

    redoBuffer.push(createHistorySnapshot(current));
    return prev;
  };

  const redo = <TContext>(
    current: PopoverStateData<TData, TContext, TPopoverKey>,
  ): HistorySnapshot<TData, TPopoverKey> | null => {
    if (redoBuffer.length === 0) return null;
    const next = redoBuffer.pop();
    if (!next) return null;

    undoBuffer.push(createHistorySnapshot(current));
    return next;
  };

  const clearHistory = () => {
    undoBuffer.clear();
    redoBuffer.clear();
  };

  const getTimeline = <TContext>(
    current: PopoverStateData<TData, TContext, TPopoverKey>,
  ): HistoryTimelineProjection<TData, TPopoverKey> => ({
    past: undoBuffer.toArray(),
    present: createHistorySnapshot(current),
    future: redoBuffer.toArray().toReversed(),
    canUndo: canUndo(),
    canRedo: canRedo(),
  });

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
    getTimeline,
    dispose: clearHistory,
    [DISPOSE_SYMBOL]: clearHistory,
  };
}

export type HistoryManager<TData = unknown, TPopoverKey extends string = string> = ReturnType<
  typeof createHistoryManager<TData, TPopoverKey>
>;
