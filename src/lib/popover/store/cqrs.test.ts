import { describe, it, expect, vi } from 'vitest';
import { PopoverQueryBus, PopoverCommandBus, createCQRSBuses } from './cqrs';
import type { PopoverActions, TrailEntry } from '../types';
import { createMockStoreState } from '../testing/createMockStoreState';
import { createPopoverStore } from '../store';

describe('cqrs module', () => {
  const createMockActions = (): PopoverActions => {
    const mockActions: PopoverActions = {
      setContext: vi.fn(),
      setResolveData: vi.fn(),
      setOwnerId: vi.fn(),
      openRoot: vi.fn(),
      pushNested: vi.fn(),
      openRootWithResolver: vi.fn(async () => {}),
      openNestedWithResolver: vi.fn(async () => {}),
      closeFrom: vi.fn(),
      closeByKey: vi.fn(),
      closeAll: vi.fn(),
      clear: vi.fn(),
      clearTrail: vi.fn(),
      closeTopmost: vi.fn(),
      togglePin: vi.fn(),
      bringToFront: vi.fn(),
      updateOffset: vi.fn(),
      retryPopover: vi.fn(async () => {}),
      prefetchPopover: vi.fn(async () => ({ title: 'Prefetched' })),
      invalidate: vi.fn(async () => {}),
      undo: vi.fn(),
      redo: vi.fn(),
      batchUpdates: vi.fn((fn: (actions: PopoverActions) => void) => fn(mockActions)),
      setClosePinnedDescendants: vi.fn(),
      setCollisionConfig: vi.fn(),
      setEnableArrowNavigation: vi.fn(),
      setDebug: vi.fn(),
      setCascadeOffsetStep: vi.fn(),
      setExitTransitionDuration: vi.fn(),
      setDefaultOffset: vi.fn(),
      setBaseZIndex: vi.fn(),
      setGlobalAnimationClassNames: vi.fn(),
      setAllowDragWhenPinned: vi.fn(),
      setAllowDragWhenUnpinned: vi.fn(),
      setMobileBreakpoint: vi.fn(),
      setFocusLockOptions: vi.fn(),
      hoverEnter: vi.fn(),
      hoverLeave: vi.fn(),
      setTransitionStatus: vi.fn(),
      subscribeKey: vi.fn(() => () => {}),
      subscribeEvent: vi.fn(() => () => {}),
      useMiddleware: vi.fn(() => () => {}),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      transaction: vi.fn(async () => true),
      persistState: vi.fn(async () => {}),
      rehydrateState: vi.fn(async () => true),
      setButtonControls: vi.fn(),
      toggleButtonControl: vi.fn(),
      setStackGroupFilter: vi.fn(),
      setResponsiveMode: vi.fn(),
      setZIndexBaseMap: vi.fn(),
      setSlotComponents: vi.fn(),
      runTransition: vi.fn((fn: (actions: PopoverActions) => void) => fn(mockActions)),
      destroy: vi.fn(),
    };
    return mockActions;
  };

  const createMockState = () =>
    createMockStoreState<unknown, { env: string }, string>({
      ownerId: 'owner-1',
      context: { env: 'test' },
      floating: [{ key: 'pinned-1', isLoading: false, error: null }],
      trail: [
        { key: 'root-1', isLoading: false, error: null },
        { key: 'child-1', parentKey: 'root-1', isLoading: false, error: null },
      ],
      pinnedStates: { 'pinned-1': true },
      offsets: { 'pinned-1': { x: 15, y: 30 } },
      zIndexOrder: ['pinned-1', 'root-1', 'child-1'],
    });

  it('queries store state via PopoverQueryBus without side effects', () => {
    const mockState = createMockState();
    const queryBus = new PopoverQueryBus(() => mockState);

    expect(queryBus.ownerId).toBe('owner-1');
    expect(queryBus.context).toEqual({ env: 'test' });
    expect(queryBus.trail).toHaveLength(2);
    expect(queryBus.floating).toHaveLength(1);
    expect(queryBus.getEntry('root-1')?.key).toBe('root-1');
    expect(queryBus.isPinned('pinned-1')).toBe(true);
    expect(queryBus.getOffset('pinned-1')).toEqual({ x: 15, y: 30 });
    expect(queryBus.getOffset('unknown')).toEqual({ x: 0, y: 0 });
    expect(queryBus.activeCount).toBe(3);
    expect(queryBus.isIdle).toBe(false);
    expect(queryBus.discriminatedStatus).toBe('active-trail');
    expect(queryBus.root?.key).toBe('root-1');
    expect(queryBus.hasEntry('root-1')).toBe(true);
    expect(queryBus.isOpen('root-1')).toBe(true);
    expect(queryBus.hasEntry('missing')).toBe(false);
    expect(queryBus.isLoading('root-1')).toBe(false);
    expect(queryBus.getError('root-1')).toBeNull();
    expect(queryBus.getData('root-1')).toBeNull();
    expect(queryBus.zIndexOrder).toEqual(['pinned-1', 'root-1', 'child-1']);
    expect(queryBus.isTopmost('child-1')).toBe(true);
    expect(queryBus.isTopmost('root-1')).toBe(false);
  });

  it('queries hierarchy, breadcrumbs, parent, and children in PopoverQueryBus', () => {
    const mockState = createMockState();
    const queryBus = new PopoverQueryBus(() => mockState);

    expect(queryBus.getParent('child-1')).toBe('root-1');
    expect(queryBus.getParent('root-1')).toBeUndefined();

    expect(queryBus.getChildren('root-1')).toEqual(['child-1']);
    expect(queryBus.getChildren('child-1')).toEqual([]);

    expect(queryBus.getBreadcrumbs('child-1')).toEqual(['root-1', 'child-1']);
    expect(queryBus.getBreadcrumbs('root-1')).toEqual(['root-1']);

    expect(queryBus.getDepth('root-1')).toBe(0);
    expect(queryBus.getDepth('child-1')).toBe(1);

    expect(queryBus.snapshot.trail).toHaveLength(2);
    expect(queryBus.snapshot.ownerId).toBe('owner-1');
  });

  it('dispatches commands via PopoverCommandBus', async () => {
    const mockActions = createMockActions();
    const commandBus = new PopoverCommandBus(mockActions);

    const testEntry: TrailEntry<unknown> = { key: 'root-1', isLoading: false, error: null };
    commandBus.openRoot('owner-1', testEntry);
    expect(mockActions.openRoot).toHaveBeenCalledWith('owner-1', testEntry);

    commandBus.openNested(0, testEntry);
    expect(mockActions.pushNested).toHaveBeenCalledWith(0, testEntry);

    await commandBus.openRootWithResolver('card-res');
    expect(mockActions.openRootWithResolver).toHaveBeenCalledWith('card-res', undefined, undefined);

    await commandBus.openNestedWithResolver('child-res', 'card-res');
    expect(mockActions.openNestedWithResolver).toHaveBeenCalledWith(
      'child-res',
      'card-res',
      undefined,
    );

    commandBus.close('root-1');
    expect(mockActions.closeByKey).toHaveBeenCalledWith('root-1', undefined);

    commandBus.closeTopmost();
    expect(mockActions.closeTopmost).toHaveBeenCalled();

    commandBus.clearTrail();
    expect(mockActions.clearTrail).toHaveBeenCalled();

    commandBus.clearAll();
    expect(mockActions.closeAll).toHaveBeenCalled();

    commandBus.togglePin('pinned-1');
    expect(mockActions.togglePin).toHaveBeenCalledWith('pinned-1', undefined);

    commandBus.bringToFront('pinned-1');
    expect(mockActions.bringToFront).toHaveBeenCalledWith('pinned-1');

    commandBus.updateOffset('pinned-1', 50, 100);
    expect(mockActions.updateOffset).toHaveBeenCalledWith('pinned-1', 50, 100);

    await commandBus.retry('pinned-1');
    expect(mockActions.retryPopover).toHaveBeenCalledWith('pinned-1');

    const prefetched = await commandBus.prefetch('pinned-1');
    expect(prefetched).toEqual({ title: 'Prefetched' });
    expect(mockActions.prefetchPopover).toHaveBeenCalledWith('pinned-1', undefined);

    commandBus.undo();
    expect(mockActions.undo).toHaveBeenCalled();

    commandBus.redo();
    expect(mockActions.redo).toHaveBeenCalled();

    commandBus.batch((bus) => {
      bus.close('root-1');
    });
    expect(mockActions.batchUpdates).toHaveBeenCalled();
  });

  it('creates queryBus and commandBus via createCQRSBuses factory with disposal support', () => {
    const store = createPopoverStore(async () => ({}));
    const buses = createCQRSBuses(store);

    expect(buses.queryBus).toBeInstanceOf(PopoverQueryBus);
    expect(buses.commandBus).toBeInstanceOf(PopoverCommandBus);

    expect(() => buses.queryBus.dispose()).not.toThrow();
    expect(() => buses.commandBus.dispose()).not.toThrow();
  });
});
