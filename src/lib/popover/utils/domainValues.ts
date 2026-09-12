/**
 * Domain Value Objects for ZIndex and DurationMs.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domainValues
 */

export class ZIndex {
  public readonly value: number;

  private constructor(val: number) {
    this.value = Math.max(0, Math.floor(Number.isFinite(val) ? val : 0));
  }

  public static of(val: number): ZIndex {
    return new ZIndex(val);
  }

  public next(): ZIndex {
    return new ZIndex(this.value + 1);
  }

  public elevate(step = 10): ZIndex {
    return new ZIndex(this.value + Math.max(0, Math.floor(step)));
  }
}

export class DurationMs {
  public readonly value: number;

  private constructor(val: number) {
    this.value = Math.max(0, Number.isFinite(val) ? val : 0);
  }

  public static of(val: number): DurationMs {
    return new DurationMs(val);
  }

  public static zero(): DurationMs {
    return new DurationMs(0);
  }
}
