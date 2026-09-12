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

export function resolveDragTransformState(
  isDragAllowed: boolean,
  offset: { x: number; y: number },
  physics: { rotation: number; rotationX: number; rotationY: number; dragX: number; dragY: number },
) {
  if (!isDragAllowed) {
    return { offset: { x: 0, y: 0 }, dragX: 0, dragY: 0, rotation: 0, rotationX: 0, rotationY: 0 };
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

export function isDragOperationPermitted(
  entry: TrailEntry,
  enableDrag: boolean,
  isButtonDragEnabled: boolean,
  isPinned: boolean,
): boolean {
  const allowWhenPinned = entry.allowDragWhenPinned ?? true;
  const allowWhenUnpinned = entry.allowDragWhenUnpinned ?? true;
  return enableDrag && isButtonDragEnabled && (isPinned ? allowWhenPinned : allowWhenUnpinned);
}

export function resolveTiltParameters(
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

export function resolveFeatureFlag(featureVal?: boolean, propVal?: boolean): boolean {
  if (featureVal !== undefined) return featureVal;
  if (propVal !== undefined) return propVal;
  return true;
}

export function resolveCardFeatures<TData>(props: PopoverCardProps<TData>) {
  const feat = isPopoverCardFeatures(props.features) ? props.features : undefined;
  return {
    dragEnabled: resolveFeatureFlag(feat?.drag, props.enableDrag),
    tiltEnabled: resolveFeatureFlag(feat?.tilt, props.enableTilt),
    focusLockEnabled: resolveFeatureFlag(feat?.focusLock, props.enableFocusLock),
  };
}
