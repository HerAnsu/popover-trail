/**
 * Zero-GC Snapshot Object Pooling and RingBuffer History Manager.
 *
 * @module historySnapshotPool
 */

import {
  RingBuffer,
  type ReadonlyRingBuffer,
  type RingBufferMetrics,
  type BufferEmptyError,
} from '../../utils/buffer';
import type { Result } from '../../utils/result';
import { EMPTY_ARRAY } from '../hydration/storeDefaults';
import { clamp } from '../../utils/math';
import {
  cloneNonEmptyRecord,
  cloneNonEmptyArray,
  areSnapshotsEqual,
} from './historySnapshotHelpers';
import type { HistorySnapshot, HistorySnapshotState } from './historyTypes';

export { areSnapshotsEqual };

/**
 * Constructs an immutable, normalized history snapshot from raw store slice properties.
 *
 * @template TData - Type of data payload associated with popover entries.
 * @template TPopoverKey - Branded or string type of popover key identifiers.
 * @param state - Raw store state slice properties.
 * @returns Immutable `HistorySnapshot` structure with frozen defaults.
 *
 * @example
 * ```typescript
 * const snap = createHistorySnapshot(getStoreState());
 * ```
 */
export function createHistorySnapshot<TData = unknown, TPopoverKey extends string = string>(
  state: HistorySnapshotState<TData, TPopoverKey>,
): HistorySnapshot<TData, TPopoverKey> {
  const {
    trail = EMPTY_ARRAY,
    floating = EMPTY_ARRAY,
    offsets,
    pinnedStates,
    zIndexOrder,
    ownerId = null,
  } = state;

  return {
    trail,
    floating,
    offsets: cloneNonEmptyRecord(offsets),
    pinnedStates: cloneNonEmptyRecord(pinnedStates),
    zIndexOrder: cloneNonEmptyArray(zIndexOrder),
    ownerId,
  };
}

/**
 * Bounded ring-buffer pool storing historical UI state snapshots for undo/redo workflows.
 *
 * @template TData - Type of data payload associated with popover entries.
 * @template TPopoverKey - Branded or string type of popover key identifiers.
 *
 * @example
 * ```typescript
 * const pool = new HistorySnapshotPool(20);
 * pool.push(snap);
 * const previous = pool.pop();
 * ```
 */
export class HistorySnapshotPool<TData, TPopoverKey extends string = string> {
  private readonly buffer: RingBuffer<HistorySnapshot<TData, TPopoverKey>>;

  /**
   * Constructs a new `HistorySnapshotPool`.
   *
   * @param capacity - Maximum capacity of snapshots kept in the ring buffer (default: 30).
   */
  constructor(capacity = 30) {
    this.buffer = new RingBuffer<HistorySnapshot<TData, TPopoverKey>>(clamp(capacity, 1, Infinity));
  }

  /** Current number of active snapshots stored in the history buffer. */
  get size(): number {
    return this.buffer.size;
  }

  /** Whether the history buffer contains zero snapshots. */
  get isEmpty(): boolean {
    return this.buffer.isEmpty;
  }

  /**
   * Pushes a new snapshot onto the history buffer, evicting the oldest if at capacity.
   *
   * @param snapshot - History snapshot to record.
   */
  push(snapshot: HistorySnapshot<TData, TPopoverKey>): void {
    this.buffer.push(snapshot);
  }

  /**
   * Pops and removes the most recent snapshot from the history buffer.
   *
   * @returns The popped snapshot or `undefined` if empty.
   */
  pop(): HistorySnapshot<TData, TPopoverKey> | undefined {
    return this.buffer.pop();
  }

  /**
   * Inspects the most recent snapshot without removing it.
   *
   * @returns The newest snapshot or `undefined` if empty.
   */
  peek(): HistorySnapshot<TData, TPopoverKey> | undefined {
    return this.buffer.peek();
  }

  /**
   * Monadic pop returning a `Result` monad for railway-oriented error handling.
   */
  popResult(): Result<HistorySnapshot<TData, TPopoverKey>, BufferEmptyError> {
    return this.buffer.popResult();
  }

  /**
   * Monadic peek returning a `Result` monad.
   */
  peekResult(): Result<HistorySnapshot<TData, TPopoverKey>, BufferEmptyError> {
    return this.buffer.peekResult();
  }

  /** Empties all historical snapshots. */
  clear(): void {
    this.buffer.clear();
  }

  /** Exports all active snapshots in chronological order (oldest to newest). */
  toArray(): HistorySnapshot<TData, TPopoverKey>[] {
    return this.buffer.toArray();
  }

  /** Exports all active snapshots in reverse chronological order (newest to oldest). */
  toReversedArray(): HistorySnapshot<TData, TPopoverKey>[] {
    return this.buffer.toReversedArray();
  }

  /** Exposes a read-only view of the underlying circular buffer. */
  asReadonly(): ReadonlyRingBuffer<HistorySnapshot<TData, TPopoverKey>> {
    return this.buffer.asReadonly();
  }

  /** Returns buffer throughput telemetry metrics. */
  getMetrics(): RingBufferMetrics {
    return this.buffer.getMetrics();
  }
}
