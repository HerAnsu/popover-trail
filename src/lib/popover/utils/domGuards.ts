/**
 * Shared DOM Structural Guards for popover-trail.
 * Framework-free duck-typing helpers for event and element shapes that must
 * work identically across synthetic and native event sources.
 *
 * @module utils/domGuards
 */

import type { AnchorEventLike } from '../types';

/** Stops event propagation when the source object supports it. */
export function stopEventPropagation(event?: AnchorEventLike): void {
  if (event && 'stopPropagation' in event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
}

/** Type guard verifying a target exposes `getBoundingClientRect`. */
export function hasBoundingClientRect(
  target: unknown,
): target is { getBoundingClientRect: () => DOMRect } {
  return (
    typeof target === 'object' &&
    target !== null &&
    'getBoundingClientRect' in target &&
    typeof target.getBoundingClientRect === 'function'
  );
}
