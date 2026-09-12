/**
 * Zero-Allocation In-Place Mutation Primitives for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferMutation
 */

import { getPhysicalIndex } from './bufferIndex';
import { isLogicalIndex, nextRevision, type BufferRelativeIndex } from './bufferBranded';
import type { RingBufferState } from './bufferStateTypes';

export function swapRingItems<T>(
  state: RingBufferState<T>,
  indexA: BufferRelativeIndex,
  indexB: BufferRelativeIndex,
): boolean {
  const normA = indexA < 0 ? state.count + indexA : indexA;
  const normB = indexB < 0 ? state.count + indexB : indexB;
  if (!isLogicalIndex(normA) || normA >= state.count) return false;
  if (!isLogicalIndex(normB) || normB >= state.count) return false;
  if (normA === normB) return true;
  const physA = getPhysicalIndex(state, normA);
  const physB = getPhysicalIndex(state, normB);
  const temp = state.buffer[physA];
  state.buffer[physA] = state.buffer[physB];
  state.buffer[physB] = temp;
  state.revision = nextRevision(state.revision);
  return true;
}

export function reverseRing<T>(state: RingBufferState<T>): void {
  if (state.count <= 1) return;
  const half = Math.floor(state.count / 2);
  for (let i = 0; i < half; i++) {
    const physA = getPhysicalIndex(state, i);
    const physB = getPhysicalIndex(state, state.count - 1 - i);
    const temp = state.buffer[physA];
    state.buffer[physA] = state.buffer[physB];
    state.buffer[physB] = temp;
  }
  state.revision = nextRevision(state.revision);
}

export function fillRing<T>(state: RingBufferState<T>, value: T): void {
  for (let i = 0; i < state.count; i++) {
    state.buffer[getPhysicalIndex(state, i)] = value;
  }
  state.revision = nextRevision(state.revision);
}
