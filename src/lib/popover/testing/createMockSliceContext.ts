/**
 * Mock Slice Context DI Fixture Provider for Unit Testing popover-trail slices.
 * Eliminates double type assertions (`as unknown as SliceContext`) across all slice tests.
 *
 * @module testing/createMockSliceContext
 */

import type { SliceContext } from '../store/slices';
import type { PopoverStateData, PopoverActions, PopoverStoreEvent, PopoverStore } from '../types';
import type { ActionRegistryDependencies } from '../store/storeActionRegistry';
import {
  createHistoryManager,
  createHistorySnapshot,
  type HistorySnapshot,
} from '../store/history';
import { createMockStoreState } from './createMockStoreState';
import { PopoverDAG } from '../utils/dag';
import { PopoverMiddlewareEngine } from '../store/storeMiddlewareEngine';
import { PopoverTransitionScheduler } from '../store/transitionScheduler';
import { PopoverEventBus, dispatchStoreEvent } from '../store/eventBus';
import { runEffects, type Effect } from '../store/effects';
import { findEntryInStore } from '../utils/collections';
import { noop, constant } from '../utils/functional';

export interface SliceTestHarness<
  TActions = PopoverActions,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  actions: TActions;
  context: SliceContext<TData, TContext, TPopoverKey> & {
    deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
  };
  state: PopoverStateData<TData, TContext, TPopoverKey>;
  deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
  snapshots: HistorySnapshot<TData, TPopoverKey>[];
  emittedEvents: PopoverStoreEvent<TData>[];
  getState: () => PopoverStateData<TData, TContext, TPopoverKey>;
  setState: (
    partial:
      | Partial<PopoverStateData<TData, TContext, TPopoverKey>>
      | ((
          s: PopoverStateData<TData, TContext, TPopoverKey>,
        ) => Partial<PopoverStateData<TData, TContext, TPopoverKey>>),
  ) => void;
  getDAG: () => PopoverDAG<TPopoverKey> | undefined;
  getScheduler: () => PopoverTransitionScheduler<TPopoverKey>;
  getEventBus: () => PopoverEventBus<TData, TPopoverKey>;
  getHistory: () => ReturnType<typeof createHistoryManager<TData, TPopoverKey>> | undefined;
  set: SliceContext<TData, TContext, TPopoverKey>['set'];
  get: SliceContext<TData, TContext, TPopoverKey>['get'];
}

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
  snapshots: HistorySnapshot<TData, TPopoverKey>[];
  emittedEvents: PopoverStoreEvent<TData, TPopoverKey>[];
  getState: () => PopoverStateData<TData, TContext, TPopoverKey>;
  getDAG: () => PopoverDAG<TPopoverKey> | undefined;
  getScheduler: () => PopoverTransitionScheduler<TPopoverKey>;
  getEventBus: () => PopoverEventBus<TData, TPopoverKey>;
  getHistory: () =>
    | ReturnType<typeof createHistoryManager<TData, TPopoverKey, TContext>>
    | undefined;
  setBoundActions: (actions: Record<string, unknown>) => void;
} {
  let state = createMockStoreState<TData, TContext, TPopoverKey>(initialOverrides);
  const historyMgr = createHistoryManager<TData, TPopoverKey, TContext>();
  const dag = new PopoverDAG<TPopoverKey>();
  const mw = new PopoverMiddlewareEngine<TData, TContext, TPopoverKey>();
  const transitionScheduler = new PopoverTransitionScheduler<TPopoverKey>();
  const eventBus = new PopoverEventBus<TData, TPopoverKey>();
  const eventListeners = new Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>();
  const snapshots: HistorySnapshot<TData, TPopoverKey>[] = [];
  const emittedEvents: PopoverStoreEvent<TData, TPopoverKey>[] = [];
  let boundActions: Record<string, unknown> = {};

  const deps: ActionRegistryDependencies<TData, TContext, TPopoverKey> = {
    activeControllers: new Map<string, AbortController>(),
    inFlightPromises: new Map<string, Promise<TData>>(),
    abortControllersForKeys: noop,
    abortAllControllers: noop,
    incrementRootCounter: () => 1,
    isRootStale: constant(false),
    incrementNestedCounter: () => 1,
    isNestedStale: constant(false),
    markAllCountersStale: noop,
    resolvePopoverEntry: () => Promise.resolve(),
    transitionScheduler,
    eventBus,
    eventListeners,
    emitStoreEvent: (event: PopoverStoreEvent<TData, TPopoverKey>) => {
      emittedEvents.push(event);
      dispatchStoreEvent(eventListeners, event, eventBus);
    },
    dispatchEffects: (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => {
      runEffects(effects, {
        transitionScheduler,
        popoverDAG: dag,
        eventBus,
        eventListeners,
        emitStoreEvent: (event: PopoverStoreEvent<TData, TPopoverKey>) => {
          emittedEvents.push(event);
          dispatchStoreEvent(eventListeners, event, eventBus);
        },
        abortControllersForKeys: deps.abortControllersForKeys,
        abortAllControllers: deps.abortAllControllers,
        pushSnapshot: (s) => {
          const snap = createHistorySnapshot(s);
          snapshots.push(snap);
          historyMgr.pushSnapshot(s);
        },
        getStoreState: () => state,
        findEntryByKey: (key: string) => findEntryInStore(state.floating, state.trail, key),
        resetStoreState: noop,
      });
    },
    pushSnapshot: (s: PopoverStateData<TData, TContext, TPopoverKey>) => {
      const snap = createHistorySnapshot(s);
      snapshots.push(snap);
      historyMgr.pushSnapshot(s);
    },
    clearHistory: () => historyMgr.clearHistory(),
    undoStack: historyMgr.undoStack,
    redoStack: historyMgr.redoStack,
    historyManager: historyMgr,
    resetStoreState: noop,
    findEntryByKey: (key: string) => findEntryInStore(state.floating, state.trail, key),
    startBatch: noop,
    endBatch: noop,
    middlewareEngine: mw,
    popoverDAG: dag,
    ...depOverrides,
  };

  const get: SliceContext<TData, TContext, TPopoverKey, TSliceState>['get'] = () => {
    return {
      ...state,
      ...boundActions,
      actions: boundActions,
    } as PopoverStore<TData, TContext, TPopoverKey> & TSliceState;
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
    snapshots,
    emittedEvents,
    getState: () => state,
    getDAG: () => deps.popoverDAG,
    getScheduler: () => deps.transitionScheduler,
    getEventBus: () => deps.eventBus,
    getHistory: () => deps.historyManager,
    setBoundActions: (acts) => {
      boundActions = acts;
    },
    get,
    set,
    deps,
  };
}

export function createSliceTestHarness<
  TActions,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  sliceFactory: (ctx: SliceContext<TData, TContext, TPopoverKey>) => TActions,
  initialOverrides?: Partial<PopoverStateData<TData, TContext, TPopoverKey>>,
  depOverrides?: Partial<ActionRegistryDependencies<TData, TContext, TPopoverKey>>,
): SliceTestHarness<TActions, TData, TContext, TPopoverKey>;
export function createSliceTestHarness<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  initialOverrides?: Partial<PopoverStateData<TData, TContext, TPopoverKey>>,
  depOverrides?: Partial<ActionRegistryDependencies<TData, TContext, TPopoverKey>>,
): SliceTestHarness<PopoverActions<TData, TContext, TPopoverKey>, TData, TContext, TPopoverKey>;
export function createSliceTestHarness<
  TActions = Record<string, unknown>,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  sliceFactoryOrOverrides?:
    | ((ctx: SliceContext<TData, TContext, TPopoverKey>) => TActions)
    | Partial<PopoverStateData<TData, TContext, TPopoverKey>>,
  initialOverridesOrDepOverrides?:
    | Partial<PopoverStateData<TData, TContext, TPopoverKey>>
    | Partial<ActionRegistryDependencies<TData, TContext, TPopoverKey>>,
  depOverrides?: Partial<ActionRegistryDependencies<TData, TContext, TPopoverKey>>,
): SliceTestHarness<TActions, TData, TContext, TPopoverKey> {
  const isFactory = typeof sliceFactoryOrOverrides === 'function';
  const initialOverrides = isFactory
    ? (initialOverridesOrDepOverrides as Partial<PopoverStateData<TData, TContext, TPopoverKey>>)
    : (sliceFactoryOrOverrides as Partial<PopoverStateData<TData, TContext, TPopoverKey>>);
  const actualDepOverrides = isFactory
    ? depOverrides
    : (initialOverridesOrDepOverrides as Partial<
        ActionRegistryDependencies<TData, TContext, TPopoverKey>
      >);

  const mockCtx = createMockSliceContext<TData, TContext, TPopoverKey>(
    initialOverrides,
    actualDepOverrides,
  );
  const actions = isFactory
    ? (sliceFactoryOrOverrides as (ctx: SliceContext<TData, TContext, TPopoverKey>) => TActions)(
        mockCtx,
      )
    : ({} as TActions);

  mockCtx.setBoundActions(actions as Record<string, unknown>);

  return {
    actions,
    context: mockCtx,
    get state() {
      return mockCtx.state;
    },
    set state(s) {
      mockCtx.state = s;
    },
    snapshots: mockCtx.snapshots,
    emittedEvents: mockCtx.emittedEvents,
    deps: mockCtx.deps,
    getState: mockCtx.getState,
    setState: (partial) => {
      mockCtx.set(partial as Partial<PopoverStateData<TData, TContext, TPopoverKey>>);
    },
    getDAG: mockCtx.getDAG,
    getScheduler: mockCtx.getScheduler,
    getEventBus: mockCtx.getEventBus,
    getHistory: mockCtx.getHistory,
    set: mockCtx.set,
    get: mockCtx.get,
  };
}
