import { describe, expect, it } from 'vitest';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('SliceContext interface', () => {
  it('defines the unified SliceContext container shape', () => {
    const mockCtx = createMockSliceContext();

    expect(mockCtx.set).toBeDefined();
    expect(mockCtx.get).toBeDefined();
    expect(mockCtx.deps).toBeDefined();
  });
});
