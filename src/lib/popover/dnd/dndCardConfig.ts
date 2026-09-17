/**
 * Configuration, Styles & Feature Flag Resolvers for Draggable Popovers.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndCardConfig
 */

import type { CSSProperties } from 'react';
import type { TrailEntry } from '../types';
import type { PopoverCardProps } from './dndTypes';
import { isPopoverCardFeatures } from './dndGuards';
import { ZERO_OFFSET } from '../constants';


export const FIXED_CONTAINER_STYLE = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
} satisfies CSSProperties;

export const AUTO_POINTER_STYLE = { pointerEvents: 'auto' } satisfies CSSProperties;
export const DISPLAY_NONE_STYLE = { display: 'none' } satisfies CSSProperties;
export const FULL_FLEX_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
} satisfies CSSProperties;
export const RETURN_FOCUS_CONFIG = { preventScroll: true, returnFocus: true };

/**
 * Resolves active drag transform and 3D physics tilt properties.
 *
 * When dragging is disallowed, returns zero offset and reset rotation angles.
 *
 * @param isDragAllowed - Whether dragging is permitted for the card.
 * @param offset - 2D translation offset { x, y }.
 * @param physics - 3D rotation and momentum state.
 * @returns Combined transform object with offset, drag coordinates, and Euler rotations.
 *
 * @example
 * ```ts
 * const transform = resolveDragTransform(true, { x: 10, y: 20 }, physics);
 * // returns { offset: { x: 10, y: 20 }, dragX: ..., rotation: ... }
 * ```
 */
export function resolveDragTransform(
  isDragAllowed: boolean,
  offset: { x: number; y: number },
  physics: { rotation: number; rotationX: number; rotationY: number; dragX: number; dragY: number },
) {
  if (!isDragAllowed) {
    return { offset: ZERO_OFFSET, dragX: 0, dragY: 0, rotation: 0, rotationX: 0, rotationY: 0 };
  }
  return {
    offset,
    dragX: physics.dragX,
    dragY: physics.dragY,
    rotation: physics.rotation,
    rotationX: physics.rotationX,
    rotationY: physics.rotationY,
  };
}

/**
 * Evaluates whether pointer dragging is permitted for a card.
 *
 * Checks card feature toggles, header drag handle settings, and entry pinning constraints.
 *
 * @param entry - Trail entry representing the popover.
 * @param enableDrag - Global or component-level drag toggle.
 * @param isButtonDragEnabled - Header button controls toggle.
 * @param isPinned - Whether the card is currently pinned.
 * @returns True if the user is allowed to drag the card.
 *
 * @example
 * ```ts
 * const allowed = isDragPermitted(entry, true, true, false);
 * ```
 */
export function isDragPermitted(
  entry: TrailEntry,
  enableDrag: boolean,
  isButtonDragEnabled: boolean,
  isPinned: boolean,
): boolean {
  const allowWhenPinned = entry.allowDragWhenPinned ?? true;
  const allowWhenUnpinned = entry.allowDragWhenUnpinned ?? true;
  return enableDrag && isButtonDragEnabled && (isPinned ? allowWhenPinned : allowWhenUnpinned);
}

/**
 * Resolves 3D tilt physics configuration for a draggable card.
 *
 * Merges entry-level overrides with parent component defaults.
 *
 * @param entry - Trail entry with optional custom tilt parameters.
 * @param enableTilt - Default tilt enabled flag.
 * @param maxTiltAngle - Maximum rotational tilt angle in degrees.
 * @param tiltSensitivity - Sensitivity scalar for pointer velocity.
 * @returns Merged tilt physics configuration object.
 *
 * @example
 * ```ts
 * const config = resolveTiltConfig(entry, true, 15, 0.1);
 * ```
 */
export function resolveTiltConfig(
  entry: TrailEntry,
  enableTilt: boolean,
  maxTiltAngle: number,
  tiltSensitivity: number,
) {
  return {
    tiltEnabled: entry.enableTilt ?? enableTilt,
    maxTilt: entry.maxTiltAngle ?? maxTiltAngle,
    sensitivity: entry.tiltSensitivity ?? tiltSensitivity,
    axis: entry.dragAxis ?? 'both',
    friction: entry.tiltFriction ?? 0.95,
    decay: entry.tiltDecay ?? 0.82,
  };
}

/**
 * Resolves a boolean feature flag from a primary feature object and fallback prop.
 *
 * @param featureVal - Value from nested features configuration object.
 * @param propVal - Direct boolean prop value.
 * @returns Effective boolean flag (defaults to `true` if both undefined).
 *
 * @example
 * ```ts
 * const enabled = resolveFeatureFlag(features?.drag, props.enableDrag);
 * ```
 */
export function resolveFeatureFlag(featureVal?: boolean, propVal?: boolean): boolean {
  if (featureVal !== undefined) return featureVal;
  if (propVal !== undefined) return propVal;
  return true;
}

/**
 * Extracts and normalizes feature toggles (drag, tilt, focusLock) for PopoverCard.
 *
 * @template TData - Data type associated with the popover.
 * @param props - Popover card component props.
 * @returns Normalized object with `dragEnabled`, `tiltEnabled`, and `focusLockEnabled`.
 *
 * @example
 * ```ts
 * const features = resolveCardFeatures(props);
 * ```
 */
export function resolveCardFeatures<TData>(props: PopoverCardProps<TData>) {
  const feat = isPopoverCardFeatures(props.features) ? props.features : undefined;
  return {
    dragEnabled: resolveFeatureFlag(feat?.drag, props.enableDrag),
    tiltEnabled: resolveFeatureFlag(feat?.tilt, props.enableTilt),
    focusLockEnabled: resolveFeatureFlag(feat?.focusLock, props.enableFocusLock),
  };
}
