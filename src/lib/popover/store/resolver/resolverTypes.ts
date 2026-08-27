/**
 * Type Definitions for Popover Store Data Resolution Pipeline.
 *
 * @module store/resolver/resolverTypes
 */

import type {
  PopoverResolver,
  ResolverParams,
  TrailEntry,
  PopoverCache,
  OpenRootOptions,
  OpenNestedOptions,
  StatePatch,
  StoreState,
  PopoverStoreEvent,
} from '../../types';
import type { PopoverDAG } from '../../utils/dag';
import type { PopoverEventBus } from '../eventBus';

export interface ResolverPipelineDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  popoverDAG: PopoverDAG;
  cache?: PopoverCache<TData>;
  resolveData: PopoverResolver<TData, TContext>;
  initialContext?: TContext;
  inFlightPromises: Map<string, Promise<TData>>;
  registerController: (key: string) => AbortController;
  removeController: (key: string, controller?: AbortController) => void;
  safeSet: (
    partial:
      | StatePatch<TData, TContext, TPopoverKey>
      | ((
          state: StoreState<TData, TContext, TPopoverKey>,
        ) => StatePatch<TData, TContext, TPopoverKey>),
  ) => void;
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
  eventBus?: PopoverEventBus<TData, TPopoverKey>;
  eventListeners?: Set<(event: PopoverStoreEvent<TData>) => void>;
}

export interface ResolvePopoverEntryParams<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  key: TPopoverKey;
  parentKey?: TPopoverKey;
  rect?: DOMRect | null;
  parentData?: TData | null;
  options?: OpenRootOptions & OpenNestedOptions;
  controllerKey: string;
  incrementCounter: () => number;
  isStale: (counter: number) => boolean;
  insertStatePatch: (
    entry: TrailEntry<TData, TPopoverKey>,
  ) =>
    | StatePatch<TData, TContext, TPopoverKey>
    | ((
        state: StoreState<TData, TContext, TPopoverKey>,
      ) => StatePatch<TData, TContext, TPopoverKey>);
}

export type AnyResolverFn<TData, TContext> =
  | PopoverResolver<TData, TContext>
  | ((params: ResolverParams<TData, TContext>) => Promise<TData> | TData);

/**
 * Normalized entry-factory signature threaded through every resolution stage.
 */
export type EntryBuilderFn<TData, TPopoverKey extends string = string> = (
  data?: TData | null,
  error?: Error | null,
  isLoading?: boolean,
) => TrailEntry<TData, TPopoverKey>;

/** Argument bundle for the L1 cache / existing-state fast-path attempt. */
export interface CacheResolutionAttemptArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  cache: PopoverCache<TData> | undefined;
  storeCache: PopoverCache<TData> | null | undefined;
  existingEntry: TrailEntry<TData, TPopoverKey> | undefined;
  key: TPopoverKey;
  forceRefresh: boolean;
  requestCounter: number;
  resolveParams: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>;
  safeSet: ResolverPipelineDependencies<TData, TContext, TPopoverKey>['safeSet'];
  buildEntry: EntryBuilderFn<TData, TPopoverKey>;
  eventListeners?: Set<(event: PopoverStoreEvent<TData>) => void>;
  eventBus?: PopoverEventBus<TData, TPopoverKey>;
}

/** Argument bundle for launching a synchronous (same-tick) resolver invocation. */
export interface SyncResolutionLaunchArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  key: TPopoverKey;
  controllerKey: string;
  parentData: unknown;
  activeResolver: PopoverResolver<TData, TContext> | undefined;
  currentContext: TContext;
  forceRefresh: boolean;
  requestCounter: number;
  resolveParams: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>;
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>;
  storeCache: PopoverCache<TData> | null | undefined;
  buildEntry: EntryBuilderFn<TData, TPopoverKey>;
}

/** Argument bundle for awaiting an already in-flight asynchronous resolution. */
export interface AwaitInFlightResolutionArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  inFlight: Promise<TData>;
  key: TPopoverKey;
  requestCounter: number;
  resolveParams: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>;
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>;
  storeCache: PopoverCache<TData> | undefined;
  buildEntry: EntryBuilderFn<TData, TPopoverKey>;
}
