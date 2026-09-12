/**
 * Aggregate Popover Actions, Transaction Slices, and Action Payloads.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/actions/aggregateActions
 */

import type { TrailEntry } from '../entryTypes';
import type { PopoverMiddleware } from '../middlewareTypes';
import type { PopoverStoreEvent } from '../eventTypes';
import type { PopoverPersistConfig } from '../config/storeConfig';
import type { TrailSliceActions } from './trailActions';
import type { PinningSliceActions } from './pinningActions';
import type { ResolverSliceActions } from './resolverActions';
import type { ConfigSliceActions } from './configActions';

export interface SubscriptionsSliceActions<
  TData = unknown,
  _TContext = unknown,
  TPopoverKey extends string = string,
> {
  subscribeKey: <K extends TPopoverKey = TPopoverKey, KData = TData>(
    key: K,
    listener: (
      entry: TrailEntry<KData, K> | undefined,
      prevEntry: TrailEntry<KData, K> | undefined,
    ) => void,
  ) => () => void;
  subscribeEvent: (
    listener: (event: PopoverStoreEvent<TData, TPopoverKey>) => void,
  ) => () => void;
}

export type SubscriptionSliceActions<
  TData = unknown,
  _TContext = unknown,
  TPopoverKey extends string = string,
> = SubscriptionsSliceActions<TData, _TContext, TPopoverKey>;

export interface TransactionsSliceActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;
  runTransition: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;
  transaction: (
    fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void,
  ) => Promise<boolean>;
  useMiddleware: (middleware: PopoverMiddleware<TData, TContext, TPopoverKey>) => () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export type TransactionSliceActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = TransactionsSliceActions<TData, TContext, TPopoverKey>;

export interface PersistenceSliceActions {
  persistState: (config?: PopoverPersistConfig) => Promise<void>;
  rehydrateState: (config?: PopoverPersistConfig) => Promise<boolean>;
  destroy: () => void;
}

export type PopoverActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = TrailSliceActions<TData, TContext, TPopoverKey> &
  PinningSliceActions<TData, TContext, TPopoverKey> &
  ResolverSliceActions<TData, TContext, TPopoverKey> &
  ConfigSliceActions<TData, TContext, TPopoverKey> &
  SubscriptionsSliceActions<TData, TContext, TPopoverKey> &
  TransactionsSliceActions<TData, TContext, TPopoverKey> &
  PersistenceSliceActions;

export type DefaultDataMap<TPopoverKey extends string = string, TData = unknown> = Record<
  TPopoverKey,
  TData
>;

export type ResolveDataFromMap<
  TDataMap,
  K extends string,
  TFallback = unknown,
> = K extends keyof TDataMap ? TDataMap[K] : TFallback;
