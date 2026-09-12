/**
 * Scoped State Mutation Helpers for Popover Cards.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/cardMutations
 */

import type { StoreApi } from 'zustand';
import type { PopoverStore } from '../../types';
import { selectIsPinned } from '../../store/selectors';

export function updateCardData<TData, TContext, TPopoverKey extends string>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  data: TData,
): void {
  store.setState((state) => {
    const inFloating = state.floating.some((e) => e.key === key);
    const inTrail = state.trail.some((e) => e.key === key);
    if (!inFloating && !inTrail) return state;

    return {
      floating: inFloating
        ? state.floating.map((e) => (e.key === key ? { ...e, data, isLoading: false } : e))
        : state.floating,
      trail: inTrail
        ? state.trail.map((e) => (e.key === key ? { ...e, data, isLoading: false } : e))
        : state.trail,
    };
  });
}

export function pinCard<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect,
): void {
  if (!selectIsPinned<TPopoverKey>(key)(state)) {
    state.togglePin(key, rect);
  }
}

export function unpinCard<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): void {
  if (selectIsPinned<TPopoverKey>(key)(state)) {
    state.togglePin(key);
  }
}

export function addCardParent<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  childKey: TPopoverKey,
  parentKey: TPopoverKey,
): boolean {
  return state.addEdge(parentKey, childKey);
}

export function removeCardParent<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  childKey: TPopoverKey,
  parentKey: TPopoverKey,
): void {
  state.removeEdge(parentKey, childKey);
}
