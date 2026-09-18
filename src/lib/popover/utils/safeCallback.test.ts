import { describe, it, expect, vi } from 'vitest';
import { safeCallback } from './safeCallback';

describe('safeCallback', () => {
  it('returns value from successful execution', () => {
    const fn = (a: number, b: number) => a + b;
    const result = safeCallback(fn, [2, 3]);
    expect(result).toBe(5);
  });

  it('returns undefined and isolates errors when callback throws', () => {
    const throwingFn = () => {
      throw new Error('Explosion');
    };
    const onError = vi.fn();
    const result = safeCallback(throwingFn, [], { contextName: 'TestContext', onError });
    expect(result).toBeUndefined();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('handles null/undefined gracefully', () => {
    expect(safeCallback(null, [])).toBeUndefined();
    expect(safeCallback(undefined, [])).toBeUndefined();
  });
});
