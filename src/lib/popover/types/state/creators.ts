/**
 * Store Slice Creator Signatures and Data Mappings for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/state/creators
 */

import type { PopoverStore } from '../selectorTypes';
import type { StatePatch } from './taxonomy';

export type OnlyDataState<TState> = Omit<
  TState,
  'actions' | 'batchUpdates' | 'destroy' | 'setState' | 'getState' | 'subscribe'
>;

export type StoreSetFn<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> = (
  partial:
    | StatePatch<TData, TContext, TPopoverKey>
    | Partial<TSliceState>
    | ((
        state: PopoverStore<TData, TContext, TPopoverKey> & TSliceState,
      ) => StatePatch<TData, TContext, TPopoverKey> | Partial<TSliceState>),
  replace?: boolean,
) => void;

export type StoreGetFn<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> = () => PopoverStore<TData, TContext, TPopoverKey> & TSliceState;

export type StoreSliceCreator<
  TSlice,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> = (
  set: StoreSetFn<TData, TContext, TPopoverKey, TSliceState>,
  get: StoreGetFn<TData, TContext, TPopoverKey, TSliceState>,
) => TSlice;

export type PopoverDataMap<TPopoverKey extends string = string> = Record<TPopoverKey, unknown>;

export type ResolveDataForKey<
  TDataMap extends object,
  K extends string,
  TFallback = unknown,
> = K extends keyof TDataMap ? TDataMap[K] : TFallback;
