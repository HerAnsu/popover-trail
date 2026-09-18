/**
 * Floating Popover Elevation Detection for Open Operations.
 *
 * @module store/reducers/open/openElevation
 */

import type { PopoverStateData, StatePatch, TrailEntry } from '../../../types';
import { bringToFrontPatch, findEntryIndex } from '../stack';

/**
 * Checks whether the target popover key is currently in the floating stack.
 * If found, returns a state patch bringing it to the front of the visual stacking order.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param floating - List of currently floating cards.
 * @param state - Current store state snapshot.
 * @param key - Target popover key identifier.
 * @returns State patch elevating card to front, or `null` if not floating.
 *
 * @example
 * ```typescript
 * const patch = findFloatingElevationPatch(state.floating, state, 'pinned-card');
 * ```
 */
export function findFloatingElevationPatch<TData, TContext, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): StatePatch<TData, TContext, TPopoverKey> | null {
  const index = findEntryIndex(floating, key);
  return index !== -1 ? bringToFrontPatch(state, key) : null;
}
