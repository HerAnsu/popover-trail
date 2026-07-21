import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from './store';
import type { TrailEntry, AnchorEventLike } from './types';
import {
  isResolvedEntry,
  isLoadingEntry,
  isErrorEntry,
  getEntryState,
  createPopoverKey,
  createPopoverResolver,
} from './types';
import { SimplePopoverCache } from './utils/cache';
import { createWorkerResolver } from './utils/workerResolver';

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
    const failingResolver = vi
      .fn<(key: string) => Promise<{ title: string }>>()
      .mockImplementation(async (_key: string) => {
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

  describe('simplePopoverCache enhancements', () => {
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

  describe('Refactored store enhancements & edge cases', () => {
    it('should validate isResolvedEntry correctly for synchronous data resolution', async () => {
      const syncResolver = (key: string) => ({ name: `Data for ${key}` });
      const store = createPopoverStore(syncResolver);
      const mockButton = createMockAnchor(0, 0, 100, 100);

      await store.getState().openRootWithResolver('sync-item', mockButton);
      const entry = store.getState().trail[0];

      expect(entry?.error).toBeNull();
      expect(isResolvedEntry(entry)).toBe(true);
    });

    it('should prevent duplicate keys in trail on repeated openRoot or pushNested calls', () => {
      const store = createPopoverStore(dummyResolver);
      const entry1: TrailEntry = { key: 'item-1', isLoading: false };
      const entry2: TrailEntry = { key: 'item-2', isLoading: false };

      store.getState().openRoot('owner-1', entry1);
      store.getState().pushNested(0, entry2);
      expect(store.getState().trail.map((e) => e.key)).toEqual(['item-1', 'item-2']);

      // Re-push item-1 as nested
      store.getState().pushNested(1, entry1);
      expect(store.getState().trail.map((e) => e.key)).toEqual(['item-2', 'item-1']);

      // Re-open item-2 as root
      store.getState().openRoot('owner-1', entry2);
      expect(store.getState().trail.map((e) => e.key)).toEqual(['item-1', 'item-2']);
    });

    it('should bring floating descendants to front when parent bringToFront is called', () => {
      const store = createPopoverStore(dummyResolver);
      const parent: TrailEntry = { key: 'parent', isLoading: false };
      const child: TrailEntry = { key: 'child', parentKey: 'parent', isLoading: false };
      const grandchild: TrailEntry = { key: 'grandchild', parentKey: 'child', isLoading: false };

      store.getState().openRoot('owner-1', parent);
      store.getState().pushNested(0, child);
      store.getState().pushNested(1, grandchild);

      // Pin child and grandchild
      store.getState().togglePin('child', new DOMRect(10, 10, 100, 100));
      store.getState().togglePin('grandchild', new DOMRect(20, 20, 100, 100));

      // Bring parent to front
      store.getState().bringToFront('parent');

      const state = store.getState();
      expect(state.zIndexOrder.indexOf('parent')).toBeLessThan(state.zIndexOrder.indexOf('child'));
      expect(state.zIndexOrder.indexOf('child')).toBeLessThan(
        state.zIndexOrder.indexOf('grandchild'),
      );
    });

    it('should navigate parent linkages through originalParentKey on hoverEnter for pinned cards', () => {
      const store = createPopoverStore(dummyResolver);
      const parent: TrailEntry = { key: 'parent', isLoading: false };
      const child: TrailEntry = { key: 'child', parentKey: 'parent', isLoading: false };

      store.getState().openRoot('owner-1', parent);
      store.getState().pushNested(0, child);

      // Pin parent card
      store.getState().togglePin('parent', new DOMRect(10, 10, 100, 100));

      // Trigger hoverLeave on child and parent
      store.getState().hoverLeave('child', 100);
      store.getState().hoverLeave('parent', 100);

      // Trigger hoverEnter on child: should clear timer for child AND pinned parent!
      store.getState().hoverEnter('child');
    });

    it('should bring pinned child popover to front when openNestedWithResolver is called again', async () => {
      const store = createPopoverStore(dummyResolver);
      const parent: TrailEntry = { key: 'parent', isLoading: false };
      const child: TrailEntry = { key: 'child', parentKey: 'parent', isLoading: false };

      store.getState().openRoot('owner-1', parent);
      store.getState().pushNested(0, child);

      // Pin child
      store.getState().togglePin('child', new DOMRect(10, 10, 100, 100));

      // Call openNestedWithResolver for child from parent again
      await store.getState().openNestedWithResolver('child', 'parent');

      const state = store.getState();
      expect(state.floating).toHaveLength(1);
      expect(state.floating[0]?.key).toBe('child');
      expect(state.zIndexOrder[state.zIndexOrder.length - 1]).toBe('child');
    });

    it('should cancel exit transition timers when resetStoreState / clear / destroy is called', async () => {
      const store = createPopoverStore(dummyResolver);
      const entry: TrailEntry = {
        key: 'item-trans',
        exitTransitionDuration: 200,
        isLoading: false,
      };

      store.getState().openRoot('owner-1', entry);
      store.getState().closeByKey('item-trans', { transition: true });

      expect(store.getState().trail[0]?.transitionStatus).toBe('unmounting');

      // Clear store before transition duration finishes
      store.getState().clear();

      expect(store.getState().trail).toEqual([]);

      // Wait for exit transition timeout
      await new Promise((r) => setTimeout(r, 250));

      // Verify store state remains empty clean
      expect(store.getState().trail).toEqual([]);
      expect(store.getState().floating).toEqual([]);
    });

    it('should correctly pass parentData when retryPopover is called on a pinned popover card', async () => {
      const resolver = async (key: string, parentData?: unknown) => {
        if (key === 'pinned-child' && parentData) {
          return { data: `Resolved with parent payload: ${JSON.stringify(parentData)}` };
        }
        if (key === 'pinned-child' && !parentData) {
          throw new Error('Missing parent data!');
        }
        return { data: `Parent payload for ${key}` };
      };

      const store = createPopoverStore(resolver);
      const parent: TrailEntry = {
        key: 'parent',
        data: { title: 'Parent Data Payload' },
        isLoading: false,
      };
      const child: TrailEntry = {
        key: 'pinned-child',
        parentKey: 'parent',
        error: new Error('Failed initial load'),
        isLoading: false,
      };

      store.getState().openRoot('owner-1', parent);
      store.getState().pushNested(0, child);

      // Pin child
      store.getState().togglePin('pinned-child', new DOMRect(10, 10, 100, 100));

      // Retry pinned child
      await store.getState().retryPopover('pinned-child');

      const state = store.getState();
      const retryEntry = state.floating.find((e) => e.key === 'pinned-child');
      expect(retryEntry?.error).toBeNull();
      expect(retryEntry?.data).toEqual({
        data: 'Resolved with parent payload: {"title":"Parent Data Payload"}',
      });
    });

    it('should refresh Map insertion order on SimplePopoverCache.set for existing keys and prune expired items', async () => {
      const cache = new SimplePopoverCache<string>(50, 2); // 50ms TTL, max 2 items
      cache.set('item-1', 'val-1');
      cache.set('item-2', 'val-2');

      // Update item-1 so it becomes the most recently updated entry
      cache.set('item-1', 'val-1-updated');

      // Now insert item-3. Since max capacity is 2, item-2 should be evicted (not item-1!)
      cache.set('item-3', 'val-3');

      expect(cache.has('item-1')).toBe(true);
      expect(cache.get('item-1')).toBe('val-1-updated');
      expect(cache.has('item-2')).toBe(false);
      expect(cache.has('item-3')).toBe(true);

      // Wait for expiration
      await new Promise((r) => setTimeout(r, 70));

      expect(cache.size).toBe(2);
      cache.pruneExpired();
      expect(cache.size).toBe(0);
    });

    it('should fall back to resolveData when async cache returns undefined (cache miss)', async () => {
      const asyncCache = {
        get: async (_key: string) => undefined, // Async cache miss!
        set: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
      };

      let resolverCalled = false;
      const resolver = async (key: string) => {
        resolverCalled = true;
        return { data: `Resolved ${key}` };
      };

      const store = createPopoverStore(resolver, undefined, asyncCache);
      const mockButton = createMockAnchor(0, 0, 100, 100);

      await store.getState().openRootWithResolver('async-miss-item', mockButton);

      expect(resolverCalled).toBe(true);
      expect(store.getState().trail[0]?.data).toEqual({ data: 'Resolved async-miss-item' });
    });

    it('should clear pending hoverLeave timers when a popover card is pinned', async () => {
      const store = createPopoverStore(dummyResolver);
      const rootEntry: TrailEntry = { key: 'pin-hover-item', isLoading: false };

      store.getState().openRoot('owner-1', rootEntry);

      // Trigger hoverLeave
      store.getState().hoverLeave('pin-hover-item', 60);

      // Immediately pin card
      store.getState().togglePin('pin-hover-item', new DOMRect(10, 10, 100, 100));

      // Wait 100ms
      await new Promise((r) => setTimeout(r, 100));

      // Popover should remain pinned and open!
      const state = store.getState();
      expect(state.floating).toHaveLength(1);
      expect(state.floating[0]?.key).toBe('pin-hover-item');
    });

    it('should deduplicate in-flight resolveData requests when triggered concurrently', async () => {
      let resolverCallCount = 0;
      const slowResolver = async (_key: string) => {
        resolverCallCount++;
        await new Promise((r) => setTimeout(r, 60));
        return { data: `Resolved payload call ${resolverCallCount}` };
      };

      const store = createPopoverStore(slowResolver);
      const mockButton = createMockAnchor(0, 0, 100, 100);

      // Trigger two concurrent resolutions for the same key
      const p1 = store.getState().openRootWithResolver('shared-item', mockButton);
      const p2 = store.getState().openRootWithResolver('shared-item', mockButton);

      await Promise.all([p1, p2]);

      // Resolver should be called only ONCE because the promise was shared in-flight!
      expect(resolverCallCount).toBe(1);
      expect(store.getState().trail[0]?.data).toEqual({ data: 'Resolved payload call 1' });
    });

    it('should ignore NaN coordinate inputs in updateOffset to prevent state corruption', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().updateOffset('item-1', 10, 20);
      expect(store.getState().offsets['item-1']).toEqual({ x: 10, y: 20 });

      // Attempt to update with NaN
      store.getState().updateOffset('item-1', NaN, 50);

      // Offset remains unchanged!
      expect(store.getState().offsets['item-1']).toEqual({ x: 10, y: 20 });
    });

    it('should re-open root and nested popover cards when triggered during exit transition (unmounting)', async () => {
      const store = createPopoverStore(async (key) => ({ name: `Data for ${key}` }));
      store.getState().setExitTransitionDuration(150);
      const mockButton = createMockAnchor(0, 0, 100, 100);

      // Open root
      await store.getState().openRootWithResolver('unmount-root', mockButton);
      expect(store.getState().trail).toHaveLength(1);

      // Initiate exit transition close
      store.getState().closeFrom(0, { transition: true });
      expect(store.getState().trail[0]?.transitionStatus).toBe('unmounting');

      // Re-trigger openRootWithResolver while unmounting
      await store.getState().openRootWithResolver('unmount-root', mockButton);

      // Popover should be re-opened and mounting/resolved!
      expect(store.getState().trail[0]?.key).toBe('unmount-root');
      expect(store.getState().trail[0]?.transitionStatus).not.toBe('unmounting');
    });

    it('should support subscribeEvent for monitoring real-time store lifecycle events', () => {
      const store = createPopoverStore(dummyResolver);
      const events: import('./types').PopoverStoreEvent[] = [];

      const unsubscribe = store.getState().subscribeEvent((event) => {
        events.push(event);
      });

      store.getState().openRoot('owner-1', { key: 'root-1' });
      store.getState().pushNested(0, { key: 'child-1', parentKey: 'root-1' });

      expect(events).toEqual([
        { type: 'open_root', key: 'root-1', ownerId: 'owner-1' },
        { type: 'push_nested', key: 'child-1', parentKey: 'root-1' },
      ]);

      unsubscribe();
      store.getState().openRoot('owner-1', { key: 'root-2' });

      // No new events received after unsubscribe
      expect(events).toHaveLength(2);
    });

    it('should batch multiple action updates into a single atomic state commit via batchUpdates', () => {
      const store = createPopoverStore(dummyResolver);
      let renderSubscriberCounter = 0;

      store.subscribe(() => {
        renderSubscriberCounter++;
      });

      // Execute 3 actions inside batchUpdates
      store.getState().batchUpdates((actions) => {
        actions.openRoot('owner-1', { key: 'root-1' });
        actions.togglePin('root-1');
        actions.updateOffset('root-1', 15, 25);
      });

      // State reflects all 3 updates correctly
      expect(store.getState().floating[0]?.key).toBe('root-1');
      expect(store.getState().offsets['root-1']).toEqual({ x: 15, y: 25 });

      // Subscribers notified ONLY ONCE instead of 3 times!
      expect(renderSubscriberCounter).toBe(1);
    });

    it('should support useMiddleware for intercepting and transforming state updates', () => {
      const store = createPopoverStore(dummyResolver);

      // Middleware that attaches custom baseZIndex to every state patch
      const removeMw = store.getState().useMiddleware((patch) => {
        if ('ownerId' in patch && patch.ownerId === 'blocked-owner') {
          return false; // Cancel state update!
        }
        return { ...patch, baseZIndex: 5000 };
      });

      // Attempt to open root with blocked-owner
      store.getState().openRoot('blocked-owner', { key: 'blocked-root' });
      expect(store.getState().trail).toHaveLength(0); // Cancelled!

      // Open root with normal owner
      store.getState().openRoot('allowed-owner', { key: 'allowed-root' });
      expect(store.getState().trail).toHaveLength(1);
      expect(store.getState().baseZIndex).toBe(5000); // Modified by middleware!

      removeMw();
    });

    it('should support Time-Travel undo and redo for popover state history', () => {
      const store = createPopoverStore(dummyResolver);

      expect(store.getState().canUndo()).toBe(false);
      expect(store.getState().canRedo()).toBe(false);

      // Step 1: Open root-1
      store.getState().openRoot('owner-1', { key: 'root-1' });
      expect(store.getState().trail[0]?.key).toBe('root-1');
      expect(store.getState().canUndo()).toBe(true);

      // Step 2: Push child-1
      store.getState().pushNested(0, { key: 'child-1', parentKey: 'root-1' });
      expect(store.getState().trail).toHaveLength(2);

      // Perform Undo: revert to Step 1 (root-1 only)
      store.getState().undo();
      expect(store.getState().trail).toHaveLength(1);
      expect(store.getState().trail[0]?.key).toBe('root-1');
      expect(store.getState().canRedo()).toBe(true);

      // Perform Redo: restore Step 2 (root-1 + child-1)
      store.getState().redo();
      expect(store.getState().trail).toHaveLength(2);
      expect(store.getState().trail[1]?.key).toBe('child-1');
    });

    it('should support transaction isolation and automatically rollback state if an error occurs', async () => {
      const store = createPopoverStore(dummyResolver);

      // Open initial root-1 state
      store.getState().openRoot('owner-1', { key: 'root-1' });
      expect(store.getState().trail).toHaveLength(1);

      // Execute a transaction that throws an error mid-flight
      const success = await store.getState().transaction(async (actions) => {
        actions.pushNested(0, { key: 'child-1', parentKey: 'root-1' });
        actions.togglePin('child-1');
        throw new Error('Transaction network failure!');
      });

      // Transaction failed
      expect(success).toBe(false);

      // State is rolled back cleanly to pre-transaction snapshot (root-1 unpinned only)!
      expect(store.getState().trail).toHaveLength(1);
      expect(store.getState().trail[0]?.key).toBe('root-1');
      expect(store.getState().floating).toHaveLength(0);
    });

    it('should support persistState and rehydrateState for storing and restoring pinned cards', async () => {
      const storageMap = new Map<string, string>();
      const mockStorage = {
        getItem: (k: string) => storageMap.get(k) ?? null,
        setItem: (k: string, v: string) => {
          storageMap.set(k, v);
        },
        removeItem: (k: string) => {
          storageMap.delete(k);
        },
      };

      const store1 = createPopoverStore(dummyResolver);

      // Open root and pin it
      store1
        .getState()
        .openRoot('owner-1', { key: 'pinned-card-1', data: { name: 'Card 1 Data' } });
      store1.getState().togglePin('pinned-card-1');
      store1.getState().updateOffset('pinned-card-1', 45, 90);

      // Persist state to mockStorage
      await store1.getState().persistState({ key: 'test_storage_key', storage: mockStorage });
      expect(storageMap.has('test_storage_key')).toBe(true);

      // Create a fresh store instance (simulating page reload)
      const store2 = createPopoverStore(dummyResolver);
      expect(store2.getState().floating).toHaveLength(0);

      // Rehydrate state
      const rehydrated = await store2
        .getState()
        .rehydrateState({ key: 'test_storage_key', storage: mockStorage });

      expect(rehydrated).toBe(true);
      expect(store2.getState().floating[0]?.key).toBe('pinned-card-1');
      expect(store2.getState().offsets['pinned-card-1']).toEqual({ x: 45, y: 90 });
    });

    it('should support setButtonControls and toggleButtonControl to customize user action buttons', () => {
      const store = createPopoverStore(dummyResolver);

      // Open root-1
      store.getState().openRoot('owner-1', { key: 'card-1' });

      // Initially buttonControls is undefined
      expect(store.getState().trail[0]?.buttonControls).toBeUndefined();

      // Configure buttonControls
      store.getState().setButtonControls('card-1', {
        enablePin: true,
        enableClose: false,
        enableDrag: true,
        customButtons: [{ id: 'action-1', label: 'Custom Action' }],
      });

      expect(store.getState().trail[0]?.buttonControls?.enableClose).toBe(false);
      expect(store.getState().trail[0]?.buttonControls?.customButtons).toHaveLength(1);

      // Dynamically toggle pin button off
      store.getState().toggleButtonControl('card-1', 'enablePin', false);
      expect(store.getState().trail[0]?.buttonControls?.enablePin).toBe(false);

      // Toggle enablePin without 3rd parameter (toggles back to true)
      store.getState().toggleButtonControl('card-1', 'enablePin');
      expect(store.getState().trail[0]?.buttonControls?.enablePin).toBe(true);
    });

    it('should validate isLoadingEntry, isErrorEntry, getEntryState, createPopoverKey, and createPopoverResolver helpers', () => {
      const loadingEntry: TrailEntry<{ name: string }> = {
        key: 'k1',
        isLoading: true,
        error: null,
      };
      const errorEntry: TrailEntry<{ name: string }> = {
        key: 'k2',
        isLoading: false,
        error: new Error('Failed to resolve'),
      };
      const successEntry: TrailEntry<{ name: string }> = {
        key: 'k3',
        isLoading: false,
        data: { name: 'Item' },
        error: null,
      };

      expect(isLoadingEntry(loadingEntry)).toBe(true);
      expect(isLoadingEntry(successEntry)).toBe(false);

      expect(isErrorEntry(errorEntry)).toBe(true);
      expect(isErrorEntry(loadingEntry)).toBe(false);

      expect(getEntryState(loadingEntry)).toEqual({
        status: 'loading',
        isLoading: true,
        data: undefined,
        error: null,
      });
      expect(getEntryState(errorEntry)).toEqual({
        status: 'error',
        isLoading: false,
        data: undefined,
        error: errorEntry.error,
      });
      expect(getEntryState(successEntry)).toEqual({
        status: 'success',
        isLoading: false,
        data: { name: 'Item' },
        error: null,
      });

      const brandedKey = createPopoverKey('custom-key');
      expect(brandedKey).toBe('custom-key');

      const customResolver = createPopoverResolver((key) => ({ resolvedKey: key }));
      expect(customResolver('test')).toEqual({ resolvedKey: 'test' });
    });

    it('should support allowDragWhenPinned and allowDragWhenUnpinned options on popover entries', () => {
      const store = createPopoverStore(dummyResolver);

      store.getState().openRoot('owner-1', {
        key: 'drag-card-1',
        allowDragWhenPinned: false,
        allowDragWhenUnpinned: true,
      });

      expect(store.getState().trail[0]?.allowDragWhenPinned).toBe(false);
      expect(store.getState().trail[0]?.allowDragWhenUnpinned).toBe(true);
    });

    it('should support responsiveMode, setStackGroupFilter, layoutStrategy, and keyboardShortcuts', () => {
      const store = createPopoverStore(dummyResolver);

      // Default responsiveMode is 'auto'
      expect(store.getState().responsiveMode).toBe('auto');

      // Update responsiveMode dynamically
      store.getState().setResponsiveMode('bottom-sheet');
      expect(store.getState().responsiveMode).toBe('bottom-sheet');

      // Update stackGroup filter
      expect(store.getState().activeStackGroup).toBeNull();
      store.getState().setStackGroupFilter('sidebar');
      expect(store.getState().activeStackGroup).toBe('sidebar');

      // Create entry with stackGroup, layoutStrategy, and keyboardShortcuts
      const shortcutFn = vi.fn();
      store.getState().openRoot('owner-1', {
        key: 'universal-card-1',
        stackGroup: 'sidebar',
        layoutStrategy: 'fixed-center',
        keyboardShortcuts: { Escape: shortcutFn },
      });

      const entry = store.getState().trail[0];
      expect(entry?.stackGroup).toBe('sidebar');
      expect(entry?.layoutStrategy).toBe('fixed-center');
      expect(entry?.keyboardShortcuts?.Escape).toBe(shortcutFn);
    });

    it('should support focusLockOptions on popover entries', () => {
      const store = createPopoverStore(dummyResolver);

      store.getState().openRoot('owner-1', {
        key: 'focus-card-1',
        focusLockOptions: {
          enabled: true,
          autoFocusElement: '#input-1',
          returnFocus: true,
          lockScroll: true,
        },
      });

      const entry = store.getState().trail[0];
      expect(entry?.focusLockOptions?.enabled).toBe(true);
      expect(entry?.focusLockOptions?.autoFocusElement).toBe('#input-1');
      expect(entry?.focusLockOptions?.lockScroll).toBe(true);
    });

    it('should support createWorkerResolver fallback in node/test environment', async () => {
      const inlineWorkerResolver = createWorkerResolver(async (key) => ({
        workerResult: `Data for ${key}`,
      }));

      const result = await inlineWorkerResolver('item-123');
      expect(result).toEqual({ workerResult: 'Data for item-123' });
    });
  });
});
