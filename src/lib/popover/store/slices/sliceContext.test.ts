import { describe, it, expect } from 'vitest';
import { SliceContext } from './sliceContext';

describe('sliceContext interface', () => {
  it('defines the unified SliceContext container shape', () => {
    const mockCtx: SliceContext = {
      set: () => {},
      get: () => ({}) as unknown,
      deps: {} as unknown,
    };

    expect(mockCtx.set).toBeDefined();
    expect(mockCtx.get).toBeDefined();
    expect(mockCtx.deps).toBeDefined();
  });
});
