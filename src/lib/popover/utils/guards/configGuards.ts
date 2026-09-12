/**
 * Type Guards and Validation for Popover Configurations and Options.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module utils/guards/configGuards
 */

import {
  type DragAxis,
  type CascadeOffsetDirection,
  DRAG_AXES,
  CASCADE_OFFSET_DIRECTIONS,
} from '../../types/config/displayConfig';
import type { PopoverDisplayOptions } from '../../types/config/optionsConfig';
import type { HoverConfig, ButtonControlConfig } from '../../types/config/timingConfig';
import type { CollisionConfig, FocusLockOptions } from '../../types/config/collisionConfig';
import type { StateStorageEngine, PopoverPersistConfig } from '../../types/config/storeConfig';
import { isPlainObject } from './objectGuards';

export * from '../configDefinitions';
export { isPopoverPlacement } from './placementGuards';

const DRAG_AXIS_SET: ReadonlySet<string> = new Set<string>(DRAG_AXES);

const CASCADE_DIRECTIONS_SET: ReadonlySet<string> = new Set<string>([
  ...CASCADE_OFFSET_DIRECTIONS,
  'up',
  'down',
]);

/** Validates whether a value is a DragAxis ('x' | 'y' | 'both'). */
export function isDragAxis(val: unknown): val is DragAxis {
  return typeof val === 'string' && DRAG_AXIS_SET.has(val);
}

/** Validates whether a value is a CascadeOffsetDirection ('left' | 'right' | 'top' | 'bottom' | 'none'). */
export function isCascadeOffsetDirection(val: unknown): val is CascadeOffsetDirection {
  return typeof val === 'string' && CASCADE_DIRECTIONS_SET.has(val);
}

/** Validates whether a value conforms to HoverConfig. */
export function isHoverConfig(val: unknown): val is HoverConfig {
  return isPlainObject(val) && typeof val.enabled === 'boolean';
}

/** Validates whether a value conforms to CollisionConfig. */
export function isCollisionConfig(val: unknown): val is CollisionConfig {
  return isPlainObject(val) && typeof val.enabled === 'boolean';
}

/** Validates whether a value conforms to FocusLockOptions. */
export function isFocusLockOptions(val: unknown): val is FocusLockOptions {
  return isPlainObject(val);
}

/** Validates whether a value conforms to ButtonControlConfig. */
export function isButtonControlConfig(val: unknown): val is ButtonControlConfig {
  return isPlainObject(val);
}

/** Validates whether a value conforms to StateStorageEngine duck-type. */
export function isStateStorageEngine(val: unknown): val is StateStorageEngine {
  return (
    isPlainObject(val) &&
    typeof val.getItem === 'function' &&
    typeof val.setItem === 'function' &&
    typeof val.removeItem === 'function'
  );
}

/** Validates whether a value conforms to PopoverPersistConfig. */
export function isPopoverPersistConfig(val: unknown): val is PopoverPersistConfig {
  return isPlainObject(val);
}

/** Validates whether a value conforms to PopoverDisplayOptions. */
export function isPopoverDisplayOptions(val: unknown): val is PopoverDisplayOptions {
  return isPlainObject(val);
}
