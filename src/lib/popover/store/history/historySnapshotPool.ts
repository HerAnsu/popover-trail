/**
 * Zero-GC Snapshot Object Pooling and RingBuffer History Manager.
 *
 * @module historySnapshotPool
 */

import { RingBuffer, type ReadonlyRingBuffer, type RingBufferMetrics } from '../../utils/buffer';
import { EMPTY_ARRAY } from '../hydration/storeDefaults';
import {
  cloneNonEmptyRecord,
  cloneNonEmptyArray,
  areSnapshotsEqual,
} from './historySnapshotHelpers';
import type { HistorySnapshot, HistorySnapshotState } from './historyTypes';

export { areSnapshotsEqual };

export function createHistorySnapshot<TData = unknown, TPopoverKey extends string = string>(
  state: HistorySnapshotState<TData, TPopoverKey>,
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

export class HistorySnapshotPool<TData, TPopoverKey extends string = string> {
  private readonly buffer: RingBuffer<HistorySnapshot<TData, TPopoverKey>>;

  constructor(capacity = 30) {
    this.buffer = new RingBuffer<HistorySnapshot<TData, TPopoverKey>>(Math.max(1, capacity));
  }

  get size(): number {
    return this.buffer.size;
  }
  get isEmpty(): boolean {
    return this.buffer.isEmpty;
  }
  push(snapshot: HistorySnapshot<TData, TPopoverKey>): void {
    this.buffer.push(snapshot);
  }
  pop(): HistorySnapshot<TData, TPopoverKey> | undefined {
    return this.buffer.pop();
  }
  peek(): HistorySnapshot<TData, TPopoverKey> | undefined {
    return this.buffer.peek();
  }
  clear(): void {
    this.buffer.clear();
  }
  toArray(): HistorySnapshot<TData, TPopoverKey>[] {
    return this.buffer.toArray();
  }
  toReversedArray(): HistorySnapshot<TData, TPopoverKey>[] {
    return this.buffer.toReversedArray();
  }
  asReadonly(): ReadonlyRingBuffer<HistorySnapshot<TData, TPopoverKey>> {
    return this.buffer.asReadonly();
  }
  getMetrics(): RingBufferMetrics {
    return this.buffer.getMetrics();
  }
}
