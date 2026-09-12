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

export function useVirtualAnchorElement(anchorRect: DOMRect | PopoverRect | null | undefined) {
  return useMemo(() => {
    if (!isDOMRectOrPopoverRect(anchorRect)) return null;
    return {
      getBoundingClientRect: (): DOMRect => ({
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
        bottom: anchorRect.bottom ?? anchorRect.top + anchorRect.height,
        right: anchorRect.right ?? anchorRect.left + anchorRect.width,
        x: anchorRect.x ?? anchorRect.left,
        y: anchorRect.y ?? anchorRect.top,
        toJSON: () => anchorRect,
      }),
    };
  }, [anchorRect]);
}

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
