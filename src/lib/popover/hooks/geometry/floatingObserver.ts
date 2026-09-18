/**
 * Geometry Observers, Mobile Viewport Detection and Update Triggers.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/floatingObserver
 */

import { useEffect, useMemo, useState, type DependencyList } from 'react';
import { ResizeObserverRegistry } from '../../utils/resizeObserverRegistry';
import { isBrowser, isDOMRectOrPopoverRect } from '../../utils/typeGuards';

import type { PopoverRect } from '../../types';

/**
 * Creates a virtual positioning anchor compatible with Floating UI from an arbitrary bounding rectangle.
 *
 * @param anchorRect - DOMRect or PopoverRect coordinates of the anchor.
 * @returns Virtual element object with `getBoundingClientRect()`, or `null`.
 *
 * @example
 * ```tsx
 * const virtualAnchor = useVirtualAnchorElement(anchorRect);
 * refs.setReference(virtualAnchor);
 * ```
 */
export function useVirtualAnchorElement(anchorRect: DOMRect | PopoverRect | null | undefined) {
  return useMemo(() => {
    if (!isDOMRectOrPopoverRect(anchorRect)) return null;
    return {
      getBoundingClientRect: (): DOMRect => {
        const { top, left, width, height, bottom, right, x, y } = anchorRect;
        return {
          top,
          left,
          width,
          height,
          bottom: bottom ?? top + height,
          right: right ?? left + width,
          x: x ?? left,
          y: y ?? top,
          toJSON: () => anchorRect,
        };
      },
    };
  }, [anchorRect]);
}

/**
 * Observes dimension changes on the floating card DOM element to recompute layout coordinates.
 *
 * Automatically suppresses updates when the card is pinned or actively being dragged.
 *
 * @param floatingEl - Card DOM element.
 * @param isPinned - Whether the card is pinned.
 * @param isDragging - Whether the card is being dragged.
 * @param update - Callback to recalculate floating coordinates.
 *
 * @example
 * ```tsx
 * useFloatingResizeObserver(cardNode, isPinned, isDragging, updatePosition);
 * ```
 */
export function useFloatingResizeObserver(
  floatingEl: HTMLElement | null,
  isPinned: boolean | undefined,
  isDragging: boolean | undefined,
  update: () => void,
) {
  useEffect(() => {
    if (isPinned || isDragging || !floatingEl) return;
    const unobserve = ResizeObserverRegistry.observe(floatingEl, () => {
      void update();
    });
    return () => {
      unobserve();
    };
  }, [isPinned, isDragging, update, floatingEl]);
}

/**
 * Detects whether the current window viewport is smaller than the mobile breakpoint width.
 *
 * @param mobileBreakpoint - Breakpoint width in pixels (e.g. 640).
 * @returns Boolean `true` if mobile viewport width is active.
 *
 * @example
 * ```tsx
 * const isMobile = useMobileViewport(640);
 * ```
 */
export function useMobileViewport(mobileBreakpoint: number): boolean {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;
    const check = () => {
      const isMobile = window.innerWidth < mobileBreakpoint;
      setIsMobileViewport((prev) => (prev === isMobile ? prev : isMobile));
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, [mobileBreakpoint]);

  return isMobileViewport;
}

/**
 * Triggers a layout update when dependencies change, skipping updates during drag or pin state.
 *
 * @param isPinned - Whether card is pinned.
 * @param isDragging - Whether card is dragging.
 * @param update - Layout update callback.
 * @param deps - Dependency list.
 *
 * @example
 * ```tsx
 * useFloatingUpdater(isPinned, isDragging, update, [anchorRect, zIndex]);
 * ```
 */
export function useFloatingUpdater(
  isPinned: boolean | undefined,
  isDragging: boolean | undefined,
  update: () => void,
  deps: DependencyList,
) {
  useEffect(() => {
    if (!isPinned && !isDragging) void update();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
