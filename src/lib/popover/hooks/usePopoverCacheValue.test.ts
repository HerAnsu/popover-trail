import { describe, it, expect } from 'vitest';
import { usePopoverCacheValue } from './usePopoverCacheValue';

describe('usePopoverCacheValue hook', () => {
  it('exports usePopoverCacheValue hook function', () => {
    expect(typeof usePopoverCacheValue).toBe('function');
  });
});
