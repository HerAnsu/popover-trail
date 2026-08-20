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
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
} from './storeSelectors';

describe('Pure Store State Selectors', () => {
  it('selects active trail and floating arrays correctly', () => {
    const store = createPopoverStore<unknown, unknown, string>(() => ({}));
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

  it('selects hierarchy path, breadcrumbs, parent, and children keys accurately', () => {
    const store = createPopoverStore<unknown, unknown, string>(() => ({}));
    const actions = store.getState().actions;

    actions.openRoot('owner-1', { key: 'root-node', isLoading: false, error: null });
    actions.pushNested(0, {
      key: 'child-node',
      parentKey: 'root-node',
      isLoading: false,
      error: null,
    });
    actions.pushNested(1, {
      key: 'leaf-node',
      parentKey: 'child-node',
      isLoading: false,
      error: null,
    });

    const state = store.getState();

    expect(selectParentKey('leaf-node')(state)).toBe('child-node');
    expect(selectParentKey('root-node')(state)).toBeUndefined();

    expect(selectChildrenKeys('root-node')(state)).toEqual(['child-node']);
    expect(selectChildrenKeys('child-node')(state)).toEqual(['leaf-node']);
    expect(selectChildrenKeys('leaf-node')(state)).toEqual([]);

    expect(selectBreadcrumbs('leaf-node')(state)).toEqual(['root-node', 'child-node', 'leaf-node']);
    expect(selectBreadcrumbs('child-node')(state)).toEqual(['root-node', 'child-node']);
    expect(selectBreadcrumbs('root-node')(state)).toEqual(['root-node']);
    expect(selectBreadcrumbs('non-existent')(state)).toEqual([]);

    expect(selectPopoverDepth('root-node')(state)).toBe(0);
    expect(selectPopoverDepth('child-node')(state)).toBe(1);
    expect(selectPopoverDepth('leaf-node')(state)).toBe(2);
  });

  it('selects pinned states and custom drag offsets correctly', () => {
    const store = createPopoverStore<unknown, unknown, string>(() => ({}));
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

  it('returns fallback empty values for unmapped popover keys', () => {
    const store = createPopoverStore<unknown, unknown, string>(() => ({}));
    const state = store.getState();

    expect(selectEntryByKey('missing')(state)).toBeUndefined();
    expect(selectTopmostEntry(state)).toBeUndefined();
    expect(selectIsPinned('missing')(state)).toBe(false);
    expect(selectOffset('missing')(state)).toEqual({ x: 0, y: 0 });
    expect(selectParentKey('missing')(state)).toBeUndefined();
    expect(selectChildrenKeys('missing')(state)).toEqual([]);
  });
});
