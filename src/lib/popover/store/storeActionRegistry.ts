/**
 * Store Action Registry Composition Root for popover-trail.
 * Composes domain action slices (sliceTrail, slicePinning, sliceResolver, sliceConfig, slicePersistence) into a unified registry.
 *
 * @module storeActionRegistry
 */

import type { PopoverActions, PopoverStoreEvent, PopoverStateData, PopoverCache } from '../types';
import { createTrailSlice } from './slices/sliceTrail';
import { createPinningSlice } from './slices/slicePinning';
import { createResolverSlice } from './slices/sliceResolver';
import { createConfigSlice } from './slices/sliceConfig';
import { createPersistenceSlice } from './slices/slicePersistence';
import type { PopoverMiddlewareEngine } from './storeMiddlewareEngine';
import type { SliceContext } from './slices/sliceContext';
import type { ResolvePopoverEntryParams } from './storeResolverPipeline';
import type { StoreSetFn, StoreGetFn } from './storeTypes';
import type { HistoryManager, HistorySnapshot } from './history';

export interface ActionRegistryDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  activeControllers: Map<string, AbortController>;
  inFlightPromises: Map<string, Promise<TData>>;
  hoverCloseTimers: Map<string, ReturnType<typeof setTimeout>>;
  transitionTimers: Map<string, ReturnType<typeof setTimeout>>;
  eventListeners: Set<(event: PopoverStoreEvent<TData>) => void>;
  clearHoverTimer: (key: string) => void;
  clearTransitionTimer: (key: string) => void;
  scheduleHoverLeave?: (key: string, delay: number, callback: () => void) => void;
  scheduleTransitionExit?: (key: string, duration: number, callback: () => void) => void;
  abortControllersForKeys: (keys: Iterable<string>) => void;
  resetStoreState: () => void;
  incrementRootCounter: () => number;
  isRootStale: (startedCounter: number) => boolean;
  incrementNestedCounter: (parentKey: string) => number;
  isNestedStale: (parentKey: string, startedCounter: number) => boolean;
  findEntryByKey: (key: string) => import('../types').TrailEntry<TData> | undefined;
  resolvePopoverEntry: (
    params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  ) => Promise<void>;
  pushSnapshot: (state: PopoverStateData<TData, TContext>) => void;
  clearHistory: () => void;
  undoStack: HistorySnapshot<TData>[];
  redoStack: HistorySnapshot<TData>[];
  historyManager?: HistoryManager<TData>;
  startBatch: () => void;
  endBatch: () => void;
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
  cache?: PopoverCache<TData>;
  popoverDAG?: import('../utils/dag').PopoverDAG;
}

/**
 * Composes all domain action slices into a unified PopoverActions object bound to Zustand set/get.
 *
 * @remarks
 * Merges five modular slices:
 * - `trailSlice`: Cascade navigation, push, close, and transition animations.
 * - `pinningSlice`: Modeless pinning, z-index elevation, and drag offsets.
 * - `resolverSlice`: Async data loading, optimistic dispatch, retries, and prefetching.
 * - `configSlice`: Global options, collision avoidance, hover timers, and responsive modes.
 * - `persistenceSlice`: Snapshot persistence, localStorage rehydration, undo, and redo.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param set - Zustand state setter callback function.
 * @param get - Zustand state getter callback function.
 * @param deps - Internal subsystem dependencies.
 * @returns Fully composed PopoverActions record.
 */
export function createStoreActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  set: StoreSetFn<TData, TContext, TPopoverKey>,
  get: StoreGetFn<TData, TContext, TPopoverKey>,
  deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey> {
  const ctx: SliceContext<TData, TContext, TPopoverKey> = { set, get, deps };
  const trailSlice = createTrailSlice<TData, TContext, TPopoverKey>(ctx);
  const pinningSlice = createPinningSlice<TData, TContext, TPopoverKey>(ctx);
  const resolverSlice = createResolverSlice<TData, TContext, TPopoverKey>(ctx);
  const configSlice = createConfigSlice<TData, TContext, TPopoverKey>(ctx);
  const persistenceSlice = createPersistenceSlice<TData, TContext, TPopoverKey>(ctx);

  const actions: PopoverActions<TData, TContext, TPopoverKey> = {
    ...trailSlice,
    ...pinningSlice,
    ...resolverSlice,
    ...configSlice,
    ...persistenceSlice,
  };
  return actions;
}
