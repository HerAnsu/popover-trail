/**
 * State & Options Type Contracts for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferStateTypes
 */

import type { BufferCapacity, BufferPhysicalIndex, BufferRevision } from './bufferBranded';

export interface RingBufferOptions<T> {
  readonly capacity: BufferCapacity | number;
  readonly onEvict?: ((item: T) => void) | undefined;
  readonly initialItems?: Iterable<T> | undefined;
  readonly autoExpand?: boolean | undefined;
  readonly maxCapacity?: BufferCapacity | number | undefined;
}

export interface ReadonlyRingBufferState<T> {
  readonly buffer: readonly (T | undefined)[];
  readonly head: BufferPhysicalIndex;
  readonly count: number;
  readonly capacity: BufferCapacity;
  readonly isPowerOf2: boolean;
  readonly mask: number;
  readonly autoExpand: boolean;
  readonly maxCapacity: BufferCapacity | number;
  readonly revision: BufferRevision;
  readonly onEvict?: ((item: T) => void) | undefined;
}

export interface RingBufferState<T> extends ReadonlyRingBufferState<T> {
  buffer: (T | undefined)[];
  head: BufferPhysicalIndex;
  count: number;
  capacity: BufferCapacity;
  isPowerOf2: boolean;
  mask: number;
  autoExpand: boolean;
  maxCapacity: BufferCapacity | number;
  revision: BufferRevision;
}
