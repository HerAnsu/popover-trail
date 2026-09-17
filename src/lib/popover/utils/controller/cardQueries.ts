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

/**
 * Selects the active TrailEntry for a specific card key.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Popover key to find.
 * @returns Found TrailEntry or undefined if not active.
 *
 * @example
 * ```typescript
 * const entry = getCardEntry(state, 'card-1');
 * ```
 */
export function getCardEntry<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): TrailEntry<TData, TPopoverKey> | undefined {
  return selectEntryByKey<TData, TPopoverKey>(key)(state);
}

/**
 * Retrieves the current drag offset vector of a popover card.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Popover key.
 * @returns 2D drag offset object `{ x, y }`.
 *
 * @example
 * ```typescript
 * const { x, y } = getCardOffset(state, 'card-1');
 * ```
 */
export function getCardOffset<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): DragOffset {
  return selectOffset<TPopoverKey>(key)(state);
}

/**
 * Resolves the breadcrumb path from the root ancestor to the specified card.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Target popover key.
 * @returns Array of keys tracing root to target.
 *
 * @example
 * ```typescript
 * const crumbs = getCardBreadcrumbs(state, 'settings-card');
 * ```
 */
export function getCardBreadcrumbs<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[] {
  return selectBreadcrumbs<TPopoverKey, TData>(key)(state);
}

/**
 * Retrieves the hierarchical topological depth of a card in the DAG.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Popover key.
 * @returns Non-negative depth integer.
 *
 * @example
 * ```typescript
 * const depth = getCardDepth(state, 'settings-card');
 * ```
 */
export function getCardDepth<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): number {
  return selectPopoverDepth<TPopoverKey, TData>(key)(state);
}

/**
 * Retrieves all direct parent keys of a card in the DAG.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Popover key.
 * @returns Readonly array of parent keys.
 *
 * @example
 * ```typescript
 * const parents = getCardParents(state, 'settings-card');
 * ```
 */
export function getCardParents<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[] {
  const parents = state.getParents(key);
  return parents.size === 0 ? EMPTY_ARRAY : [...parents];
}

/**
 * Retrieves all direct children keys opened by a card in the DAG.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Popover key.
 * @returns Readonly array of child keys.
 *
 * @example
 * ```typescript
 * const children = getCardChildren(state, 'menu-card');
 * ```
 */
export function getCardChildren<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[] {
  const children = state.getChildren(key);
  return children.size === 0 ? EMPTY_ARRAY : [...children];
}
