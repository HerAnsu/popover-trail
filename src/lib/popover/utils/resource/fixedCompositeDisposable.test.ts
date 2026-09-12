import { describe, it, expect, vi } from 'vitest';
import { FixedCompositeDisposable } from './fixedCompositeDisposable';
import { DISPOSE_SYMBOL } from './disposableTypes';

describe('FixedCompositeDisposable', () => {
  it('manages fixed capacity and executes LIFO teardown', () => {
    const order: number[] = [];
    const fixed = new FixedCompositeDisposable(3);

    expect(fixed.capacity).toBe(3);
    expect(fixed.size).toBe(0);

    fixed.add(() => order.push(1));
    fixed.add(() => order.push(2));
    fixed.add(() => order.push(3));
    expect(fixed.size).toBe(3);

    fixed.dispose();
    expect(order).toEqual([3, 2, 1]);
    expect(fixed.size).toBe(0);
    expect(fixed.isDisposed).toBe(true);
  });

  it('disposes incoming item and returns false when full', () => {
    const fixed = new FixedCompositeDisposable(2);
    fixed.add(() => {});
    fixed.add(() => {});

    const overflow = vi.fn();
    const added = fixed.add(overflow);

    expect(added).toBe(false);
    expect(overflow).toHaveBeenCalledTimes(1);
    expect(fixed.size).toBe(2);
  });

  it('immediately disposes items added after container disposal', () => {
    const fixed = new FixedCompositeDisposable(4);
    fixed.dispose();

    const late = vi.fn();
    const added = fixed.add(late);

    expect(added).toBe(false);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it('handles null/undefined and supports [DISPOSE_SYMBOL]', () => {
    const fixed = new FixedCompositeDisposable(2);
    expect(fixed.add(null)).toBe(true);
    expect(fixed.size).toBe(0);

    const d1 = vi.fn();
    fixed.add(d1);
    const fn = fixed[DISPOSE_SYMBOL];
    if (fn) {
      fn.call(fixed);
    }

    expect(d1).toHaveBeenCalledTimes(1);
    expect(fixed.isDisposed).toBe(true);
  });
});
