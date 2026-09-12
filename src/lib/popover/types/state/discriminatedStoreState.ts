/**
 * Discriminated Store Lifecycle State Models and Predicates for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/state/discriminatedStoreState
 */

import type { TrailEntry } from '../entryTypes';
import type { PopoverStateData } from './taxonomy';

export type IdleStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext, TPopoverKey> & {
  readonly status: 'idle';
  readonly trail: readonly [];
  readonly floating: readonly [];
  readonly anchorElement: null;
  readonly anchorRect: null;
  readonly ownerId: null;
};

export type ActiveTrailStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext, TPopoverKey> & {
  readonly status: 'active-trail';
  readonly trail: readonly [TrailEntry<TData, TPopoverKey>, ...TrailEntry<TData, TPopoverKey>[]];
  readonly anchorElement: HTMLElement;
  readonly anchorRect: DOMRect;
  readonly ownerId: string;
};

export type PinnedOnlyStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext, TPopoverKey> & {
  readonly status: 'pinned-only';
  readonly trail: readonly [];
  readonly floating: readonly [TrailEntry<TData, TPopoverKey>, ...TrailEntry<TData, TPopoverKey>[]];
  readonly anchorElement: null;
  readonly anchorRect: null;
  readonly ownerId: null;
};

export type PopoverStoreDiscriminatedState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> =
  | IdleStoreState<TData, TContext, TPopoverKey>
  | ActiveTrailStoreState<TData, TContext, TPopoverKey>
  | PinnedOnlyStoreState<TData, TContext, TPopoverKey>;

export function isStoreIdle<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is IdleStoreState<TData, TContext, TPopoverKey> {
  return state.trail.length === 0 && state.floating.length === 0;
}

export function isStoreActive<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is ActiveTrailStoreState<TData, TContext, TPopoverKey> {
  return state.trail.length > 0;
}

export function isStorePinnedOnly<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is PinnedOnlyStoreState<TData, TContext, TPopoverKey> {
  return state.trail.length === 0 && state.floating.length > 0;
}

export function selectDiscriminatedStatus<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): 'idle' | 'active-trail' | 'pinned-only' {
  if (state.trail.length > 0) return 'active-trail';
  if (state.floating.length > 0) return 'pinned-only';
  return 'idle';
}
