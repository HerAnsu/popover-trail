import { describe, it, expect } from 'vitest';
import { openRootState, pushNestedState } from './openReducers';
import type { PopoverStateData, TrailEntry } from '../../types';
import { createMockStoreState } from '../../testing/createMockStoreState';

describe('openReducers module', () => {
  const createMockState = (
    overrides?: Partial<PopoverStateData<unknown, unknown>>,
  ): PopoverStateData<unknown, unknown> =>
    createMockStoreState<unknown, unknown>({
      ownerId: 'owner-1',
      floating: [],
      trail: [{ key: 'root-1', isLoading: false, error: null }],
      pinnedStates: {},
      offsets: {},
      zIndexOrder: ['root-1'],
      ...overrides,
    });

  it('opens a new root popover for the same owner', () => {
    const state = createMockState();
    const newEntry: TrailEntry<unknown> = { key: 'root-2', isLoading: false, error: null };

    const result = openRootState(state, 'owner-1', newEntry);

    expect(result.ownerId).toBe('owner-1');
    expect(result.trail).toHaveLength(2);
    expect(result.trail?.[1]?.key).toBe('root-2');
  });

  it('replaces trail when opening root popover for a different owner', () => {
    const state = createMockState();
    const newEntry: TrailEntry<unknown> = { key: 'new-root', isLoading: false, error: null };

    const result = openRootState(state, 'owner-2', newEntry);

    expect(result.ownerId).toBe('owner-2');
    expect(result.trail).toHaveLength(1);
    expect(result.trail?.[0]?.key).toBe('new-root');
  });

  it('brings floating card to front if key already exists in floating', () => {
    const state = createMockState({
      floating: [{ key: 'pinned-1', isLoading: false, error: null }],
      pinnedStates: { 'pinned-1': true },
      zIndexOrder: ['pinned-1', 'root-1'],
    });

    const result = openRootState(state, 'owner-1', {
      key: 'pinned-1',
      isLoading: false,
      error: null,
    });
    expect(result.zIndexOrder).toEqual(['root-1', 'pinned-1']);
  });

  it('pushes nested popover into trail path', () => {
    const state = createMockState();
    const nestedEntry: TrailEntry<unknown> = {
      key: 'nested-1',
      parentKey: 'root-1',
      isLoading: false,
      error: null,
    };

    const result = pushNestedState(state, 0, nestedEntry);

    expect(result.trail).toHaveLength(2);
    expect(result.trail?.[1]?.key).toBe('nested-1');
  });

  it('moves existing trail key to top of trail when re-opened', () => {
    const state = createMockState({
      trail: [
        { key: 'root-1', isLoading: false, error: null },
        { key: 'child-1', isLoading: false, error: null },
        { key: 'child-2', isLoading: false, error: null },
      ],
      zIndexOrder: ['root-1', 'child-1', 'child-2'],
    });

    // Re-open child-1
    const result = openRootState(state, 'owner-1', {
      key: 'child-1',
      isLoading: false,
      error: null,
    });

    expect(result.trail).toHaveLength(3);
    expect(result.trail?.map((e) => e.key)).toEqual(['root-1', 'child-2', 'child-1']);
  });

  it('returns empty object when pushNestedState is called with negative parent index', () => {
    const state = createMockState();
    const nestedEntry: TrailEntry<unknown> = {
      key: 'nested-1',
      parentKey: 'root-1',
      isLoading: false,
      error: null,
    };

    const result = pushNestedState(state, -1, nestedEntry);
    expect(result).toEqual({});
  });

  it('brings pinned floating card to top of zIndexOrder when pushNestedState is called with pinned key', () => {
    const state = createMockState({
      floating: [{ key: 'pinned-child', isLoading: false, error: null }],
      pinnedStates: { 'pinned-child': true },
      zIndexOrder: ['pinned-child', 'root-1'],
    });

    const result = pushNestedState(state, 0, {
      key: 'pinned-child',
      parentKey: 'root-1',
      isLoading: false,
      error: null,
    });
    expect(result.zIndexOrder).toEqual(['root-1', 'pinned-child']);
  });
});
