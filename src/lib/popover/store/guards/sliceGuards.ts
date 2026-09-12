/**
 * Type Guards for Minimal State Slice Contracts.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/guards/sliceGuards
 */

import type {
  HasTrailState,
  HasFloatingState,
  HasPinnedState,
  HasZIndexState,
  HasLifecycleState,
  HasAnchorState,
} from '../../types/state/minimalSlices';
import { isPlainObject } from '../../utils/guards/objectGuards';
import { isArray } from '../../utils/guards/arrayGuards';

/** Validates whether an unknown candidate satisfies the HasTrailState slice. */
export function hasTrailState(val: unknown): val is HasTrailState {
  return (
    isPlainObject(val) &&
    isArray(val.trail) &&
    (typeof val.ownerId === 'string' || val.ownerId === null)
  );
}

/** Validates whether an unknown candidate satisfies the HasFloatingState slice. */
export function hasFloatingState(val: unknown): val is HasFloatingState {
  return isPlainObject(val) && isArray(val.floating);
}

/** Validates whether an unknown candidate satisfies the HasPinnedState slice. */
export function hasPinnedState(val: unknown): val is HasPinnedState {
  return isPlainObject(val) && isPlainObject(val.pinnedStates) && isPlainObject(val.offsets);
}

/** Validates whether an unknown candidate satisfies the HasZIndexState slice. */
export function hasZIndexState(val: unknown): val is HasZIndexState {
  return (
    isPlainObject(val) &&
    isArray(val.zIndexOrder) &&
    typeof val.baseZIndex === 'number' &&
    Number.isFinite(val.baseZIndex)
  );
}

/** Validates whether an unknown candidate satisfies the HasLifecycleState slice. */
export function hasLifecycleState(val: unknown): val is HasLifecycleState {
  return (
    isPlainObject(val) &&
    typeof val.rootHydrationRequestCounter === 'number' &&
    isPlainObject(val.nestedHydrationRequestCounters) &&
    typeof val.mountingClassName === 'string' &&
    typeof val.unmountingClassName === 'string' &&
    typeof val.mountedClassName === 'string'
  );
}

/** Validates whether an unknown candidate satisfies the HasAnchorState slice. */
export function hasAnchorState(val: unknown): val is HasAnchorState {
  return (
    isPlainObject(val) &&
    'anchorElement' in val &&
    'anchorRect' in val &&
    (val.anchorElement === null || typeof val.anchorElement === 'object') &&
    (val.anchorRect === null || typeof val.anchorRect === 'object')
  );
}
