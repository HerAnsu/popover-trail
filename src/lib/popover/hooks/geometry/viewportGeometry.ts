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
 * Helper to safely measure current viewport bounds across SSR and browser environments.
 */
export function getViewportBounds(): { width: number; height: number } {
  const isClient = isBrowser();
  return {
    width: isClient ? window.innerWidth : 1024,
    height: isClient ? window.innerHeight : 768,
  };
}

/** Pure helper to extract middleware extra properties. */
export function resolveMiddlewareExtraProps(option: unknown): Record<string, unknown> {
  return isRecordObject(option) ? { ...option } : {};
}

/**
 * Heuristic auto-placement resolver:
 * Automatically picks `'left'` or `'right'` based on whether the anchor trigger is positioned
 * on the right half or left half of the viewport, ensuring popovers naturally open towards center.
 */
export function calculateAutoPlacement(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | PopoverRect | null | undefined,
): Placement | undefined {
  if (placement !== 'auto') return placement;
  if (!anchorRect) return 'right';

  const screenCenterX = isBrowser() ? window.innerWidth / 2 : 500;
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;

  return anchorCenterX > screenCenterX ? 'left' : 'right';
}

/**
 * Calculates absolute layout coordinates for transformed responsive modes:
 * - `bottom-sheet`: Docked to bottom edge of mobile viewport.
 * - `modal`: Centered in the middle of viewport with safety margins.
 * - `docked-top`: Anchored to top edge navigation bar.
 */
export function calculateResponsivePosition(
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
