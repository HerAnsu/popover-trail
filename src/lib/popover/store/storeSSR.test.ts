import { describe, it, expect } from 'vitest';
import { createPopoverStore } from './core/storeFactory';

describe('storeSSR & getServerSnapshot', () => {
  it('provides deterministic server snapshot on store instance', () => {
    const store = createPopoverStore();
    expect(typeof store.getServerSnapshot).toBe('function');
    const serverState = store.getServerSnapshot();
    expect(serverState.trail).toEqual([]);
    expect(serverState.floating).toEqual([]);
    expect(serverState.zIndexOrder).toEqual([]);
  });

  it('getServerSnapshot returns initial state even after mutations', () => {
    const store = createPopoverStore();
    store.getState().actions.openRoot('test-owner', { key: 'test-key' });
    expect(store.getState().trail).toHaveLength(1);
    const serverSnapshot = store.getServerSnapshot();
    expect(serverSnapshot.trail).toHaveLength(0);
  });
});
