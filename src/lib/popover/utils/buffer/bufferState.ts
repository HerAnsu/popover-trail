/**
 * Internal State Factory and Lifecycle Helpers for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferState
 */

import { getBufferItem } from './bufferIndex';
import { toPhysicalIndex, toLogicalIndex, INITIAL_REVISION, nextRevision } from './bufferBranded';
import type { ResolvedBufferConfig } from './bufferConfig';
import type { RingBufferState } from './bufferTypes';

export function createRingBufferState<T>(config: ResolvedBufferConfig<T>): RingBufferState<T> {
  return {
    buffer: Array.from<T | undefined>({ length: config.capacity }),
    head: toPhysicalIndex(0),
    count: 0,
    capacity: config.capacity,
    isPowerOf2: config.isPowerOf2,
    mask: config.mask,
    autoExpand: config.autoExpand,
    maxCapacity: config.maxCapacity,
    revision: INITIAL_REVISION,
    onEvict: config.onEvict,
  };
}

export function evictBufferItems<T>(state: RingBufferState<T>, count: number): void {
  if (!state.onEvict) return;
  for (let i = 0; i < count; i++) {
    const item = getBufferItem(state, toLogicalIndex(i));
    if (item !== undefined) state.onEvict(item);
  }
}

export function clearRingBufferState<T>(state: RingBufferState<T>): void {
  state.revision = nextRevision(state.revision);
  evictBufferItems(state, state.count);
  state.buffer.fill(undefined);
  state.head = toPhysicalIndex(0);
  state.count = 0;
}
