/**
 * Read-Only Inspection, Slicing, and Iteration for RingBuffer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferReader
 */

import type { Result } from '../result';
import type {
  BufferCapacity,
  BufferRevision,
  BufferLogicalIndex,
  BufferRelativeIndex,
} from './bufferBranded';
import type { BufferConsumer } from './bufferTypes';
import type { BufferEmptyError, IndexOutOfBoundsError } from './bufferErrors';
import { isBufferEmpty, isBufferFull } from './bufferGuards';
import { peekRingResult, peekFirstRingResult, itemAtRingResult } from './bufferMonadic';
import {
  forEachItem,
  forEachReversedItem,
  itemAt,
  createBufferIterator,
  createBufferEntriesIterator,
  createBufferKeysIterator,
  bufferToArray,
  bufferToReversedArray,
} from './bufferIteration';
import { sliceRing, copyRingTo } from './bufferSlice';
import { RingBufferQuery } from './ringBufferQuery';

export abstract class RingBufferReader<T> extends RingBufferQuery<T> {
  get capacity(): BufferCapacity {
    return this.state.capacity;
  }
  get size(): number {
    return this.state.count;
  }
  get isEmpty(): boolean {
    return isBufferEmpty(this.state);
  }
  get isFull(): boolean {
    return isBufferFull(this.state);
  }
  get revision(): BufferRevision {
    return this.state.revision;
  }

  peek(): T | undefined {
    return this.at(-1);
  }
  peekOldest(): T | undefined {
    return this.at(0);
  }
  peekFirst(): T | undefined {
    return this.at(0);
  }
  peekLast(): T | undefined {
    return this.at(-1);
  }

  /** Returns newest item wrapped in Ok Result, or Err(BufferEmptyError) if empty. */
  peekResult(): Result<T, BufferEmptyError> {
    return peekRingResult(this.state);
  }
  /** Returns oldest item wrapped in Ok Result, or Err(BufferEmptyError) if empty. */
  peekFirstResult(): Result<T, BufferEmptyError> {
    return peekFirstRingResult(this.state);
  }
  /** Returns newest item wrapped in Ok Result, matching peekResult. */
  peekLastResult(): Result<T, BufferEmptyError> {
    return peekRingResult(this.state);
  }

  at(relativeIndex: BufferRelativeIndex): T | undefined {
    return itemAt(this.state, relativeIndex);
  }
  atResult(relativeIndex: BufferRelativeIndex): Result<T, IndexOutOfBoundsError> {
    return itemAtRingResult(this.state, relativeIndex);
  }

  forEach(consumer: BufferConsumer<T>): void {
    forEachItem(this.state, consumer);
  }
  forEachReversed(consumer: BufferConsumer<T>): void {
    forEachReversedItem(this.state, consumer);
  }
  keys(): IterableIterator<BufferLogicalIndex> {
    return createBufferKeysIterator(this.state);
  }
  values(): IterableIterator<T> {
    return createBufferIterator(this.state);
  }
  entries(): IterableIterator<[BufferLogicalIndex, T]> {
    return createBufferEntriesIterator(this.state);
  }
  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  toArray(): T[] {
    return bufferToArray(this.state);
  }
  toReversedArray(): T[] {
    return bufferToReversedArray(this.state);
  }
  toReadonlyArray(): readonly T[] {
    return this.toArray();
  }

  slice(start?: BufferRelativeIndex, end?: BufferRelativeIndex): T[] {
    return sliceRing(this.state, start, end);
  }
  copyTo(target: (T | undefined)[], offset: BufferRelativeIndex = 0): number {
    return copyRingTo(this.state, target, offset);
  }
}
