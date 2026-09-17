/**
 * Scoped Read-Only State Queries for Popover Cards.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/cardQueries
 */

import type { PopoverStore, TrailEntry, DragOffset } from '../../types';
import { EMPTY_ARRAY } from '../../types/branded';
import {
  selectEntryByKey,
  selectOffset,
  selectBreadcrumbs,
  selectPopoverDepth,
} from '../../store/selectors';

export function getCardEntry<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): TrailEntry<TData, TPopoverKey> | undefined {
  return selectEntryByKey<TData, TPopoverKey>(key)(state);
}

export function getCardOffset<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): DragOffset {
  return selectOffset<TPopoverKey>(key)(state);
}

export function getCardBreadcrumbs<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[] {
  return selectBreadcrumbs<TPopoverKey, TData>(key)(state);
}

export function getCardDepth<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): number {
  return selectPopoverDepth<TPopoverKey, TData>(key)(state);
}

export function getCardParents<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[] {
  const parents = state.getParents(key);
  return parents.size === 0 ? EMPTY_ARRAY : [...parents];
}

export function getCardChildren<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[] {
  const children = state.getChildren(key);
  return children.size === 0 ? EMPTY_ARRAY : [...children];
}
