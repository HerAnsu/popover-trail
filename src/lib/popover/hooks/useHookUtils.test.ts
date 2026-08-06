import { describe, it, expect } from 'vitest';
import { useMergedRef, useStableCallback } from './useHookUtils';

describe('useHookUtils module', () => {
  it('exports useMergedRef and useStableCallback hook functions', () => {
    expect(typeof useMergedRef).toBe('function');
    expect(typeof useStableCallback).toBe('function');
  });
});
