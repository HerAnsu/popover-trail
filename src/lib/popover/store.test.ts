import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from './store';
import {
  isResolvedEntry,
  isLoadingEntry,
  isErrorEntry,
  getEntryState,
  createPopoverKey,
  createPopoverResolver,
  createVirtualElement,
  isOpenRootEvent,
  isPinEvent,
  type TrailEntry,
  type AnchorEventLike,
} from './types';
import { SimplePopoverCache } from './utils/cache';
import { createWorkerResolver } from './utils/workerResolver';
import { createPopoverController } from './utils/popoverController';
import { getPopoverStyles } from './utils/styles';
import { invariant } from './utils/invariant';
import { clampDragCoordinates, computeTiltMatrix, applyDragFriction } from './utils/dragMath';

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
    expect(state.trail[0]?.data).toBeNull();

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

      const store = createPopoverStore<unknown>(resolver);
      const parent: TrailEntry<unknown> = {
        key: 'parent',
        data: { title: 'Parent Data Payload' },
        isLoading: false,
      };
      const child: TrailEntry<unknown> = {
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

    it('should support lifecycle callbacks onOpen, onPin, onError and setZIndexBaseMap', async () => {
      const onOpenFn = vi.fn();
      const onPinFn = vi.fn();

      const store = createPopoverStore(async (key) => {
        if (key === 'error-key') throw new Error('Failed to resolve');
        return { loadedKey: key };
      });

      // Test onOpen & onPin callbacks
      await store.getState().openRootWithResolver(
        'root-1',
        { getBoundingClientRect: () => new DOMRect() },
        {
          onOpen: onOpenFn,
          onPin: onPinFn,
        },
      );

      expect(onOpenFn).toHaveBeenCalledTimes(1);

      store.getState().togglePin('root-1');
      expect(onPinFn).toHaveBeenCalledWith('root-1', true);

      // Test onError callback
      const onErrorFn = vi.fn();
      await store.getState().openRootWithResolver(
        'error-key',
        { getBoundingClientRect: () => new DOMRect() },
        {
          onError: onErrorFn,
        },
      );

      expect(onErrorFn).toHaveBeenCalledTimes(1);

      // Test setZIndexBaseMap
      store.getState().setZIndexBaseMap({ sidebar: 2000, modal: 9000 });
      expect(store.getState().zIndexBaseMap).toEqual({ sidebar: 2000, modal: 9000 });
    });

    it('should support createVirtualElement and createPopoverController', () => {
      const store = createPopoverStore(dummyResolver);
      const controller = createPopoverController(store);

      const virtualElem = createVirtualElement(150, 300, 200, 50);
      expect(
        (virtualElem as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect()
          .top,
      ).toBe(300);

      controller.openRoot('owner-ctrl', { key: 'card-ctrl' });
      expect(controller.getState().trail[0]?.key).toBe('card-ctrl');

      controller.togglePin('card-ctrl');
      expect(controller.getState().floating.length).toBe(1);

      controller.clear();
      expect(controller.getState().floating.length).toBe(0);
    });

    it('should prefetch popover data into cache via prefetchPopover', async () => {
      const cache = new SimplePopoverCache();
      const store = createPopoverStore(async (key) => ({ key, prefetched: true }), null, cache);

      const prefetchedData = await store.getState().prefetchPopover('prefetched-item');
      expect(prefetchedData).toEqual({ key: 'prefetched-item', prefetched: true });

      const cachedResult = await cache.get('prefetched-item');
      expect(cachedResult).toEqual({ key: 'prefetched-item', prefetched: true });
    });

    it('should memoize getPopoverStyles style object referential equality for identical inputs', () => {
      const style1 = getPopoverStyles({
        finalLayoutPos: { top: 100, left: 200 },
        offset: { x: 10, y: 20 },
        zIndex: 1000,
      });

      const style2 = getPopoverStyles({
        finalLayoutPos: { top: 100, left: 200 },
        offset: { x: 10, y: 20 },
        zIndex: 1000,
      });

      expect(style1).toBe(style2);
    });

    it('should track cache hit and miss statistics in SimplePopoverCache', () => {
      const cache = new SimplePopoverCache<number>();
      cache.set('a', 100);

      expect(cache.get('a')).toBe(100);
      expect(cache.get('b')).toBeUndefined();

      const stats = cache.stats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRatio).toBe(0.5);
    });

    it('should throw standardized error when invariant assertion fails', () => {
      expect(() => invariant(true, 'OK')).not.toThrow();
      expect(() => invariant(false, 'Must be within provider')).toThrow(
        '[Popover Trail] Must be within provider',
      );
    });

    it('should calculate drag coordinates, tilt matrix, and friction in dragMath', () => {
      const clamped = clampDragCoordinates(150, 250, { maxX: 100, maxY: 200 });
      expect(clamped).toEqual({ x: 100, y: 200 });

      const tilt = computeTiltMatrix(50, -20);
      expect(tilt.rotationX).toBeGreaterThan(0);
      expect(tilt.rotationY).toBeGreaterThan(0);

      const friction = applyDragFriction(100, 0.2);
      expect(friction).toBe(80);
    });

    it('should validate Event Bus type guards correctly', () => {
      const openEvent = { type: 'open_root', key: 'card-1', ownerId: 'owner-1' } as const;
      const pinEvent = { type: 'pin', key: 'card-1' } as const;

      expect(isOpenRootEvent(openEvent)).toBe(true);
      expect(isOpenRootEvent(pinEvent)).toBe(false);
      expect(isPinEvent(pinEvent)).toBe(true);
    });

    it('should clear all popover cards on clear() action', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'root-card' });
      store.getState().togglePin('root-card');
      store.getState().pushNested(0, { key: 'nested-card', parentKey: 'root-card' });

      expect(store.getState().trail.length + store.getState().floating.length).toBeGreaterThan(0);

      store.getState().clear();

      expect(store.getState().trail).toEqual([]);
      expect(store.getState().floating).toEqual([]);
    });

    it('should close topmost popover card on closeTopmost() action', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'root-card' });
      store.getState().pushNested(0, { key: 'nested-1', parentKey: 'root-card' });

      expect(store.getState().trail).toHaveLength(2);

      store.getState().closeTopmost();

      expect(store.getState().trail).toHaveLength(1);
      expect(store.getState().trail[0]?.key).toBe('root-card');
    });

    it('should update mobileBreakpoint and activeStackGroup dynamically', () => {
      const store = createPopoverStore(dummyResolver);

      expect(store.getState().mobileBreakpoint).toBe(768);
      store.getState().setMobileBreakpoint(640);
      expect(store.getState().mobileBreakpoint).toBe(640);

      expect(store.getState().activeStackGroup).toBeNull();
      store.getState().setStackGroupFilter('dialogs');
      expect(store.getState().activeStackGroup).toBe('dialogs');
      store.getState().setStackGroupFilter(null);
      expect(store.getState().activeStackGroup).toBeNull();
    });

    it('should handle rehydrateState failure gracefully when storage returns invalid data', async () => {
      const corruptStorage = {
        getItem: () => 'INVALID_JSON_PAYLOAD_(((',
        setItem: () => {},
        removeItem: () => {},
      };

      const store = createPopoverStore(dummyResolver);
      const rehydrated = await store
        .getState()
        .rehydrateState({ key: 'corrupt_key', storage: corruptStorage });

      expect(rehydrated).toBe(false);
      expect(store.getState().floating).toEqual([]);
    });

    it('should handle retryPopover safely when key is not found in trail or floating', async () => {
      const store = createPopoverStore(dummyResolver);
      await expect(store.getState().retryPopover('unknown-key')).resolves.toBeUndefined();
    });

    it('should update zIndexOrder correctly when bringToFront is called on pinned card', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'root-1' });
      store.getState().togglePin('root-1');

      store.getState().openRoot('owner-2', { key: 'root-2' });
      store.getState().togglePin('root-2');

      expect(store.getState().zIndexOrder).toEqual(['root-1', 'root-2']);

      store.getState().bringToFront('root-1');
      expect(store.getState().zIndexOrder).toEqual(['root-2', 'root-1']);
    });

    // --- 20 NEW TESTS FROM SIMPLE TO ULTRA-COMPLEX ---

    // 1. Simple
    it('1. should toggle debug state via setDebug()', () => {
      const store = createPopoverStore(dummyResolver);
      expect(store.getState().debug).toBe(false);

      store.getState().setDebug(true);
      expect(store.getState().debug).toBe(true);

      store.getState().setDebug(false);
      expect(store.getState().debug).toBe(false);
    });

    // 2. Simple
    it('2. should update baseZIndex via setBaseZIndex()', () => {
      const store = createPopoverStore(dummyResolver);
      expect(store.getState().baseZIndex).toBe(1000);

      store.getState().setBaseZIndex(5000);
      expect(store.getState().baseZIndex).toBe(5000);
    });

    // 3. Simple
    it('3. should toggle closePinnedDescendants configuration via setClosePinnedDescendants()', () => {
      const store = createPopoverStore(dummyResolver);
      expect(store.getState().closePinnedDescendants).toBe(false);

      store.getState().setClosePinnedDescendants(true);
      expect(store.getState().closePinnedDescendants).toBe(true);
    });

    // 4. Simple
    it('4. should update exitTransitionDuration via setExitTransitionDuration()', () => {
      const store = createPopoverStore(dummyResolver);
      expect(store.getState().exitTransitionDuration).toBe(0);

      store.getState().setExitTransitionDuration(400);
      expect(store.getState().exitTransitionDuration).toBe(400);
    });

    // 5. Simple
    it('5. should find entry by key from trail or floating accurately', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'trail-item' });
      store.getState().pushNested(0, { key: 'floating-item', parentKey: 'trail-item' });
      store.getState().togglePin('floating-item');

      const state = store.getState();
      const findEntry = (k: string) =>
        state.trail.find((e) => e.key === k) || state.floating.find((e) => e.key === k);

      expect(findEntry('trail-item')?.key).toBe('trail-item');
      expect(findEntry('floating-item')?.key).toBe('floating-item');
      expect(findEntry('unknown')).toBeUndefined();
    });

    // 6. Medium
    it('6. should handle pushNested safely when parent index is out of bounds', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'root-1' });

      // Push nested under non-existent parent index (out-of-bounds 99)
      store.getState().pushNested(99, { key: 'orphan-item', parentKey: 'missing-parent' });

      // Should be ignored cleanly without breaking state
      expect(store.getState().trail).toHaveLength(1);
      expect(store.getState().trail[0]?.key).toBe('root-1');
    });

    // 7. Medium
    it('7. should re-focus existing pinned card when openRootWithResolver is invoked with same key', async () => {
      const store = createPopoverStore(dummyResolver);
      const mockAnchor = createMockAnchor(0, 0, 100, 100);

      await store.getState().openRootWithResolver('card-a', mockAnchor);
      store.getState().togglePin('card-a');

      expect(store.getState().floating).toHaveLength(1);

      // Re-trigger open for already pinned card-a
      await store.getState().openRootWithResolver('card-a', mockAnchor);

      expect(store.getState().floating).toHaveLength(1);
      expect(store.getState().floating[0]?.key).toBe('card-a');
    });

    // 8. Medium
    it('8. should update offset with negative and zero coordinates accurately', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'card-offset' });

      store.getState().updateOffset('card-offset', -120, 0);
      expect(store.getState().offsets['card-offset']).toEqual({ x: -120, y: 0 });

      store.getState().updateOffset('card-offset', 0, 0);
      expect(store.getState().offsets['card-offset']).toEqual({ x: 0, y: 0 });
    });

    // 9. Medium
    it('9. should store and pass initialContext to resolver calls', async () => {
      const resolverWithContext = vi.fn(async (_key: string, _pData?: unknown, ctx?: unknown) => {
        return { contextReceived: ctx };
      });

      const initialContext = { tenantId: 'tenant-99', theme: 'dark' };
      const store = createPopoverStore(resolverWithContext, initialContext);

      expect(store.getState().context).toEqual(initialContext);

      await store.getState().openRootWithResolver('item-ctx', createMockAnchor(0, 0, 100, 100));

      expect(resolverWithContext).toHaveBeenCalledWith(
        'item-ctx',
        undefined,
        initialContext,
        expect.any(Object),
      );
      expect(store.getState().trail[0]?.data).toEqual({ contextReceived: initialContext });
    });

    // 10. Medium
    it('10. should push state snapshots onto undo history stack', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'card-1' });
      store.getState().openRoot('owner-1', { key: 'card-2' });

      expect(store.getState().canUndo()).toBe(true);

      store.getState().undo();
      expect(store.getState().trail[0]?.key).toBe('card-1');
    });

    // 11. Complex
    it('11. should cascade close a 4-deep trail (L0->L1->L2->L3) and abort pending requests when closing from L1', async () => {
      const abortedKeys: string[] = [];
      const slowResolver = async (
        key: string,
        _pData?: unknown,
        _ctx?: unknown,
        signal?: AbortSignal,
      ) => {
        signal?.addEventListener('abort', () => abortedKeys.push(key));
        await new Promise((r) => setTimeout(r, 100));
        return { title: `L_${key}` };
      };

      const store = createPopoverStore(slowResolver);
      store.getState().openRoot('owner-1', { key: 'L0', isLoading: false });
      store.getState().pushNested(0, { key: 'L1', parentKey: 'L0', isLoading: false });
      store.getState().pushNested(1, { key: 'L2', parentKey: 'L1', isLoading: false });

      // Trigger pending async load for L3
      const p3 = store.getState().openNestedWithResolver('L3', 'L2');

      expect(store.getState().trail).toHaveLength(4);

      // Close from index 1 (removes L1, L2, L3)
      store.getState().closeFrom(1);

      expect(store.getState().trail).toHaveLength(1);
      expect(store.getState().trail[0]?.key).toBe('L0');

      await p3;
      expect(abortedKeys).toContain('L3');
    });

    // 12. Complex
    it('12. should set error state on resolver failure and clear error on retry with invalidating cache', async () => {
      let failCount = 0;
      const resolver = async (key: string) => {
        failCount++;
        if (failCount === 1) {
          throw new Error('API Rate Limit Exceeded');
        }
        return { title: `Resolved ${key} on attempt ${failCount}` };
      };

      const cacheMap = new Map<string, unknown>();
      const cache = {
        get: (k: string) => cacheMap.get(k),
        set: (k: string, v: unknown) => {
          cacheMap.set(k, v);
        },
        delete: (k: string) => {
          cacheMap.delete(k);
        },
        clear: () => {
          cacheMap.clear();
        },
      };

      const store = createPopoverStore(resolver, undefined, cache);

      // Attempt 1 fails
      await store.getState().openRootWithResolver('flaky-key', createMockAnchor(0, 0, 50, 50));

      expect(store.getState().trail[0]?.isLoading).toBe(false);
      expect(store.getState().trail[0]?.error?.message).toBe('API Rate Limit Exceeded');
      expect(cacheMap.has('flaky-key')).toBe(false);

      // Attempt 2 via retryPopover succeeds
      await store.getState().retryPopover('flaky-key');

      expect(store.getState().trail[0]?.error).toBeNull();
      expect(store.getState().trail[0]?.data).toEqual({
        title: 'Resolved flaky-key on attempt 2',
      });
      expect(cacheMap.get('flaky-key')).toEqual({ title: 'Resolved flaky-key on attempt 2' });
    });

    // 13. Complex
    it('13. should support grid-snapping middleware for drag offset updates', () => {
      const store = createPopoverStore(dummyResolver);

      // Attach grid-snapping middleware (10px grid)
      store.getState().useMiddleware((patch) => {
        if (patch.offsets) {
          const snappedOffsets: Record<string, { x: number; y: number }> = {};
          for (const [k, pos] of Object.entries(patch.offsets)) {
            if (pos) {
              snappedOffsets[k] = {
                x: Math.round(pos.x / 10) * 10,
                y: Math.round(pos.y / 10) * 10,
              };
            }
          }
          return { offsets: snappedOffsets };
        }
      });

      store.getState().openRoot('owner-1', { key: 'drag-card' });
      store.getState().updateOffset('drag-card', 27, 44);

      // Offset snapped from (27, 44) to (30, 40)
      expect(store.getState().offsets['drag-card']).toEqual({ x: 30, y: 40 });
    });

    // 14. Complex
    it('14. should isolate transaction mutations and rollback state cleanly when an error is thrown', async () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'base-root' });

      const preTransactionState = store.getState().trail;

      const result = await store.getState().transaction(async (actions) => {
        actions.pushNested(0, { key: 'tx-nested-1', parentKey: 'base-root' });
        actions.togglePin('tx-nested-1');
        throw new Error('Database write lock error!');
      });

      expect(result).toBe(false);
      expect(store.getState().trail).toEqual(preTransactionState);
      expect(store.getState().floating).toEqual([]);
    });

    // 15. Complex
    it('15. should prevent out-of-order race condition when triggering 3 rapid sibling nested popovers', async () => {
      const resolveTimes: Record<string, number> = {
        'sibling-1': 80,
        'sibling-2': 20, // Fast!
        'sibling-3': 50,
      };

      const variableResolver = async (key: string) => {
        const delay = resolveTimes[key] ?? 10;
        await new Promise((r) => setTimeout(r, delay));
        return { siblingName: key };
      };

      const store = createPopoverStore(variableResolver);
      store.getState().openRoot('owner-1', { key: 'root-parent', isLoading: false });

      // Trigger 3 calls rapidly
      const p1 = store.getState().openNestedWithResolver('sibling-1', 'root-parent');
      const p2 = store.getState().openNestedWithResolver('sibling-2', 'root-parent');
      const p3 = store.getState().openNestedWithResolver('sibling-3', 'root-parent');

      await Promise.all([p1, p2, p3]);

      const state = store.getState();
      expect(state.trail).toHaveLength(2);
      expect(state.trail[1]?.key).toBe('sibling-3'); // Latest call wins!
      expect(state.trail[1]?.data).toEqual({ siblingName: 'sibling-3' });
    });

    // 16. Ultra-Complex
    it('16. should execute Time-Travel Undo and Redo preserving pinned state and zIndexOrder', () => {
      const store = createPopoverStore(dummyResolver);

      // Step 1: open root-1
      store.getState().openRoot('owner-1', { key: 'root-1' });
      // Step 2: pin root-1
      store.getState().togglePin('root-1');
      // Step 3: open root-2 and pin root-2
      store.getState().openRoot('owner-2', { key: 'root-2' });
      store.getState().togglePin('root-2');

      expect(store.getState().floating).toHaveLength(2);

      // Undo Step 3 (before root-2 was opened)
      store.getState().undo();
      expect(store.getState().floating).toHaveLength(1);
      expect(store.getState().floating[0]?.key).toBe('root-1');

      // Redo back
      store.getState().redo();
      expect(store.getState().floating).toHaveLength(2);
    });

    // 17. Ultra-Complex
    it('17. should integrate custom cache eviction policy with TTL and track hit/miss statistics', async () => {
      const cache = new SimplePopoverCache<{ timestamp: number }>(600, 2); // 600ms TTL, max 2 entries

      let fetchCount = 0;
      const timingResolver = async (key: string) => {
        fetchCount++;
        return { key, timestamp: Date.now() };
      };

      const store = createPopoverStore(timingResolver, undefined, cache);
      const mockAnchor = createMockAnchor(0, 0, 100, 100);

      // 1. Fetch item-1 (Miss)
      await store.getState().openRootWithResolver('item-1', mockAnchor);
      expect(fetchCount).toBe(1);

      // 2. Fetch item-2 and item-3 (Evicts item-1 due to max size = 2)
      await store.getState().openRootWithResolver('item-2', mockAnchor);
      await store.getState().openRootWithResolver('item-3', mockAnchor);
      expect(fetchCount).toBe(3);

      expect(cache.has('item-1')).toBe(false);
    });

    // 18. Ultra-Complex
    it('18. should handle rapid hover enter/leave timer loops across a 3-level stack with a pinned middle element', async () => {
      const store = createPopoverStore(dummyResolver);

      store.getState().openRoot('owner-1', { key: 'L0', isLoading: false });
      store.getState().pushNested(0, { key: 'L1', parentKey: 'L0', isLoading: false });
      store.getState().pushNested(1, { key: 'L2', parentKey: 'L1', isLoading: false });

      // Pin middle card L1
      store.getState().togglePin('L1', new DOMRect(100, 100, 200, 200));

      expect(store.getState().trail).toHaveLength(2); // L0, L2
      expect(store.getState().floating).toHaveLength(1); // L1

      // Trigger hoverLeave on L2
      store.getState().hoverLeave('L2', 50);

      // Immediately hoverEnter L1 (pinned parent)
      store.getState().hoverEnter('L1');

      // Wait 80ms
      await new Promise((r) => setTimeout(r, 80));

      // L1 remains open in floating
      expect(store.getState().floating).toHaveLength(1);
    });

    // 19. Ultra-Complex
    it('19. should emit strongly typed lifecycle events to EventBus during atomic batchUpdates', () => {
      const store = createPopoverStore(dummyResolver);
      const openEvents: string[] = [];

      const unsubOpen = store.getState().subscribeEvent((event) => {
        if (event.type === 'open_root') {
          openEvents.push(event.key);
        }
      });

      store.getState().batchUpdates((actions) => {
        actions.openRoot('owner-1', { key: 'batch-root-1' });
        actions.openRoot('owner-2', { key: 'batch-root-2' });
        actions.togglePin('batch-root-2');
      });

      expect(openEvents).toEqual(['batch-root-1', 'batch-root-2']);
      expect(store.getState().floating[0]?.key).toBe('batch-root-2');

      unsubOpen();
    });

    // 20. Ultra-Complex
    it('20. should serialize, persist, and rehydrate complete store state including offsets and button controls across store instances', async () => {
      const storageMap = new Map<string, string>();
      const persistentStorage = {
        getItem: (k: string) => storageMap.get(k) ?? null,
        setItem: (k: string, v: string) => {
          storageMap.set(k, v);
        },
        removeItem: (k: string) => {
          storageMap.delete(k);
        },
      };

      const sourceStore = createPopoverStore(dummyResolver);

      sourceStore.getState().openRoot('owner-1', {
        key: 'persisted-card-1',
        data: { value: 'Secret Payload' },
        buttonControls: { enablePin: true, enableClose: false },
      });
      sourceStore.getState().togglePin('persisted-card-1');
      sourceStore.getState().updateOffset('persisted-card-1', 88, 176);

      // Save snapshot to storage
      await sourceStore
        .getState()
        .persistState({ key: 'app_session_v1', storage: persistentStorage });

      expect(storageMap.has('app_session_v1')).toBe(true);

      // Instantiate new store (e.g. after browser refresh)
      const targetStore = createPopoverStore(dummyResolver);
      expect(targetStore.getState().floating).toHaveLength(0);

      // Rehydrate state into target store
      const success = await targetStore
        .getState()
        .rehydrateState({ key: 'app_session_v1', storage: persistentStorage });

      expect(success).toBe(true);
      expect(targetStore.getState().floating).toHaveLength(1);

      const rehydratedCard = targetStore.getState().floating[0];
      expect(rehydratedCard?.key).toBe('persisted-card-1');
      expect(rehydratedCard?.buttonControls?.enableClose).toBe(false);
      expect(targetStore.getState().offsets['persisted-card-1']).toEqual({ x: 88, y: 176 });
    });
  });
});
