/**
 * Type Guards and Normalizers for Anchors and Virtual Elements.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/anchorGuards
 */

import type { VirtualElement } from '@floating-ui/react';
import type { AnchorEventLike, ValidatedAnchorRef } from '../../types/storeStateTypes';
import { createDefaultDOMRect, createVirtualElement, normalizeDOMRect } from '../virtualElement';

export * from './viewportGuards';
export { createDefaultDOMRect, createVirtualElement, normalizeDOMRect };

/**
 * Type guard checking if an `AnchorEventLike` source is a Floating UI `VirtualElement`.
 *
 * @param source - Candidate anchor target or event.
 * @returns True if `source` conforms to the VirtualElement interface.
 *
 * @example
 * ```typescript
 * if (isVirtualElementAnchor(anchor)) {
 *   const rect = anchor.getBoundingClientRect();
 * }
 * ```
 */
export function isVirtualElementAnchor(source?: AnchorEventLike | null): source is VirtualElement {
  return Boolean(
    source &&
    'getBoundingClientRect' in source &&
    typeof source.getBoundingClientRect === 'function' &&
    !('nodeType' in source) &&
    !('currentTarget' in source),
  );
}

/**
 * Type guard checking if an unknown source is a native DOM Element.
 *
 * @param source - Candidate anchor target or event.
 * @returns True if `source` is an `Element`.
 *
 * @example
 * ```typescript
 * if (isDOMElementAnchor(target)) {
 *   target.scrollIntoView();
 * }
 * ```
 */
export function isDOMElementAnchor(source?: AnchorEventLike | null): source is Element {
  if (!source) return false;
  if (typeof Element !== 'undefined' && source instanceof Element) return true;
  return Boolean(
    'nodeType' in source &&
    typeof source.nodeType === 'number' &&
    'getBoundingClientRect' in source &&
    typeof source.getBoundingClientRect === 'function',
  );
}

/**
 * Type guard checking if an AnchorEventLike source is a DOM event with a currentTarget HTMLElement.
 *
 * @param source - Candidate anchor event or target.
 * @returns True if `source` is an event containing an HTMLElement currentTarget.
 *
 * @example
 * ```typescript
 * if (isEventAnchor(e)) {
 *   console.log(e.currentTarget);
 * }
 * ```
 */
export function isEventAnchor(
  source?: AnchorEventLike | null,
): source is { currentTarget: HTMLElement; stopPropagation?: () => void } {
  if (!source || !('currentTarget' in source) || !source.currentTarget) return false;
  return typeof HTMLElement === 'undefined' || source.currentTarget instanceof HTMLElement;
}

const NULL_ANCHOR_REF: ValidatedAnchorRef = Object.freeze({
  getBoundingClientRect: createDefaultDOMRect,
});

/**
 * Validates and converts an AnchorEventLike source into a ValidatedAnchorRef with geometry bounds.
 *
 * @param source - Candidate anchor target or event.
 * @returns Standardized ValidatedAnchorRef with callable `getBoundingClientRect`.
 *
 * @example
 * ```typescript
 * const anchorRef = toValidatedAnchorRef(mouseEvent);
 * const rect = anchorRef.getBoundingClientRect();
 * ```
 */
export function toValidatedAnchorRef(source?: AnchorEventLike | null): ValidatedAnchorRef {
  if (!source) return NULL_ANCHOR_REF;
  if ('getBoundingClientRect' in source && typeof source.getBoundingClientRect === 'function') {
    return {
      getBoundingClientRect: () => normalizeDOMRect(source.getBoundingClientRect()),
      currentTarget:
        'currentTarget' in source &&
        typeof HTMLElement !== 'undefined' &&
        source.currentTarget instanceof HTMLElement
          ? source.currentTarget
          : undefined,
    };
  }
  if (
    'currentTarget' in source &&
    source.currentTarget &&
    typeof source.currentTarget.getBoundingClientRect === 'function'
  ) {
    const el = source.currentTarget;
    return {
      currentTarget: el,
      getBoundingClientRect: () => el?.getBoundingClientRect() ?? createDefaultDOMRect(),
    };
  }
  return NULL_ANCHOR_REF;
}
