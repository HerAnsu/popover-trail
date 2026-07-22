import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from './store';

describe('PopoverStore - Middleware & Advanced Features', () => {
  const mockResolver = vi.fn().mockResolvedValue({ title: 'Test' });

  it('allows store middleware to intercept or cancel state patches', () => {
    const store = createPopoverStore(mockResolver);
    const middlewareSpy = vi.fn().mockImplementation((patch) => {
      // Reject any state update setting ownerId to "blocked-owner"
      if (patch.ownerId === 'blocked-owner') {
        return false;
      }
      return patch;
    });

    const unsubscribe = store.getState().useMiddleware(middlewareSpy);

    store.getState().openRoot('allowed-owner', { key: 'card-1' });
    expect(store.getState().ownerId).toBe('allowed-owner');

    store.getState().openRoot('blocked-owner', { key: 'card-2' });
    // Patch should be blocked by middleware
    expect(store.getState().ownerId).toBe('allowed-owner');

    unsubscribe();
  });

  it('batches multiple updates atomically into a single state update with batchUpdates()', () => {
    const store = createPopoverStore(mockResolver);
    const listenerSpy = vi.fn();
    store.subscribe(listenerSpy);

    store.getState().batchUpdates((actions) => {
      actions.openRoot('owner-batch', { key: 'root-batch' });
      actions.pushNested(0, { key: 'nested-batch', parentKey: 'root-batch' });
    });

    expect(store.getState().trail).toHaveLength(2);
    expect(store.getState().trail[0]?.key).toBe('root-batch');
    expect(store.getState().trail[1]?.key).toBe('nested-batch');
  });

  it('configures custom stack group zones and zIndexBaseMap', () => {
    const store = createPopoverStore(mockResolver);

    store.getState().setStackGroupFilter('sidebar');
    expect(store.getState().activeStackGroup).toBe('sidebar');

    const customZIndexMap = { sidebar: 2000, canvas: 3000 };
    store.getState().setZIndexBaseMap(customZIndexMap);

    expect(store.getState().zIndexBaseMap).toEqual(customZIndexMap);
  });

  it('supports subscriber events for open_root and push_nested', () => {
    const store = createPopoverStore(mockResolver);
    const eventSpy = vi.fn();

    const unsubscribe = store.getState().subscribeEvent(eventSpy);

    store.getState().openRoot('owner-evt', { key: 'card-evt' });
    expect(eventSpy).toHaveBeenCalledWith({
      type: 'open_root',
      key: 'card-evt',
      ownerId: 'owner-evt',
    });

    unsubscribe();
  });
});
