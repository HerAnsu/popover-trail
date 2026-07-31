import { describe, it, expect } from 'vitest';
import { createPopoverStore } from '../store';
import {
  selectActiveTrail,
  selectFloatingEntries,
  selectEntryByKey,
  selectTopmostEntry,
  selectIsPinned,
  selectOffset,
  selectZIndexOrder,
  selectTotalActiveCount,
  selectIsIdle,
  selectHasEntry,
} from './storeSelectors';

describe('Pure Store State Selectors', () => {
  it('selects active trail and floating arrays correctly', () => {
    const store = createPopoverStore();
    expect(selectIsIdle(store.getState())).toBe(true);
    expect(selectTotalActiveCount(store.getState())).toBe(0);

    store
      .getState()
      .openRoot('owner-1', { key: 'card-1', status: 'success', isLoading: false, error: null });
    const state = store.getState();

    expect(selectIsIdle(state)).toBe(false);
    expect(selectTotalActiveCount(state)).toBe(1);
    expect(selectActiveTrail(state)).toHaveLength(1);
    expect(selectFloatingEntries(state)).toHaveLength(0);
    expect(selectHasEntry('card-1')(state)).toBe(true);
    expect(selectHasEntry('non-existent')(state)).toBe(false);
    expect(selectEntryByKey('card-1')(state)?.key).toBe('card-1');
    expect(selectTopmostEntry(state)?.key).toBe('card-1');
    expect(selectIsPinned('card-1')(state)).toBe(false);
    expect(selectOffset('card-1')(state)).toEqual({ x: 0, y: 0 });
    expect(selectZIndexOrder(state)).toEqual(['card-1']);
  });

  it('selects pinned states and custom drag offsets correctly', () => {
    const store = createPopoverStore();
    store
      .getState()
      .openRoot('owner-1', { key: 'card-1', status: 'success', isLoading: false, error: null });
    store.getState().togglePin('card-1');
    store.getState().updateOffset('card-1', 45, 90);

    const state = store.getState();

    expect(selectIsPinned('card-1')(state)).toBe(true);
    expect(selectFloatingEntries(state)).toHaveLength(1);
    expect(selectActiveTrail(state)).toHaveLength(0);
    expect(selectOffset('card-1')(state)).toEqual({ x: 45, y: 90 });
  });
});
