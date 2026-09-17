/**
 * Domain Value Objects for ZIndex and DurationMs.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domainValues
 */

import { toFiniteNumber } from './stylesTransform';
import { clamp } from './math';

/**
 * Immutable value object representing a non-negative integer z-index stacking depth.
 * Clamps input values to non-negative finite range.
 *
 * @example
 * ```typescript
 * const z = ZIndex.of(1000);
 * const nextZ = z.next(); // 1001
 * const elevated = z.elevate(10); // 1010
 * ```
 */
export class ZIndex {
  public readonly value: number;

  private constructor(val: number) {
    this.value = clamp(Math.floor(toFiniteNumber(val)), 0, Infinity);
  }

  /** Creates a new ZIndex value object. */
  public static of(val: number): ZIndex {
    return new ZIndex(val);
  }

  /** Returns a new ZIndex incremented by 1. */
  public next(): ZIndex {
    return new ZIndex(this.value + 1);
  }

  /** Returns a new ZIndex incremented by the specified step (defaults to 10). */
  public elevate(step = 10): ZIndex {
    return new ZIndex(this.value + clamp(Math.floor(toFiniteNumber(step)), 0, Infinity));
  }
}

/**
 * Immutable value object representing a non-negative millisecond duration.
 * Clamps input values to non-negative finite range.
 *
 * @example
 * ```typescript
 * const duration = DurationMs.of(300);
 * const zero = DurationMs.zero();
 * ```
 */
export class DurationMs {
  public readonly value: number;

  private constructor(val: number) {
    this.value = clamp(toFiniteNumber(val), 0, Infinity);
  }

  /** Creates a DurationMs instance with the given millisecond count. */
  public static of(val: number): DurationMs {
    return new DurationMs(val);
  }

  /** Creates a 0ms DurationMs instance. */
  public static zero(): DurationMs {
    return new DurationMs(0);
  }
}
