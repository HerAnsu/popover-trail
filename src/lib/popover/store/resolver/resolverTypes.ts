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
  removeController: (key: string) => void;
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
