/**
 * Store Action Registry Composition Root for popover-trail.
 * Composes domain action slices (sliceTrail, slicePinning, sliceResolver, sliceConfig, slicePersistence) into a unified registry.
 *
 * @module storeActionRegistry
 */

import type {
  PopoverStore,
  PopoverActions,
  OpenRootOptions,
  OpenNestedOptions,
  PopoverStoreEvent,
  TrailEntry,
} from '../types';
import { createTrailSlice } from './slices/sliceTrail';
import { createPinningSlice } from './slices/slicePinning';
import { createResolverSlice } from './slices/sliceResolver';
import { createConfigSlice } from './slices/sliceConfig';
import { createPersistenceSlice } from './slices/slicePersistence';
import type { PopoverMiddlewareEngine } from './storeMiddlewareEngine';
import type { SliceContext } from './slices/sliceContext';
import type { StoreSetFn, StoreGetFn } from './storeTypes';

export interface ActionRegistryDependencies<TData = unknown, TContext = unknown> {
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
  findEntryByKey: (key: string) => TrailEntry<TData> | undefined;
  resolvePopoverEntry: (
    key: string,
    parentKey: string | undefined,
    rect: DOMRect | null,
    parentData: TData | undefined,
    options: (OpenRootOptions & OpenNestedOptions) | undefined,
    controllerKey: string,
    incrementCounter: () => number,
    isStale: (counter: number) => boolean,
    insertStatePatch: (
      entry: TrailEntry<TData>,
    ) =>
      | Partial<PopoverStore<TData, TContext>>
      | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStore<TData, TContext>>),
  ) => Promise<void>;
  pushSnapshot: (state: import('../types').PopoverStateData<TData, TContext>) => void;
  clearHistory: () => void;
  undoStack: unknown[];
  redoStack: unknown[];
  historyManager?: ReturnType<typeof import('./history').createHistoryManager<TData>>;
  startBatch: () => void;
  endBatch: () => void;
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext>;
  cache?: import('../types').PopoverCache<TData>;
}

/**
 * Creates and registers all store actions bound to set/get Zustand methods via SliceContext.
 */
export function createStoreActions<TData = unknown, TContext = unknown>(
  set: StoreSetFn<TData, TContext>,
  get: StoreGetFn<TData, TContext>,
  deps: ActionRegistryDependencies<TData, TContext>,
): PopoverActions<TData, TContext> {
  const ctx: SliceContext<TData, TContext> = { set, get, deps };
  return {
    ...createTrailSlice<TData, TContext>(ctx),
    ...createPinningSlice<TData, TContext>(ctx),
    ...createResolverSlice<TData, TContext>(ctx),
    ...createConfigSlice<TData, TContext>(ctx),
    ...createPersistenceSlice<TData, TContext>(ctx),
  };
}
