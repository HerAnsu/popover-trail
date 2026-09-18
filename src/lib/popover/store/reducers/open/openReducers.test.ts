import { describe, it, expect } from 'vitest';
import { openRootState, pushNestedState, pushNestedByKeyState } from './index';
import { createMockStoreState } from '../../../testing/createMockStoreState';

describe('openReducers module', () => {
  it('opens root popover replacing trail when owner matches', () => {
    const state = createMockStoreState({
      ownerId: 'owner-1',
      trail: [{ key: 'root-1', isLoading: false }],
    });

    const patch = openRootState(state, 'owner-1', { key: 'root-2', isLoading: false });
    expect(patch.trail).toHaveLength(2);
    expect(patch.ownerId).toBe('owner-1');
  });

  it('elevates floating entry if opened as root', () => {
    const state = createMockStoreState({
      floating: [{ key: 'float-1', isLoading: false }],
      zIndexOrder: ['float-1', 'other'],
    });

    const patch = openRootState(state, 'root', { key: 'float-1', isLoading: false });
    expect(patch.trail).toBeUndefined();
    expect(patch.zIndexOrder).toBeDefined();
  });

  it('pushes nested popover under parent index', () => {
    const state = createMockStoreState({
      trail: [{ key: 'root-1', isLoading: false }],
    });
    const patch = pushNestedState(state, 0, { key: 'child-1', isLoading: false });
    expect(patch.trail).toHaveLength(2);
    expect(patch.trail?.[1]?.key).toBe('child-1');
  });

  it('pushes nested popover by parent key', () => {
    const state = createMockStoreState({
      trail: [{ key: 'root-1', isLoading: false }],
    });
    const patch = pushNestedByKeyState(state, 'root-1', { key: 'child-1', isLoading: false });
    expect(patch.trail).toHaveLength(2);
    expect(patch.trail?.[1]?.key).toBe('child-1');
  });
});
