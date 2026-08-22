import { describe, it, expect } from 'vitest';
import { createStoreActions } from './storeActionRegistry';
import { createMockSliceContext } from '../testing/createMockSliceContext';

describe('storeActionRegistry module', () => {
  it('creates bound store actions object with all action slice methods', () => {
    const ctx = createMockSliceContext({
      floating: [],
      trail: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      ownerId: null,
      debug: false,
    });

    const actions = createStoreActions(ctx.set, ctx.get, ctx.deps);

    expect(actions.openRoot).toBeDefined();
    expect(actions.pushNested).toBeDefined();
    expect(actions.togglePin).toBeDefined();
    expect(actions.setDebug).toBeDefined();
    expect(actions.subscribeEvent).toBeDefined();
  });

  it('merges custom slice actions without overriding core actions', () => {
    const customMethod = () => 'custom';
    const fakeOpenRoot = () => 'overridden';

    const ctx = createMockSliceContext<unknown, unknown, string>(
      {
        floating: [],
        trail: [],
        offsets: {},
        pinnedStates: {},
        zIndexOrder: [],
        ownerId: null,
        debug: false,
      },
      {
        customSlices: [
          {
            name: 'myCustomSlice',
            create: () => ({
              myCustomAction: customMethod,
              openRoot: fakeOpenRoot,
            }),
          },
        ],
      },
    );

    const actions = createStoreActions<unknown, unknown, string, { myCustomAction: () => string }>(
      ctx.set,
      ctx.get,
      ctx.deps,
    );

    expect(actions.myCustomAction).toBe(customMethod);
    // Core action openRoot must be preserved, not overwritten by custom slice
    expect(actions.openRoot).not.toBe(fakeOpenRoot);
    expect(typeof actions.openRoot).toBe('function');
  });
});
