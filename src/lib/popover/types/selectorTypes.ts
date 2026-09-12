/**
 * Selector Hook Return Signatures, Typed Store Api, and Compound PopoverStore Types.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/selectorTypes
 */

import type { StoreApi } from 'zustand/vanilla';
import type { TrailEntry, PopoverEntryDiscriminatedState } from './entry';
import type { PopoverStateData, DragOffset, StatePatch } from './state';
import type { PopoverActions } from './actions';
import type { RegisteredKeys, RegisteredDataMap } from './registerTypes';
import type { PopoverRect } from './geometry';

export type StateSelector<TState, TResult> = (state: TState) => TResult;
export type StateEqualityFn<T> = (a: T, b: T) => boolean;

export interface ClosedUsePopoverResult {
  readonly isOpen: false;
  readonly entry: undefined;
  readonly state: PopoverEntryDiscriminatedState<never>;
  readonly isPinned: false;
  readonly zIndex: -1;
  readonly isTop: false;
  readonly offset: DragOffset;
  readonly isLoading: false;
  readonly data: undefined;
  readonly error: undefined;
  readonly close: () => void;
  readonly pin: (rect?: DOMRect | PopoverRect) => void;
  readonly bringToFront: () => void;
  readonly updateOffset: (x: number, y: number) => void;
}

export interface OpenUsePopoverResult<TData = unknown, TPopoverKey extends string = string> {
  readonly isOpen: true;
  readonly entry: TrailEntry<TData, TPopoverKey>;
  readonly state: PopoverEntryDiscriminatedState<TData>;
  readonly isPinned: boolean;
  readonly zIndex: number;
  readonly isTop: boolean;
  readonly offset: DragOffset;
  readonly isLoading: boolean;
  readonly data: TData | null;
  readonly error: Error | null;
  readonly close: () => void;
  readonly pin: (rect?: DOMRect | PopoverRect) => void;
  readonly bringToFront: () => void;
  readonly updateOffset: (x: number, y: number) => void;
}

export type DiscriminatedUsePopoverResult<TData = unknown, TPopoverKey extends string = string> =
  | ClosedUsePopoverResult
  | OpenUsePopoverResult<TData, TPopoverKey>;

export interface UsePopoverResult<TData = unknown, TPopoverKey extends string = string> {
  readonly entry: TrailEntry<TData, TPopoverKey> | undefined;
  readonly state: PopoverEntryDiscriminatedState<TData>;
  readonly isOpen: boolean;
  readonly isPinned: boolean;
  readonly zIndex: number;
  readonly isTop: boolean;
  readonly offset: DragOffset;
  readonly isLoading: boolean;
  readonly data: TData | null | undefined;
  readonly error: Error | null | undefined;
  readonly close: () => void;
  readonly pin: (rect?: DOMRect | PopoverRect) => void;
  readonly bringToFront: () => void;
  readonly updateOffset: (x: number, y: number) => void;
}

export type PopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceActions = object,
> = PopoverStateData<TData, TContext, TPopoverKey> &
  PopoverActions<TData, TContext, TPopoverKey> &
  TSliceActions & {
    readonly actions: PopoverActions<TData, TContext, TPopoverKey> & TSliceActions;
  };

export interface TypedPopoverStoreApi<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
> extends Omit<StoreApi<PopoverStore<TData, TContext, TPopoverKey>>, 'getState' | 'setState'> {
  getState: () => PopoverStore<TData, TContext, TPopoverKey>;
  getServerSnapshot?: () => PopoverStore<TData, TContext, TPopoverKey>;
  setState: (
    partial:
      | StatePatch<TData, TContext, TPopoverKey>
      | ((
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => StatePatch<TData, TContext, TPopoverKey>),
    replace?: boolean,
  ) => void;
}
