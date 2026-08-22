/**
 * Mock Slice Context DI Fixture Provider for Unit Testing popover-trail slices.
 * Eliminates double type assertions (`as unknown as SliceContext`) across all slice tests.
 *
 * @module testing/createMockSliceContext
 */

import type { SliceContext } from '../store/slices/sliceContext';
import type { PopoverStateData, PopoverActions } from '../types';
import type { ActionRegistryDependencies } from '../store/storeActionRegistry';
import { createMockStoreState } from './createMockStoreState';
import { PopoverDAG } from '../utils/dag';
import { PopoverMiddlewareEngine } from '../store/storeMiddlewareEngine';
import { createHistoryManager } from '../store/history';

import { PopoverTransitionScheduler } from '../store/transitionScheduler';
import { PopoverEventBus } from '../store/eventBus';

/**
 * Creates a fully typed, initialized Mock SliceContext for unit testing domain slices.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @template TSliceState - Domain slice state schema.
 * @param initialOverrides - Optional state overrides.
 * @param depOverrides - Optional DI dependency overrides.
 * @returns Fully typed, valid SliceContext container.
 */
export function createMockSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends Record<string, unknown> = Record<string, never>,
>(
  initialOverrides?: Partial<PopoverStateData<TData, TContext, TPopoverKey>>,
  depOverrides?: Partial<ActionRegistryDependencies<TData, TContext, TPopoverKey>>,
): SliceContext<TData, TContext, TPopoverKey, TSliceState> & {
  state: PopoverStateData<TData, TContext, TPopoverKey>;
} {
  let state = createMockStoreState<TData, TContext, TPopoverKey>(initialOverrides);
  const historyMgr = createHistoryManager<TData, TPopoverKey>();
  const dag = new PopoverDAG<TPopoverKey>();
  const mw = new PopoverMiddlewareEngine<TData, TContext, TPopoverKey>();
  const transitionScheduler = new PopoverTransitionScheduler();
  const eventBus = new PopoverEventBus<TData, TPopoverKey>();

  const deps: ActionRegistryDependencies<TData, TContext, TPopoverKey> = {
    activeControllers: new Map<string, AbortController>(),
    inFlightPromises: new Map<string, Promise<TData>>(),
    abortControllersForKeys: () => {},
    incrementRootCounter: () => 1,
    isRootStale: () => false,
    incrementNestedCounter: () => 1,
    isNestedStale: () => false,
    markAllCountersStale: () => {},
    resolvePopoverEntry: () => Promise.resolve(),
    transitionScheduler,
    eventBus,
    eventListeners: new Set(),
    pushSnapshot: () => {},
    clearHistory: () => {},
    undoStack: [],
    redoStack: [],
    historyManager: historyMgr,
    resetStoreState: () => {},
    findEntryByKey: (key: string) =>
      state.trail.find((e) => e.key === key) ?? state.floating.find((e) => e.key === key),
    startBatch: () => {},
    endBatch: () => {},
    middlewareEngine: mw,
    popoverDAG: dag,
    ...depOverrides,
  };

  const mockActions: PopoverActions<TData, TContext, TPopoverKey> = {
    setContext: () => {},
    setResolveData: () => {},
    setOwnerId: () => {},
    openRoot: () => {},
    pushNested: () => {},
    openRootWithResolver: () => Promise.resolve(),
    openNestedWithResolver: () => Promise.resolve(),
    closeFrom: () => {},
    closeByKey: () => {},
    closeAll: () => {},
    clear: () => {},
    clearTrail: () => {},
    closeTopmost: () => {},
    togglePin: () => {},
    bringToFront: () => {},
    updateOffset: () => {},
    retryPopover: () => Promise.resolve(),
    prefetchPopover: () => Promise.resolve({} as TData),
    invalidate: () => Promise.resolve(),
    undo: () => {},
    redo: () => {},
    batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) =>
      fn(mockActions),
    setClosePinnedDescendants: () => {},
    setCollisionConfig: () => {},
    setEnableArrowNavigation: () => {},
    setDebug: () => {},
    setCascadeOffsetStep: () => {},
    setExitTransitionDuration: () => {},
    setDefaultOffset: () => {},
    setBaseZIndex: () => {},
    setGlobalAnimationClassNames: () => {},
    setAllowDragWhenPinned: () => {},
    setAllowDragWhenUnpinned: () => {},
    setMobileBreakpoint: () => {},
    setFocusLockOptions: () => {},
    hoverEnter: () => {},
    hoverLeave: () => {},
    setTransitionStatus: () => {},
    subscribeKey: () => () => {},
    subscribeEvent: () => () => {},
    useMiddleware: () => () => {},
    canUndo: () => false,
    canRedo: () => false,
    transaction: () => Promise.resolve(true),
    persistState: () => Promise.resolve(),
    rehydrateState: () => Promise.resolve(true),
    setButtonControls: () => {},
    toggleButtonControl: () => {},
    setStackGroupFilter: () => {},
    setResponsiveMode: () => {},
    setZIndexBaseMap: () => {},
    setSlotComponents: () => {},
    runTransition: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) =>
      fn(mockActions),
    destroy: () => {},
  };

  const get: SliceContext<TData, TContext, TPopoverKey, TSliceState>['get'] = () => {
    const raw = {
      ...state,
      ...mockActions,
      actions: mockActions,
    };
    return raw satisfies object as ReturnType<
      SliceContext<TData, TContext, TPopoverKey, TSliceState>['get']
    >;
  };

  const set: SliceContext<TData, TContext, TPopoverKey, TSliceState>['set'] = (next) => {
    const patch =
      typeof next === 'function'
        ? (next(get()) as Partial<PopoverStateData<TData, TContext, TPopoverKey>>)
        : (next as Partial<PopoverStateData<TData, TContext, TPopoverKey>>);
    state = { ...state, ...patch };
  };

  return {
    get state() {
      return state;
    },
    set state(nextState) {
      state = nextState;
    },
    get,
    set,
    deps,
  };
}
