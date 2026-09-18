import { describe, it, expect } from 'vitest';
import { usePopoverCacheQuery } from './usePopoverCacheQuery';

describe('usePopoverCacheQuery', () => {
  it('exports usePopoverCacheQuery hook function', () => {
    expect(typeof usePopoverCacheQuery).toBe('function');
  });

  it('validates state narrowing type guards conceptually', () => {
    type TestState = import('./usePopoverCacheQueryTypes').PopoverCacheQueryState<string>;
    const idleState: TestState = {
      status: 'idle',
      data: undefined,
      error: null,
      isStale: false,
      isLoading: false,
    };
    expect(idleState.status).toBe('idle');
    expect(idleState.data).toBeUndefined();

    const successState: TestState = {
      status: 'success',
      data: 'data-payload',
      error: null,
      isStale: false,
      isLoading: false,
    };
    if (successState.status === 'success') {
      const val: string = successState.data;
      expect(val).toBe('data-payload');
    }
  });
});
