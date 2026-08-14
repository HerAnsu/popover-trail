import { useEffect, useMemo, useState, type DependencyList } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
  type Boundary,
  type Placement,
} from '@floating-ui/react';
import { usePopoverStore } from '../../context/usePopoverStore';
import { shallowEqual } from '../../utils/equality';
import { ResizeObserverRegistry } from '../../utils/resizeObserverRegistry';
import { calculateAutoPlacement, resolveMiddlewareExtraProps } from './geometryUtils';
import { useResolvedBoundary } from './useResolvedBoundary';
import type { CollisionConfig } from '../../types';

export function buildFloatingMiddlewareList(
  offsetDistance: number,
  flipOption: unknown,
  shiftOption: unknown,
  sizeOption: unknown,
  boundaryOption: Boundary | undefined,
  padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined,
) {
  const list = [offset(offsetDistance)];

  if (flipOption !== false) {
    list.push(
      flip({
        boundary: boundaryOption,
        padding: padding ?? undefined,
        ...resolveMiddlewareExtraProps(flipOption),
      }),
    );
  }

  if (shiftOption !== false) {
    list.push(
      shift({
        boundary: boundaryOption,
        padding: padding ?? 12,
        ...resolveMiddlewareExtraProps(shiftOption),
      }),
    );
  }

  if (sizeOption) {
    list.push(
      size({
        boundary: boundaryOption,
        padding: padding ?? 12,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.setProperty('--popover-max-width', `${availableWidth}px`);
          elements.floating.style.setProperty('--popover-max-height', `${availableHeight}px`);
        },
        ...resolveMiddlewareExtraProps(sizeOption),
      }),
    );
  }

  return list;
}

export function useVirtualAnchorElement(anchorRect: DOMRect | null | undefined) {
  const anchorRectHash = anchorRect
    ? Math.imul(Math.round(anchorRect.top), 73856093) ^
      Math.imul(Math.round(anchorRect.left), 19349663) ^
      Math.imul(Math.round(anchorRect.width), 83492791) ^
      Math.imul(Math.round(anchorRect.height), 4256233)
    : 0;

  return useMemo(() => {
    if (!anchorRect) return null;
    return {
      getBoundingClientRect: () => anchorRect,
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRectHash]);
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
    if (typeof window === 'undefined') return;
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

export function useGeometryStoreConfig() {
  return usePopoverStore(
    (state) => ({
      cascadeOffsetStep: state.cascadeOffsetStep,
      defaultOffset: state.defaultOffset,
      responsiveMode: state.responsiveMode,
      mobileBreakpoint: state.mobileBreakpoint,
    }),
    shallowEqual,
  );
}

export function useCollisionMergedConfig(
  localCollision?: CollisionConfig | null,
  globalCollision?: CollisionConfig | null,
) {
  const boundary = localCollision?.boundary ?? globalCollision?.boundary;
  const boundaryOption = useResolvedBoundary(boundary);
  const merged = { ...globalCollision, ...localCollision };

  return {
    padding: merged.padding,
    flipOption: merged.flip,
    shiftOption: merged.shift,
    sizeOption: merged.size,
    boundaryOption,
  };
}

export function useFloatingUpdater(
  isPinned: boolean | undefined,
  isDragging: boolean | undefined,
  update: () => void,
  deps: DependencyList,
) {
  useEffect(() => {
    if (!isPinned && !isDragging) {
      void update();
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function usePopoverFloatingSetup(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | null | undefined,
  isPinned: boolean | undefined,
  middleware: Array<
    | ReturnType<typeof offset>
    | ReturnType<typeof flip>
    | ReturnType<typeof shift>
    | ReturnType<typeof size>
  >,
) {
  const resolvedAutoPlacement = useMemo(
    () => calculateAutoPlacement(placement, anchorRect),
    [placement, anchorRect],
  );

  const floating = useFloating({
    placement: resolvedAutoPlacement ?? 'bottom',
    whileElementsMounted: isPinned ? undefined : autoUpdate,
    middleware,
  });

  return { ...floating, resolvedAutoPlacement };
}
