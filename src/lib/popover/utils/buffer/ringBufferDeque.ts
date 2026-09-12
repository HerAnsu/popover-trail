/**
 * Stateful Double-Ended Queue (Deque) Implementation for RingBuffer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferDeque
 */

import type { Result } from '../result';
import type { BufferCapacity, BufferRelativeIndex } from './bufferBranded';
import type { BufferEmptyError, BufferOverflowError } from './bufferErrors';
import type { RingBufferState } from './bufferStateTypes';
import { BufferMetricsTracker } from './bufferMetrics';
import { pushItem, popItem, shiftItem, unshiftItem } from './bufferQueue';
import { popRingResult, shiftRingResult, tryPushRing, tryUnshiftRing } from './bufferMonadic';
import { swapRingItems, reverseRing, fillRing } from './bufferMutation';
import { clearRingBufferState } from './bufferState';
import { isIterable } from './bufferGuards';
import { RingBufferReader } from './ringBufferReader';

export abstract class RingBufferDeque<T> extends RingBufferReader<T> {
  abstract override readonly state: RingBufferState<T>;
  protected readonly metrics = new BufferMetricsTracker();

  push(item: T): void {
    pushItem(this.state, this.metrics, item, (cap) => this.resize(cap));
  }
  pushMany(items: Iterable<T>): void {
    if (!isIterable(items)) return;
    for (const item of items) this.push(item);
  }
  tryPush(item: T): Result<void, BufferOverflowError> {
    return tryPushRing(this.state, this.metrics, item, (cap) => this.resize(cap));
  }
  tryUnshift(item: T): Result<void, BufferOverflowError> {
    return tryUnshiftRing(this.state, this.metrics, item, (cap) => this.resize(cap));
  }
  pop(): T | undefined {
    return popItem(this.state, this.metrics);
  }
  popResult(): Result<T, BufferEmptyError> {
    return popRingResult(this.state, this.metrics);
  }
  shift(): T | undefined {
    return shiftItem(this.state, this.metrics);
  }
  shiftResult(): Result<T, BufferEmptyError> {
    return shiftRingResult(this.state, this.metrics);
  }
  unshift(item: T): void {
    unshiftItem(this.state, this.metrics, item, (cap) => this.resize(cap));
  }

  swap(indexA: BufferRelativeIndex, indexB: BufferRelativeIndex): boolean {
    return swapRingItems(this.state, indexA, indexB);
  }
  reverse(): void {
    reverseRing(this.state);
  }
  fill(value: T): void {
    fillRing(this.state, value);
  }
  clear(): void {
    clearRingBufferState(this.state);
  }

  abstract resize(newCapacity: BufferCapacity | number): void;
}
