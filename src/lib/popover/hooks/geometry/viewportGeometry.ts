/**
 * Viewport Bounding and Auto-placement Resolution Helpers.
 *
 * @module hooks/geometry/viewportGeometry
 */

import type { Placement } from '@floating-ui/react';
import type { PopoverRect } from '../../types';
import {
  isBrowser,
  isRecordObject,
  isBottomSheetMode,
  isCenteredModalMode,
  isDockedTopMode,
} from '../../utils/typeGuards';
import { clamp } from '../../utils/math';

/**
 * Safely measures current viewport dimensions across SSR and browser environments.
 * Returns standard desktop fallback dimensions (1024x768) when evaluated in non-DOM environments.
 *
 * @returns An object with `{ width, height }` in pixels.
 *
 * @example
 * ```ts
 * const { width, height } = getViewportBounds();
 * ```
 */
export function getViewportBounds(): { width: number; height: number } {
  const isClient = isBrowser();
  return {
    width: isClient ? window.innerWidth : 1024,
    height: isClient ? window.innerHeight : 768,
  };
}

/**
 * Extracts middleware extra properties into a safe record object.
 *
 * @param option - Raw configuration option or boolean toggle.
 * @returns Shallow copy record if option is an object, or empty record.
 *
 * @example
 * ```typescript
 * const extraProps = resolveMiddlewareProps({ padding: 16 });
 * // returns { padding: 16 }
 * ```
 */
export function resolveMiddlewareProps(option: unknown): Record<string, unknown> {
  return isRecordObject(option) ? { ...option } : {};
}

/**
 * Heuristic auto-placement resolver:
 * Automatically picks `'left'` or `'right'` based on whether the anchor trigger is positioned
 * on the right half or left half of the viewport, ensuring popovers naturally open towards center.
 *
 * @param placement - Requested placement, or `'auto'`.
 * @param anchorRect - Bounding rectangle of the anchor trigger.
 * @returns Resolved placement or undefined.
 *
 * @example
 * ```typescript
 * const placement = resolveAutoPlacement('auto', buttonRect);
 * // returns 'left' if button is on the right half of the screen
 * ```
 */
export function resolveAutoPlacement(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | PopoverRect | null | undefined,
): Placement | undefined {
  if (placement !== 'auto') return placement;
  if (!anchorRect) return 'right';

  const screenCenterX = isBrowser() ? window.innerWidth / 2 : 500;
  const { left, width } = anchorRect;
  const anchorCenterX = left + width / 2;

  return anchorCenterX > screenCenterX ? 'left' : 'right';
}

/**
 * Calculates absolute layout coordinates for responsive display modes:
 * - `bottom-sheet`: Docked to bottom edge of mobile viewport.
 * - `modal`: Centered in the middle of viewport with safety margins.
 * - `docked-top`: Anchored to top edge navigation bar.
 *
 * @param effectiveResponsiveMode - Active responsive layout mode string.
 * @param isMobileViewport - Whether current viewport matches mobile breakpoint.
 * @param layoutStrategy - Layout strategy identifier.
 * @param winWidth - Viewport inner width.
 * @param winHeight - Viewport inner height.
 * @returns Computed `{ top, left }` position or `null` if standard floating placement applies.
 *
 * @example
 * ```typescript
 * const pos = resolveResponsivePosition('bottom-sheet', true, undefined, 375, 812);
 * ```
 */
export function resolveResponsivePosition(
  effectiveResponsiveMode: string | undefined,
  isMobileViewport: boolean,
  layoutStrategy: string | undefined,
  winWidth: number,
  winHeight: number,
): { top: number; left: number } | null {
  if (isBottomSheetMode(effectiveResponsiveMode, isMobileViewport, layoutStrategy)) {
    return {
      top: clamp(winHeight - 320, 0, Infinity),
      left: clamp((winWidth - 400) / 2, 0, Infinity),
    };
  }

  if (isCenteredModalMode(effectiveResponsiveMode, layoutStrategy)) {
    return {
      top: clamp((winHeight - 350) / 2, 20, Infinity),
      left: clamp((winWidth - 400) / 2, 20, Infinity),
    };
  }

  if (isDockedTopMode(layoutStrategy)) {
    return {
      top: 10,
      left: clamp((winWidth - 400) / 2, 0, Infinity),
    };
  }

  return null;
}
