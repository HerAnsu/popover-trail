/**
 * Floating Popover Elevation Detection for Open Operations.
 *
 * @module store/reducers/open/openElevation
 */

import type { PopoverStateData, StatePatch, TrailEntry } from '../../../types';
import { bringToFrontPatch, findEntryIndex } from '../stack';

/**
 * Checks if target entry is currently floating and returns elevation patch if so.
 */
export function findFloatingElevationPatch<TData, TContext, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): StatePatch<TData, TContext, TPopoverKey> | null {
  const index = findEntryIndex(floating, key);
  return index !== -1 ? bringToFrontPatch(state, key) : null;
}
