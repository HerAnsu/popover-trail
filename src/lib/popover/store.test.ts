import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from './store';
import type { TrailEntry, AnchorEventLike } from './types';
import { SimplePopoverCache } from './utils/cache';

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
    static fromRect(other?: { x?: number; y?: number; width?: number; height?: number }) {
      return new DOMRect(other?.x, other?.y, other?.width, other?.height);
    }
  } as unknown as typeof globalThis.DOMRect;
}

const createMockAnchor = (x = 10, y = 20, width = 100, height = 200): AnchorEventLike => ({
  currentTarget: {
    getBoundingClientRect: () => new DOMRect(x, y, width, height),
  } as HTMLElement,
  stopPropagation: () => {},
});

describe('createPopoverStore', () => {
  const dummyResolver = vi.fn<(key: string) => unknown>().mockImplementation((key) => {
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
    expect(state.trail[0]?.key).toBe('root-item');
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
    expect(state.trail[0]?.key).toBe('root-item');
    expect(state.trail[1]?.key).toBe('child-item');
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
    expect(state.trail[0]?.key).toBe('root-item');
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
    expect(state.floating[0]?.key).toBe('root-item');
    expect(state.pinnedStates['root-item']).toBe(true);
    expect(state.floating[0]?.pinnedLayoutPos).toEqual({ top: 20, left: 10 });

    // Unpin root popover
    store.getState().togglePin('root-item');
    const nextState = store.getState();
    expect(nextState.floating).toHaveLength(0);
    expect(nextState.trail).toHaveLength(1);
    expect(nextState.trail[0]?.key).toBe('root-item');
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
    const mockButton1 = createMockAnchor(10, 20, 100, 200);
    const mockButton2 = createMockAnchor(30, 40, 100, 200);

    // Trigger first slow request
    const p1 = store.getState().openRootWithResolver('item-a', mockButton1, { ownerId: 'owner-1' });
    // Trigger second fast request
    const p2 = store.getState().openRootWithResolver('item-b', mockButton2, { ownerId: 'owner-2' });

    await Promise.all([p1, p2]);

    const state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0]?.key).toBe('item-b');
    expect(state.trail[0]?.data?.title).toBe('Resolved Call 2');
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
    const rootEntry = { key: 'root-item', isLoading: false };
    store.getState().openRoot('owner-1', rootEntry);

    // Trigger nested slow call (parentKey: 'root-item')
    const p1 = store.getState().openNestedWithResolver('child-a', 'root-item');
    // Trigger nested fast call
    const p2 = store.getState().openNestedWithResolver('child-b', 'root-item');

    await Promise.all([p1, p2]);

    const state = store.getState();
    expect(state.trail).toHaveLength(2);
    expect(state.trail[1]?.key).toBe('child-b');
    expect(state.trail[1]?.data?.title).toBe('Nested Call 2');
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
    const mockButton = createMockAnchor(10, 20, 100, 200);

    // First attempt fails
    await store.getState().openRootWithResolver('item-a', mockButton);

    let state = store.getState();
    expect(state.trail[0]?.error).toBeDefined();
    expect(state.trail[0]?.error?.message).toBe('Network failure');
    expect(state.trail[0]?.data).toBeUndefined();

    // Retry resolves successfully
    await store.getState().retryPopover('item-a');

    state = store.getState();
    expect(state.trail[0]?.error).toBeNull();
    expect(state.trail[0]?.data?.title).toBe('Success resolved data');
    expect(state.trail[0]?.isLoading).toBe(false);
  });

  it('should pass and abort AbortSignal on overlapping requests', async () => {
    const signals: AbortSignal[] = [];
    const resolver = async (
      _key: string,
      _parentData?: unknown,
      _context?: unknown,
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
    const mockButton1 = createMockAnchor(10, 20, 100, 200);
    const mockButton2 = createMockAnchor(30, 40, 100, 200);

    const p1 = store.getState().openRootWithResolver('item-a', mockButton1);
    const p2 = store.getState().openRootWithResolver('item-b', mockButton2);

    await Promise.all([p1, p2]);

    expect(signals).toHaveLength(2);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
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
    expect(state.trail[1]?.key).toBe('child-item');
    expect(state.trail[1]?.parentKey).toBe('root-item');
    expect(state.trail[1]?.rect?.top).toBe(40);

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
    const mockButton = createMockAnchor(10, 20, 100, 200);

    // Open root popover
    const promise = store
      .getState()
      .openRootWithResolver('item-sync', mockButton, { ownerId: 'owner-1' });
    // Ensure it resolves immediately in the same callstack before awaiting anything
    let state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0]?.key).toBe('item-sync');
    expect(state.trail[0]?.isLoading).toBe(false); // No loading state!
    expect(state.trail[0]?.data).toEqual({ title: 'Sync Data for item-sync' });

    // Open nested popover
    const nestedPromise = store.getState().openNestedWithResolver('item-nested', 'item-sync');
    state = store.getState();
    expect(state.trail).toHaveLength(2);
    expect(state.trail[1]?.key).toBe('item-nested');
    expect(state.trail[1]?.isLoading).toBe(false); // No loading state!
    expect(state.trail[1]?.data).toEqual({ title: 'Sync Data for item-nested' });

    // Await promises to satisfy linting/async calls
    await promise;
    await nestedPromise;
  });

  it('should integrate with cache provider and retrieve synchronous/asynchronous values', async () => {
    // 1. Setup a custom synchronous cache using Map
    const cacheMap = new Map<string, unknown>();
    const syncCache = {
      get: (key: string) => cacheMap.get(key),
      set: (key: string, val: unknown) => {
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
    const mockButton = createMockAnchor(10, 20, 100, 200);

    // Open popover using cached data
    const promise1 = store.getState().openRootWithResolver('root-cached', mockButton);
    let state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0]?.isLoading).toBe(false); // Instantly loaded from cache!
    expect(state.trail[0]?.data).toEqual({ data: 'Pre-resolved cache payload' });
    expect(resolverCalls).toBe(0); // Resolver was never called!

    // Clear the store to reset trail for next root popover test
    store.getState().clear();

    // Open popover NOT in cache
    const promise2 = store.getState().openRootWithResolver('root-uncached', mockButton);
    state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0]?.key).toBe('root-uncached');
    expect(state.trail[0]?.data).toEqual({ data: 'Resolved payload for root-uncached' });
    expect(resolverCalls).toBe(1); // Resolver called once!

    // Verify cache has been populated with the new resolved value
    expect(cacheMap.get('root-uncached')).toEqual({ data: 'Resolved payload for root-uncached' });

    await promise1;
    await promise2;
  });

  it('should preserve collision configurations on TrailEntry and support merging them', () => {
    const store = createPopoverStore(dummyResolver);
    const mockButton = createMockAnchor(10, 20, 100, 200);

    const localCollision = { padding: 45 };

    // Set collision config dynamically via open options
    store.getState().openRootWithResolver('item-col', mockButton, {
      collision: localCollision,
    });

    const state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0]?.collision).toEqual(localCollision);
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
    expect(state.trail[0]?.key).toBe('child-2');
  });

  it('should support TTL expiration and cleanup in SimplePopoverCache', async () => {
    const cache = new SimplePopoverCache<{ name: string }>(100); // 100ms TTL
    cache.set('item-1', { name: 'Expiring Item' });

    // Retrieve active item
    expect(cache.get('item-1')).toEqual({ name: 'Expiring Item' });

    // Wait for TTL expiration
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Retrieve expired item (should trigger cleanup and return undefined)
    expect(cache.get('item-1')).toBeUndefined();
  });

  it('should successfully resolve data when a popover is pinned while loading', async () => {
    let resolvePromise!: (val: unknown) => void;
    const asyncPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const resolver = async () => {
      await asyncPromise;
      return 'async payload';
    };

    const store = createPopoverStore(resolver);
    const mockButton = createMockAnchor(0, 0, 100, 100);

    // Trigger root loading
    const loadPromise = store.getState().openRootWithResolver('async-popover', mockButton);

    // Verify it is loading in the trail
    let state = store.getState();
    expect(state.trail).toHaveLength(1);
    expect(state.trail[0]?.isLoading).toBe(true);

    // Pin it immediately while loading is in progress
    store.getState().togglePin('async-popover', new DOMRect(50, 50, 100, 100));

    // Verify it moved to floating but remains isLoading: true
    state = store.getState();
    expect(state.trail).toHaveLength(0);
    expect(state.floating).toHaveLength(1);
    expect(state.floating[0]?.isLoading).toBe(true);

    // Finish resolving the data
    resolvePromise('Async Loaded Data');
    await loadPromise;

    // Verify the pinned/floating element got resolved successfully!
    state = store.getState();
    expect(state.floating).toHaveLength(1);
    expect(state.floating[0]?.isLoading).toBe(false);
    expect(state.floating[0]?.data).toBe('async payload');
  });

  it('should support hover timers, buffers, and clear parent timers on child hoverEnter', async () => {
    const store = createPopoverStore(dummyResolver);
    const rootEntry: TrailEntry = { key: 'root-item', isLoading: false };
    const childEntry: TrailEntry = { key: 'child-item', parentKey: 'root-item', isLoading: false };

    store.getState().openRoot('owner-1', rootEntry);
    store.getState().pushNested(0, childEntry);

    let state = store.getState();
    expect(state.trail).toHaveLength(2);

    // Call hoverLeave on child-item with a short delay of 50ms
    store.getState().hoverLeave('child-item', 50);

    // Call hoverLeave on root-item with a delay of 50ms
    store.getState().hoverLeave('root-item', 50);

    // Immediate state: both should still be active
    state = store.getState();
    expect(state.trail).toHaveLength(2);

    // Call hoverEnter on child-item: this should clear its timer AND its parent (root-item) timer!
    store.getState().hoverEnter('child-item');

    // Wait 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify both are still open!
    state = store.getState();
    expect(state.trail).toHaveLength(2);

    // Now call hoverLeave on child-item again, but don't enter. Let it expire.
    store.getState().hoverLeave('child-item', 30);

    // Wait 60ms
    await new Promise((resolve) => setTimeout(resolve, 60));

    // child-item should now be closed!
    state = store.getState();
    expect(state.trail.find((t) => t.key === 'child-item')).toBeUndefined();
  });

  it('should support cascadeOffsetStep configuration and custom trigger options', async () => {
    const store = createPopoverStore(dummyResolver);
    expect(store.getState().cascadeOffsetStep).toBe(8);

    // Set custom cascadeOffsetStep
    store.getState().setCascadeOffsetStep(15);
    expect(store.getState().cascadeOffsetStep).toBe(15);

    // Trigger open with allowDragWhenUnpinned and ariaDescribedby
    const mockElement = createMockAnchor(0, 0, 100, 40);

    await store.getState().openRootWithResolver('item-1', mockElement, {
      allowDragWhenUnpinned: true,
      ariaDescribedby: 'Descriptor text',
    });

    const entry = store.getState().trail[0];
    expect(entry?.allowDragWhenUnpinned).toBe(true);
    expect(entry?.ariaDescribedby).toBe('Descriptor text');
  });

  it('should support hover options including delays and closeOnMouseLeave', async () => {
    const store = createPopoverStore(dummyResolver);
    const mockElement = createMockAnchor(0, 0, 100, 40);

    await store.getState().openRootWithResolver('item-1', mockElement, {
      hover: {
        enabled: true,
        openDelay: 150,
        closeDelay: 250,
        closeOnMouseLeave: false,
      },
    });

    const entry = store.getState().trail[0];
    expect(entry?.hover?.enabled).toBe(true);
    expect(entry?.hover?.openDelay).toBe(150);
    expect(entry?.hover?.closeDelay).toBe(250);
    expect(entry?.hover?.closeOnMouseLeave).toBe(false);
  });

  it('should preserve all display options when retrying a popover', async () => {
    let failFirst = true;
    const failingResolver = vi.fn().mockImplementation(async (_key: string) => {
      if (failFirst) {
        failFirst = false;
        throw new Error('Resolver failed');
      }
      return { title: 'Success' };
    });

    const store = createPopoverStore(failingResolver);
    const mockElement = createMockAnchor(0, 0, 100, 40);

    const fullOptions = {
      placement: 'top-start' as const,
      offset: 12,
      exitTransitionDuration: 300,
      baseZIndex: 2000,
      cascadeOffsetStep: 16,
      cascadeOffsetDirection: 'right' as const,
      enableTilt: true,
      maxTiltAngle: 15,
      tiltSensitivity: 2,
      dragAxis: 'x' as const,
      tiltFriction: 0.9,
      tiltDecay: 0.8,
      mountingClassName: 'custom-mount',
      unmountingClassName: 'custom-unmount',
      mountedClassName: 'custom-mounted',
      allowDragWhenUnpinned: true,
      ariaDescribedby: 'desc-id',
    };

    await store.getState().openRootWithResolver('retry-item', mockElement, fullOptions);

    expect(store.getState().trail[0]?.error).not.toBeNull();
    expect(store.getState().trail[0]?.placement).toBe('top-start');

    // Retry popover resolution
    await store.getState().retryPopover('retry-item');

    const retriedEntry = store.getState().trail[0];
    expect(retriedEntry?.error).toBeNull();
    expect(retriedEntry?.data).toEqual({ title: 'Success' });
    expect(retriedEntry?.placement).toBe('top-start');
    expect(retriedEntry?.offset).toBe(12);
    expect(retriedEntry?.exitTransitionDuration).toBe(300);
    expect(retriedEntry?.baseZIndex).toBe(2000);
    expect(retriedEntry?.cascadeOffsetStep).toBe(16);
    expect(retriedEntry?.cascadeOffsetDirection).toBe('right');
    expect(retriedEntry?.enableTilt).toBe(true);
    expect(retriedEntry?.maxTiltAngle).toBe(15);
    expect(retriedEntry?.tiltSensitivity).toBe(2);
    expect(retriedEntry?.dragAxis).toBe('x');
    expect(retriedEntry?.tiltFriction).toBe(0.9);
    expect(retriedEntry?.tiltDecay).toBe(0.8);
    expect(retriedEntry?.mountingClassName).toBe('custom-mount');
    expect(retriedEntry?.unmountingClassName).toBe('custom-unmount');
    expect(retriedEntry?.mountedClassName).toBe('custom-mounted');
    expect(retriedEntry?.allowDragWhenUnpinned).toBe(true);
    expect(retriedEntry?.ariaDescribedby).toBe('desc-id');
  });

  describe('SimplePopoverCache enhancements', () => {
    it('should evict oldest item when exceeding maxSize', () => {
      const cache = new SimplePopoverCache<number>(10000, 2);
      cache.set('key1', 1);
      cache.set('key2', 2);
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);

      // Third insertion should evict key1 (FIFO)
      cache.set('key3', 3);
      expect(cache.has('key1')).toBe(false);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
    });

    it('should correctly support has() without deleting non-expired entries', () => {
      const cache = new SimplePopoverCache<string>(1000);
      cache.set('valid', 'value');
      expect(cache.has('valid')).toBe(true);
      expect(cache.get('valid')).toBe('value');
    });
  });
});
