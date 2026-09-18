/**
 * Query and Search Abstraction for RingBuffer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferQuery
 */

import type { BufferLogicalIndex, BufferRelativeIndex } from './bufferBranded';
import type {
  BufferPredicate,
  BufferReducer,
  BufferTypeGuard,
  ReadonlyRingBufferState,
} from './bufferTypes';
import {
  findInRing,
  findIndexInRing,
  findLastInRing,
  findLastIndexInRing,
  indexOfInRing,
  lastIndexOfInRing,
  includesInRing,
  someInRing,
  everyInRing,
  reduceInRing,
  reduceRightInRing,
} from './bufferSearch';

export abstract class RingBufferQuery<T> {
  abstract readonly state: ReadonlyRingBufferState<T>;

  find<S extends T>(predicate: BufferTypeGuard<T, S>): S | undefined;
  find(predicate: BufferPredicate<T>): T | undefined;
  find(predicate: BufferPredicate<T>): T | undefined {
    return findInRing(this.state, predicate);
  }

  findIndex(predicate: BufferPredicate<T>): BufferLogicalIndex | -1 {
    return findIndexInRing(this.state, predicate);
  }

  findLast<S extends T>(predicate: BufferTypeGuard<T, S>): S | undefined;
  findLast(predicate: BufferPredicate<T>): T | undefined;
  findLast(predicate: BufferPredicate<T>): T | undefined {
    return findLastInRing(this.state, predicate);
  }

  findLastIndex(predicate: BufferPredicate<T>): BufferLogicalIndex | -1 {
    return findLastIndexInRing(this.state, predicate);
  }

  indexOf(item: T, fromIndex?: BufferRelativeIndex): BufferLogicalIndex | -1 {
    return indexOfInRing(this.state, item, fromIndex);
  }

  lastIndexOf(item: T, fromIndex?: BufferRelativeIndex): BufferLogicalIndex | -1 {
    return lastIndexOfInRing(this.state, item, fromIndex);
  }

  includes(item: T, fromIndex?: BufferRelativeIndex): boolean {
    return includesInRing(this.state, item, fromIndex);
  }

  some(predicate: BufferPredicate<T>): boolean {
    return someInRing(this.state, predicate);
  }

  every(predicate: BufferPredicate<T>): boolean {
    return everyInRing(this.state, predicate);
  }

  reduce<U>(reducer: BufferReducer<T, U>, initialValue: U): U {
    return reduceInRing(this.state, reducer, initialValue);
  }

  reduceRight<U>(reducer: BufferReducer<T, U>, initialValue: U): U {
    return reduceRightInRing(this.state, reducer, initialValue);
  }
}
