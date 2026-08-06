import { describe, it, expect, vi } from 'vitest';
import { createStoreActions, ActionRegistryDependencies } from './storeActionRegistry';
import { PopoverStateData } from '../types';

describe('storeActionRegistry module', () => {
  it('creates bound store actions object with all action slice methods', () => {
    let mockState = {
      floating: [],
      trail: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      ownerId: null,
      debug: false,
    } as unknown as PopoverStateData<unknown, unknown>;

    const set = (patch: unknown) => {
      const next =
        typeof patch === 'function' ? (patch as (s: unknown) => unknown)(mockState) : patch;
      mockState = { ...mockState, ...(next as object) };
    };
    const get = () => mockState as unknown;

    const deps = {
      activeControllers: new Map(),
      inFlightPromises: new Map(),
      hoverCloseTimers: new Map(),
      transitionTimers: new Map(),
      eventListeners: new Set(),
      clearHoverTimer: vi.fn(),
      clearTransitionTimer: vi.fn(),
      abortControllersForKeys: vi.fn(),
      resetStoreState: vi.fn(),
      incrementRootCounter: vi.fn(),
      isRootStale: vi.fn(),
      incrementNestedCounter: vi.fn(),
      isNestedStale: vi.fn(),
      findEntryByKey: vi.fn(),
      resolvePopoverEntry: vi.fn(),
      pushSnapshot: vi.fn(),
      clearHistory: vi.fn(),
      undoStack: [],
      redoStack: [],
      startBatch: vi.fn(),
      endBatch: vi.fn(),
      middlewareEngine: { use: vi.fn() },
    } as unknown as ActionRegistryDependencies<unknown, unknown, string>;

    const actions = createStoreActions(set as never, get as never, deps);

    expect(actions.openRoot).toBeDefined();
    expect(actions.pushNested).toBeDefined();
    expect(actions.togglePin).toBeDefined();
    expect(actions.setDebug).toBeDefined();
    expect(actions.subscribeEvent).toBeDefined();
  });
});
