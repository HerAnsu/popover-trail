/**
 * Store Action Registry Composition Root for popover-trail.
 * Composes domain action slices into a unified registry using structured service contracts.
 *
 * @module storeActionRegistry
 */

import type {
  PopoverActions,
  PopoverStateData,
  PopoverCache,
  PopoverStore,
  PopoverStoreEvent,
  TrailEntry,
  StoreSliceDescriptor,
} from '../types';
import { createTrailSlice } from './slices/sliceTrail';
import { createPinningSlice } from './slices/slicePinning';
import { createResolverSlice } from './slices/sliceResolver';
import { createConfigSlice } from './slices/sliceConfig';
import { createPersistenceSlice } from './slices/slicePersistence';
import type { PopoverMiddlewareEngine } from './storeMiddlewareEngine';
import type { PopoverTransitionScheduler } from './transitionScheduler';
import type { PopoverEventBus } from './eventBus';
import type { SliceContext } from './slices/sliceContext';
import type { ResolvePopoverEntryParams } from './storeResolverPipeline';
import type { StoreSetFn, StoreGetFn } from './storeTypes';
import type { HistoryManager, HistorySnapshot } from './history';
import type { PopoverDAG } from '../utils/dag';

declare const process: { env?: Record<string, string | undefined> } | undefined;

/**
 * Service dependencies container for asynchronous resolution, cancellation, and race condition management.
 */
export interface StoreAsyncPipelineService<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  activeControllers: Map<string, AbortController>;
  inFlightPromises: Map<string, Promise<TData>>;
  abortControllersForKeys: (keys: Iterable<string>) => void;
  incrementRootCounter: () => number;
  isRootStale: (startedCounter: number) => boolean;
  incrementNestedCounter: (parentKey: string) => number;
  isNestedStale: (parentKey: string, startedCounter: number) => boolean;
  markAllCountersStale: () => void;
  resolvePopoverEntry: (
    params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  ) => Promise<void>;
}

/**
 * Service dependencies container for unified timer and transition lifecycle scheduling.
 */
export interface StoreTimerService {
  readonly transitionScheduler: PopoverTransitionScheduler;
}

/**
 * Service dependencies container for history state management and undo/redo time travel.
 */
export interface StoreHistoryService<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  pushSnapshot: (state: PopoverStateData<TData, TContext, TPopoverKey>) => void;
  clearHistory: () => void;
  undoStack: HistorySnapshot<TData, TPopoverKey>[];
  redoStack: HistorySnapshot<TData, TPopoverKey>[];
  historyManager?: HistoryManager<TData, TPopoverKey>;
}

/**
 * Service dependencies container for graph topology, middleware, batching, and unified event pub/sub.
 */
export interface StoreInfrastructureService<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  eventListeners: Set<(event: PopoverStoreEvent<TData>) => void>;
  eventBus: PopoverEventBus<TData, TPopoverKey>;
  resetStoreState: () => void;
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
  startBatch: () => void;
  endBatch: () => void;
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
  cache?: PopoverCache<TData>;
  popoverDAG?: PopoverDAG<TPopoverKey>;
  subscribeState?: (
    listener: (
      state: PopoverStore<TData, TContext, TPopoverKey>,
      prevState: PopoverStore<TData, TContext, TPopoverKey>,
    ) => void,
  ) => () => void;
  readonly customSlices?: readonly StoreSliceDescriptor<
    object,
    object,
    TData,
    TContext,
    TPopoverKey
  >[];
}

/**
 * Complete action registry dependency container combining all domain service interfaces.
 */
export interface ActionRegistryDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>
  extends
    StoreAsyncPipelineService<TData, TContext, TPopoverKey>,
    StoreTimerService,
    StoreHistoryService<TData, TContext, TPopoverKey>,
    StoreInfrastructureService<TData, TContext, TPopoverKey> {}

const RESERVED_CORE_ACTION_NAMES: ReadonlySet<string> = new Set([
  'setContext',
  'setResolveData',
  'setOwnerId',
  'openRoot',
  'pushNested',
  'togglePin',
  'bringToFront',
  'closeFrom',
  'updateOffset',
  'clear',
  'closeAll',
  'clearTrail',
  'closeTopmost',
  'openRootWithResolver',
  'openNestedWithResolver',
  'retryPopover',
  'prefetchPopover',
  'invalidate',
  'subscribeKey',
  'destroy',
  'setClosePinnedDescendants',
  'setCollisionConfig',
  'closeByKey',
  'setEnableArrowNavigation',
  'setDebug',
  'hoverEnter',
  'hoverLeave',
  'setCascadeOffsetStep',
  'setTransitionStatus',
  'setExitTransitionDuration',
  'setDefaultOffset',
  'setBaseZIndex',
  'setGlobalAnimationClassNames',
  'setAllowDragWhenPinned',
  'setAllowDragWhenUnpinned',
  'setMobileBreakpoint',
  'setFocusLockOptions',
  'subscribeEvent',
  'batchUpdates',
  'runTransition',
  'useMiddleware',
  'undo',
  'redo',
  'canUndo',
  'canRedo',
  'transaction',
  'persistState',
  'rehydrateState',
  'setButtonControls',
  'toggleButtonControl',
  'setStackGroupFilter',
  'setResponsiveMode',
  'setZIndexBaseMap',
  'setSlotComponents',
]);

/**
 * Composes all domain action slices into a unified PopoverActions object bound to Zustand set/get.
 * Merges extensible custom slices while protecting reserved core action names.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @template TCustomActions - Inferred dictionary of custom slice actions.
 */
export function createStoreActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TCustomActions extends object = object,
>(
  set: StoreSetFn<TData, TContext, TPopoverKey>,
  get: StoreGetFn<TData, TContext, TPopoverKey>,
  deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey> & TCustomActions {
  const ctx: SliceContext<TData, TContext, TPopoverKey> = { set, get, deps };

  const coreActions: PopoverActions<TData, TContext, TPopoverKey> = {
    ...createTrailSlice<TData, TContext, TPopoverKey>(ctx),
    ...createPinningSlice<TData, TContext, TPopoverKey>(ctx),
    ...createResolverSlice<TData, TContext, TPopoverKey>(ctx),
    ...createConfigSlice<TData, TContext, TPopoverKey>(ctx),
    ...createPersistenceSlice<TData, TContext, TPopoverKey>(ctx),
  };

  const customSlices = deps.customSlices;
  if (!customSlices || customSlices.length === 0) {
    return coreActions as PopoverActions<TData, TContext, TPopoverKey> & TCustomActions;
  }

  const mergedActions: Record<string, unknown> = { ...coreActions };

  for (const descriptor of customSlices) {
    const createFn = descriptor.create as (
      c: SliceContext<TData, TContext, TPopoverKey>,
    ) => Record<string, unknown>;
    const extension = createFn(ctx);
    if (!extension || typeof extension !== 'object') continue;

    for (const [actionName, actionFn] of Object.entries(extension)) {
      if (RESERVED_CORE_ACTION_NAMES.has(actionName)) {
        if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
          console.warn(
            `[popover-trail OCP Warning]: Custom slice "${descriptor.name}" attempted to override reserved core action "${actionName}". Core action was preserved.`,
          );
        }
        continue;
      }
      mergedActions[actionName] = actionFn;
    }
  }

  return mergedActions as PopoverActions<TData, TContext, TPopoverKey> & TCustomActions;
}
