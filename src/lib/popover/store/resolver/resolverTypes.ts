/**
 * Type Contracts for Popover Store Data Resolution Pipeline.
 *
 * @module store/resolver/resolverTypes
 */

import type {
  PopoverResolver,
  ResolverParams,
  TrailEntry,
  PopoverCache,
  PopoverRect,
  OpenRootOptions,
  OpenNestedOptions,
  StatePatch,
  StoreState,
  PopoverStoreEvent,
} from '../../types';
import type { PopoverDAG } from '../../utils/dag';
import type { PopoverEventBus } from '../eventBus';

export * from './resolverStageTypes';

export type StatePatchUpdater<TData, TContext, TPopoverKey extends string> =
  | StatePatch<TData, TContext, TPopoverKey>
  | ((state: StoreState<TData, TContext, TPopoverKey>) => StatePatch<TData, TContext, TPopoverKey>);

export type EntryBuilderFn<TData, TPopoverKey extends string> = (
  data?: TData | null,
  error?: Error | null,
  isLoading?: boolean,
) => TrailEntry<TData, TPopoverKey>;

export interface ResolverPipelineDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly popoverDAG: PopoverDAG<TPopoverKey>;
  readonly cache?: PopoverCache<TData>;
  readonly resolveData: PopoverResolver<TData, TContext>;
  readonly initialContext?: TContext;
  readonly inFlightPromises: Map<string, Promise<TData>>;
  readonly registerController: (key: string) => AbortController;
  readonly removeController: (key: string, controller?: AbortController) => void;
  readonly safeSet: (partial: StatePatchUpdater<TData, TContext, TPopoverKey>) => void;
  readonly findEntryByKey: (
    key: TPopoverKey | string,
  ) => TrailEntry<TData, TPopoverKey> | undefined;
  readonly eventBus?: PopoverEventBus<TData, TPopoverKey>;
  readonly eventListeners?: Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
}

export interface ResolvePopoverEntryParams<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly key: TPopoverKey;
  readonly parentKey?: TPopoverKey;
  readonly rect?: DOMRect | PopoverRect | null;
  readonly parentData?: TData | null;
  readonly options?: OpenRootOptions & OpenNestedOptions;
  readonly controllerKey: string;
  readonly incrementCounter: () => number;
  readonly isStale: (counter: number) => boolean;
  readonly insertStatePatch: (
    entry: TrailEntry<TData, TPopoverKey>,
  ) => StatePatchUpdater<TData, TContext, TPopoverKey>;
}

export type AnyResolverFn<TData, TContext> =
  | PopoverResolver<TData, TContext>
  | ((params: ResolverParams<TData, TContext>) => Promise<TData> | TData);

export type ResolverLaunchResult<TData> =
  | { readonly isSync: true; readonly result: TData }
  | { readonly isSync: false; readonly hasError: boolean };
