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
});
