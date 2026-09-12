/**
 * Core Slice Context Definitions for Trail, Pinning, and Resolver Slices.
 *
 * @module store/slices/sliceContextCore
 */

import type { StoreGetFn, StoreSetFn } from '../storeTypes';
import type { PopoverDAG } from '../../utils/dag';
import type { Effect } from '../effects';
import type { TrailEntry, PopoverCache } from '../../types';
import type { ResolvePopoverEntryParams } from '../storeResolverPipeline';
import type { HistorySnapshot } from '../history';

export interface BaseSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> {
  readonly set: StoreSetFn<TData, TContext, TPopoverKey, TSliceState>;
  readonly get: StoreGetFn<TData, TContext, TPopoverKey, TSliceState>;
}

export interface TrailSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseSliceContext<TData, TContext, TPopoverKey> {
  readonly deps: {
    readonly popoverDAG?: PopoverDAG<TPopoverKey>;
    readonly dispatchEffects: (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => void;
    readonly findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
    readonly resetStoreState?: () => void;
  };
}

export interface PinningSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseSliceContext<TData, TContext, TPopoverKey> {
  readonly deps: {
    readonly popoverDAG?: PopoverDAG<TPopoverKey>;
    readonly dispatchEffects: (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => void;
  };
}

export interface ResolverSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseSliceContext<TData, TContext, TPopoverKey> {
  readonly deps: {
    readonly resolvePopoverEntry: (
      params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
    ) => Promise<void>;
    readonly cache?: PopoverCache<TData>;
    readonly popoverDAG?: PopoverDAG<TPopoverKey>;
    readonly dispatchEffects: (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => void;
    readonly isRootStale: (counter: number) => boolean;
    readonly isNestedStale: (parentKey: string, counter: number) => boolean;
    readonly incrementRootCounter?: () => number;
    readonly incrementNestedCounter?: (parentKey: string) => number;
    readonly findEntryByKey?: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
    readonly activeControllers?: Map<string, AbortController>;
    readonly inFlightPromises?: Map<string, Promise<unknown>>;
    readonly abortControllersForKeys?: (keys: Iterable<TPopoverKey>) => void;
    readonly pushSnapshot?: (snap: HistorySnapshot<TData, TPopoverKey>) => void;
  };
}
