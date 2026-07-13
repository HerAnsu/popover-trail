import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from './store';
import type { TrailEntry } from './types';

// Mock DOMRect for the Node environment
if (typeof globalThis.DOMRect === 'undefined') {
  globalThis.DOMRect = class DOMRect {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    bottom: number;
    left: number;
    right: number;

    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.top = y;
      this.bottom = y + height;
      this.left = x;
      this.right = x + width;
    }
    static fromRect(other?: any) {
      return new DOMRect(other?.x, other?.y, other?.width, other?.height);
    }
  } as any;
}

describe('createPopoverStore', () => {
  const dummyResolver = vi.fn<(key: string) => any>().mockImplementation((key) => {
    return { title: `Resolved ${key}`, value: 42 };
  });

  it('should initialize with correct default state', () => {
    const store = createPopoverStore(dummyResolver);
    const state = store.getState();

    expect(state.trail).toEqual([]);
    expect(state.floating).toEqual([]);
    expect(state.ownerId).toBeNull();
    expect(state.offsets).toEqual({});
    expect(state.pinnedStates).toEqual({});
    expect(state.zIndexOrder).toEqual([]);
    expect(state.anchorElement).toBeNull();
    expect(state.anchorRect).toBeNull();
  });

  it('should open a root popover correctly', () => {
    const store = createPopoverStore(dummyResolver);
    const entry: TrailEntry = { key: 'root-item', isLoading: false };

    store.getState().openRoot('owner-1', entry);

    const state = store.getState();
    expect(state.ownerId).toBe('owner-1');
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].key).toBe('root-item');
    expect(state.zIndexOrder).toEqual(['root-item']);
  });

  it('should push a nested popover correctly', () => {
    const store = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };
    const childEntry: TrailEntry = { key: 'child-item', parentKey: 'root-item', isLoading: false };

    store.getState().openRoot('owner-1', rootEntry);
    store.getState().pushNested(0, childEntry);

    const state = store.getState();
    expect(state.trail).toHaveLength(2);
    expect(state.trail[0].key).toBe('root-item');
    expect(state.trail[1].key).toBe('child-item');
    expect(state.zIndexOrder).toEqual(['root-item', 'child-item']);
  });

  it('should close popovers starting from index correctly', () => {
    const store = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };
    const childEntry: TrailEntry = { key: 'child-item', parentKey: 'root-item', isLoading: false };

    store.getState().openRoot('owner-1', rootEntry);
    store.getState().pushNested(0, childEntry);

    // Close from index 1 (removes child-item)
    store.getState().closeFrom(1);

    const state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].key).toBe('root-item');
    expect(state.zIndexOrder).toEqual(['root-item']);
  });

  it('should toggle pinning state between trail and floating', () => {
    const store = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };

    store.getState().openRoot('owner-1', rootEntry);

    // Pin root popover
    store.getState().togglePin('root-item', new DOMRect(10, 20, 100, 200));

    const state = store.getState();
    expect(state.trail).toHaveLength(0);
    expect(state.floating).toHaveLength(1);
    expect(state.floating[0].key).toBe('root-item');
    expect(state.pinnedStates['root-item']).toBe(true);
    expect(state.floating[0].pinnedLayoutPos).toEqual({ top: 20, left: 10 });

    // Unpin root popover
    store.getState().togglePin('root-item');
    const nextState = store.getState();
    expect(nextState.floating).toHaveLength(0);
    expect(nextState.trail).toHaveLength(1);
    expect(nextState.trail[0].key).toBe('root-item');
    expect(nextState.pinnedStates['root-item']).toBe(false);
  });

  it('should clear all popovers on clear', () => {
    const store = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };

    store.getState().openRoot('owner-1', rootEntry);
    store.getState().clear();

    const state = store.getState();
    expect(state.trail).toEqual([]);
    expect(state.ownerId).toBeNull();
    expect(state.zIndexOrder).toEqual([]);
  });

  it('should ignore stale root hydration responses (prevent race conditions)', async () => {
    let resolveCallCount = 0;
    const delayResolver = async (_key: string) => {
      resolveCallCount++;
      const currentCall = resolveCallCount;
      const delayTime = currentCall === 1 ? 50 : 10;
      await new Promise((r) => setTimeout(r, delayTime));
      return { title: `Resolved Call ${currentCall}` };
    };

    const store = createPopoverStore(delayResolver);
    const mockButton1 = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200),
      } as any,
      stopPropagation: () => {},
    };
    const mockButton2 = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(30, 40, 100, 200),
      } as any,
      stopPropagation: () => {},
    };

    // Trigger first slow request
    const p1 = store.getState().openRootWithResolver('item-a', mockButton1, { ownerId: 'owner-1' });
    // Trigger second fast request
    const p2 = store.getState().openRootWithResolver('item-b', mockButton2, { ownerId: 'owner-2' });

    await Promise.all([p1, p2]);

    const state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].key).toBe('item-b');
    expect(state.trail[0].data?.title).toBe('Resolved Call 2');
  });

  it('should ignore stale nested hydration responses', async () => {
    let resolveCallCount = 0;
    const delayResolver = async (_key: string) => {
      resolveCallCount++;
      const currentCall = resolveCallCount;
      const delayTime = currentCall === 1 ? 50 : 10;
      await new Promise((r) => setTimeout(r, delayTime));
      return { title: `Nested Call ${currentCall}` };
    };

    const store = createPopoverStore(delayResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };
    store.getState().openRoot('owner-1', rootEntry);

    // Trigger nested slow call (parentKey: 'root-item')
    const p1 = store.getState().openNestedWithResolver('child-a', 'root-item');
    // Trigger nested fast call
    const p2 = store.getState().openNestedWithResolver('child-b', 'root-item');

    await Promise.all([p1, p2]);

    const state = store.getState();
    expect(state.trail).toHaveLength(2);
    expect(state.trail[1].key).toBe('child-b');
    expect(state.trail[1].data?.title).toBe('Nested Call 2');
  });

  it('should support retrying failed popover data resolution', async () => {
    let callCount = 0;
    const flakyResolver = async (_key: string) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network failure');
      }
      return { title: 'Success resolved data' };
    };

    const store = createPopoverStore(flakyResolver);
    const mockButton = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200),
      } as any,
      stopPropagation: () => {},
    };

    // First attempt fails
    await store.getState().openRootWithResolver('item-a', mockButton);

    let state = store.getState();
    expect(state.trail[0].error).toBeDefined();
    expect(state.trail[0].error?.message).toBe('Network failure');
    expect(state.trail[0].data).toBeUndefined();

    // Retry resolves successfully
    await store.getState().retryPopover('item-a');

    state = store.getState();
    expect(state.trail[0].error).toBeNull();
    expect(state.trail[0].data?.title).toBe('Success resolved data');
    expect(state.trail[0].isLoading).toBe(false);
  });

  it('should pass and abort AbortSignal on overlapping requests', async () => {
    const signals: AbortSignal[] = [];
    const resolver = async (
      _key: string,
      _parentData?: any,
      _context?: any,
      signal?: AbortSignal,
    ) => {
      if (signal) {
        signals.push(signal);
      }
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      });
      return { title: 'Resolved' };
    };

    const store = createPopoverStore(resolver);
    const mockButton1 = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200),
      } as any,
      stopPropagation: () => {},
    };
    const mockButton2 = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(30, 40, 100, 200),
      } as any,
      stopPropagation: () => {},
    };

    const p1 = store.getState().openRootWithResolver('item-a', mockButton1);
    const p2 = store.getState().openRootWithResolver('item-b', mockButton2);

    await Promise.all([p1, p2]);

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it('should preserve and restore originalParentKey and originalRect when pinning and unpinning', () => {
    const store = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = {
      key: 'root-item',
      rect: new DOMRect(10, 20, 100, 200),
      isLoading: false,
    };
    const childEntry: TrailEntry = {
      key: 'child-item',
      parentKey: 'root-item',
      rect: new DOMRect(30, 40, 100, 200),
      isLoading: false,
    };

    store.getState().openRoot('owner-1', rootEntry);
    store.getState().pushNested(0, childEntry);

    // Verify parentKey and rect are present
    let state = store.getState();
    expect(state.trail[1].key).toBe('child-item');
    expect(state.trail[1].parentKey).toBe('root-item');
    expect(state.trail[1].rect?.top).toBe(40);

    // Pin the child popover
    store.getState().togglePin('child-item', new DOMRect(500, 600, 150, 250));

    state = store.getState();
    const pinnedEntry = state.floating.find((e) => e.key === 'child-item');
    expect(pinnedEntry).toBeDefined();
    expect(pinnedEntry?.parentKey).toBeUndefined(); // Detached while pinned
    expect(pinnedEntry?.rect?.top).toBe(600); // Updated to card rect
    expect(pinnedEntry?.originalParentKey).toBe('root-item'); // Preserved
    expect(pinnedEntry?.originalRect?.top).toBe(40); // Preserved

    // Unpin the child popover
    store.getState().togglePin('child-item');

    state = store.getState();
    const restoredEntry = state.trail.find((e) => e.key === 'child-item');
    expect(restoredEntry).toBeDefined();
    expect(restoredEntry?.parentKey).toBe('root-item'); // Restored!
    expect(restoredEntry?.rect?.top).toBe(40); // Restored!
  });

  it('should NOT close pinned descendants by default when parent is closed, but should do so if configured', () => {
    // Case 1: Default behavior (do not close pinned descendants)
    const storeDefault = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };
    const childEntry: TrailEntry = { key: 'child-item', parentKey: 'root-item', isLoading: false };
    const grandchildEntry: TrailEntry = {
      key: 'grandchild-item',
      parentKey: 'child-item',
      isLoading: false,
    };

    storeDefault.getState().openRoot('owner-1', rootEntry);
    storeDefault.getState().pushNested(0, childEntry);
    storeDefault.getState().pushNested(1, grandchildEntry);

    // Pin grandchild
    storeDefault.getState().togglePin('grandchild-item', new DOMRect(500, 600, 150, 250));

    let state = storeDefault.getState();
    expect(state.trail).toHaveLength(2); // root, child
    expect(state.floating).toHaveLength(1); // grandchild

    // Close child-item
    storeDefault.getState().closeFrom(2);

    state = storeDefault.getState();
    expect(state.trail).toHaveLength(1); // root remains
    expect(state.floating).toHaveLength(1); // grandchild remains open because it's pinned!

    // Case 2: Configured behavior (close pinned descendants)
    const storeClose = createPopoverStore(dummyResolver);
    storeClose.getState().setClosePinnedDescendants(true);
    storeClose.getState().openRoot('owner-1', rootEntry);
    storeClose.getState().pushNested(0, childEntry);
    storeClose.getState().pushNested(1, grandchildEntry);

    // Pin grandchild
    storeClose.getState().togglePin('grandchild-item', new DOMRect(500, 600, 150, 250));

    // Close child-item
    storeClose.getState().closeFrom(2);

    state = storeClose.getState();
    expect(state.trail).toHaveLength(1); // root remains
    expect(state.floating).toHaveLength(0); // grandchild is recursively closed!
  });

  it('should instantly resolve popover data synchronously without setting isLoading: true', async () => {
    const syncResolver = (key: string) => {
      return { title: `Sync Data for ${key}` };
    };

    const store = createPopoverStore(syncResolver);
    const mockButton = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200),
      } as any,
      stopPropagation: () => {},
    };

    // Open root popover
    const promise = store
      .getState()
      .openRootWithResolver('item-sync', mockButton, { ownerId: 'owner-1' });
    // Ensure it resolves immediately in the same callstack before awaiting anything
    let state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].key).toBe('item-sync');
    expect(state.trail[0].isLoading).toBe(false); // No loading state!
    expect(state.trail[0].data).toEqual({ title: 'Sync Data for item-sync' });

    // Open nested popover
    const nestedPromise = store.getState().openNestedWithResolver('item-nested', 'item-sync');
    state = store.getState();
    expect(state.trail).toHaveLength(2);
    expect(state.trail[1].key).toBe('item-nested');
    expect(state.trail[1].isLoading).toBe(false); // No loading state!
    expect(state.trail[1].data).toEqual({ title: 'Sync Data for item-nested' });

    // Await promises to satisfy linting/async calls
    await promise;
    await nestedPromise;
  });

  it('should integrate with cache provider and retrieve synchronous/asynchronous values', async () => {
    // 1. Setup a custom synchronous cache using Map
    const cacheMap = new Map<string, any>();
    const syncCache = {
      get: (key: string) => cacheMap.get(key),
      set: (key: string, val: any) => {
        cacheMap.set(key, val);
      },
      delete: (key: string) => {
        cacheMap.delete(key);
      },
      clear: () => {
        cacheMap.clear();
      },
    };

    cacheMap.set('root-cached', { data: 'Pre-resolved cache payload' });

    let resolverCalls = 0;
    const resolver = (key: string) => {
      resolverCalls++;
      return { data: `Resolved payload for ${key}` };
    };

    const store = createPopoverStore(resolver, undefined, syncCache);
    const mockButton = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200),
      } as any,
      stopPropagation: () => {},
    };

    // Open popover using cached data
    const promise1 = store.getState().openRootWithResolver('root-cached', mockButton);
    let state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].isLoading).toBe(false); // Instantly loaded from cache!
    expect(state.trail[0].data).toEqual({ data: 'Pre-resolved cache payload' });
    expect(resolverCalls).toBe(0); // Resolver was never called!

    // Clear the store to reset trail for next root popover test
    store.getState().clear();

    // Open popover NOT in cache
    const promise2 = store.getState().openRootWithResolver('root-uncached', mockButton);
    state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].key).toBe('root-uncached');
    expect(state.trail[0].data).toEqual({ data: 'Resolved payload for root-uncached' });
    expect(resolverCalls).toBe(1); // Resolver called once!

    // Verify cache has been populated with the new resolved value
    expect(cacheMap.get('root-uncached')).toEqual({ data: 'Resolved payload for root-uncached' });

    await promise1;
    await promise2;
  });

  it('should preserve collision configurations on TrailEntry and support merging them', () => {
    const store = createPopoverStore(dummyResolver);
    const mockButton = {
      currentTarget: {
        getBoundingClientRect: () => new DOMRect(10, 20, 100, 200),
      } as any,
      stopPropagation: () => {},
    };

    const localCollision = { padding: 45 };

    // Set collision config dynamically via open options
    store.getState().openRootWithResolver('item-col', mockButton, {
      collision: localCollision,
    });

    const state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].collision).toEqual(localCollision);
  });

  it('should close popover by key and clean up descendants without closing unrelated siblings', () => {
    const store = createPopoverStore(dummyResolver);
    store.getState().setClosePinnedDescendants(true);

    const rootEntry: TrailEntry = { key: 'root-item' };
    const child1Entry: TrailEntry = { key: 'child-1', parentKey: 'root-item' };
    const child2Entry: TrailEntry = { key: 'child-2', parentKey: 'root-item' };
    const grandchildEntry: TrailEntry = { key: 'grandchild', parentKey: 'child-1' };

    store.getState().openRoot('owner-1', rootEntry);
    store.getState().pushNested(0, child1Entry);

    // Pin child-1
    store.getState().togglePin('child-1', new DOMRect(100, 200, 150, 250));

    // Push grandchild from child-1 (index 0 in floating)
    store.getState().pushNested(0, grandchildEntry);

    // Pin grandchild
    store.getState().togglePin('grandchild', new DOMRect(150, 250, 150, 250));

    // Open a new root under a different owner (child-2)
    store.getState().openRoot('owner-2', child2Entry);

    // We expect:
    // trail: [child-2] (length 1)
    // floating: [child-1, grandchild] (length 2)
    let state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.floating).toHaveLength(2);

    // Now let's close child-1 via closeByKey
    store.getState().closeByKey('child-1');

    state = store.getState();
    // child-1 and its descendant grandchild are closed
    expect(state.floating).toHaveLength(0);
    // child-2 remains in the trail completely untouched!
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0].key).toBe('child-2');
  });
});
