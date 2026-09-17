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

/**
 * Resolved and validated configuration options for bounded ring buffer initialization.
 *
 * @template T - Type of elements stored in the buffer.
 */
export interface ResolvedBufferConfig<T> {
  /** Maximum slot capacity. */
  readonly capacity: BufferCapacity;
  /** Optional callback invoked when items are evicted on overflow. */
  readonly onEvict?: (item: T) => void;
  /** Whether capacity is a power of 2, enabling fast bitwise masking. */
  readonly isPowerOf2: boolean;
  /** Bitmask for fast index wrapping when capacity is power of 2 (`capacity - 1`). */
  readonly mask: number;
  /** Whether the buffer dynamically grows when reaching capacity. */
  readonly autoExpand: boolean;
  /** Upper bound limit if `autoExpand` is enabled. */
  readonly maxCapacity: BufferCapacity | number;
}

/**
 * Resolves raw numbers or configuration objects into a normalized `ResolvedBufferConfig`.
 *
 * @template T - Type of elements stored in the buffer.
 * @param opt - Numerical capacity or `RingBufferOptions` configuration dictionary.
 * @param onEvict - Optional fallback eviction callback.
 * @returns Fully validated and normalized `ResolvedBufferConfig<T>`.
 *
 * @example
 * ```typescript
 * const config = resolveBufferConfig<string>({ capacity: 16, autoExpand: true });
 * console.log(config.isPowerOf2); // true
 * console.log(config.mask); // 15
 * ```
 */
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
