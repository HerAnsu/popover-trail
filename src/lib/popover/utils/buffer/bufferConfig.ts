/**
 * Configuration Resolver for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/buffer/bufferConfig
 */

import { validateCapacity, isPowerOfTwo } from './bufferIndex';
import { isRingBufferOptions } from './bufferGuards';
import type { BufferCapacity } from './bufferBranded';
import type { RingBufferOptions } from './bufferTypes';

export interface ResolvedBufferConfig<T> {
  readonly capacity: BufferCapacity;
  readonly onEvict?: (item: T) => void;
  readonly isPowerOf2: boolean;
  readonly mask: number;
  readonly autoExpand: boolean;
  readonly maxCapacity: BufferCapacity | number;
}

export function resolveBufferConfig<T>(
  opt: BufferCapacity | number | RingBufferOptions<T>,
  onEvict?: (item: T) => void,
): ResolvedBufferConfig<T> {
  if (isRingBufferOptions<T>(opt)) {
    const capacity = validateCapacity(opt.capacity);
    return {
      capacity,
      onEvict: opt.onEvict ?? onEvict,
      isPowerOf2: isPowerOfTwo(capacity),
      mask: capacity - 1,
      autoExpand: Boolean(opt.autoExpand),
      maxCapacity: opt.maxCapacity ? Math.max(capacity, opt.maxCapacity) : Infinity,
    };
  }
  const capacity = validateCapacity(opt);
  return {
    capacity,
    onEvict,
    isPowerOf2: isPowerOfTwo(capacity),
    mask: capacity - 1,
    autoExpand: false,
    maxCapacity: Infinity,
  };
}
