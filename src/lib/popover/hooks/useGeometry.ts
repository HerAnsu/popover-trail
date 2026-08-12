import { useEffect, useMemo, useState } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  size,
  type Boundary,
  type Placement,
} from '@floating-ui/react';
import type { TrailEntry, PopoverPlacement } from '../types';
import { usePopoverCollisionConfig, usePopoverStore, usePopoverStoreApi } from '../context';
import { QuadTree, type BoundingBox } from '../utils/quadTree';
import { ResizeObserverRegistry } from '../utils/resizeObserverRegistry';

/**
 * Helper to safely measure current viewport bounds across SSR and browser environments.
 */
function getViewportBounds(): { width: number; height: number } {
  const isClient = typeof window !== 'undefined';
  return {
    width: isClient ? window.innerWidth : 1024,
    height: isClient ? window.innerHeight : 768,
  };
}

/** Pure calculation helper for resolving auto placement based on viewport coordinates. */
function calculateAutoPlacement(
  placement: string | undefined,
  anchorRect: DOMRect | null | undefined,
) {
  if (placement !== 'auto') return placement as Placement | undefined;
  if (!anchorRect) return 'right' as Placement;

  const screenCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;

  return (anchorCenterX > screenCenterX ? 'left' : 'right') as Placement;
}

/**
 * Options parameters for the `usePopoverGeometry` hook.
 */
interface UsePopoverGeometryOptions {
  /** The unique key identifier of the popover card. */
  id: string;
  /** Bounding box of the trigger element to position against. */
  anchorRect?: DOMRect;
  /** Relative alignment placement direction preference. */
  placement?: PopoverPlacement;
  /** z-index depth factor. Used to calculate visual cascade offsets. */
  zIndex: number;
  /** True if this card is currently being dragged. */
  isDragging: boolean;
  /** True if this card is modeless/pinned. */
  isPinned: boolean;
  /** Reference to the full trail entry data object. */
  entry?: TrailEntry;
  /** Optional flag to enable 2D spatial collision resolution via QuadTree (default: false). */
  enableSpatialCollision?: boolean;
}

/**
 * Result object returned by the `usePopoverGeometry` hook.
 */
export interface UsePopoverGeometryResult {
  /** The final absolute coordinates (`top`, `left`) of the popover card. */
  finalLayoutPos: {
    top: number;
    left: number;
  };
  /** Reference setter callback to attach to the floating card element. */
  setFloating: (node: HTMLElement | null) => void;
}

function calculateResponsivePosition(
  effectiveResponsiveMode: string | undefined,
  isMobileViewport: boolean,
  layoutStrategy: string | undefined,
  winWidth: number,
  winHeight: number,
): { top: number; left: number } | null {
  if (
    effectiveResponsiveMode === 'bottom-sheet' ||
    (effectiveResponsiveMode === 'auto' && isMobileViewport) ||
    layoutStrategy === 'docked-bottom'
  ) {
    return {
      top: Math.max(0, winHeight - 320),
      left: Math.max(0, (winWidth - 400) / 2),
    };
  }

  if (effectiveResponsiveMode === 'modal' || layoutStrategy === 'fixed-center') {
    return {
      top: Math.max(20, (winHeight - 350) / 2),
      left: Math.max(20, (winWidth - 400) / 2),
    };
  }

  if (layoutStrategy === 'docked-top') {
    return {
      top: 10,
      left: Math.max(0, (winWidth - 400) / 2),
    };
  }

  return null;
}

function calculateCascadeOffset(
  zIndex: number,
  step: number,
  direction: 'left' | 'right' | 'top' | 'bottom',
): { topOffset: number; leftOffset: number } {
  const offsetVal = zIndex * step;
  if (direction === 'left') return { topOffset: 0, leftOffset: -offsetVal };
  if (direction === 'right') return { topOffset: 0, leftOffset: offsetVal };
  if (direction === 'top') return { topOffset: -offsetVal, leftOffset: 0 };
  return { topOffset: offsetVal, leftOffset: 0 };
}

/**
 * Custom hook to calculate and track absolute positioning coordinates.
 * Integrates with Floating UI and supports auto-position updates on viewport scroll or resize.
 * Optionally integrates with QuadTree spatial index for 2D collision resolution.
 *
 * @param options - Hook options configuration.
 * @returns An object containing the computed layout coordinates and the floating ref setter.
 *
 * @example
 * ```tsx
 * const { finalLayoutPos, setFloating } = usePopoverGeometry({
 *   id: entry.key,
 *   anchorRect: triggerRect,
 *   placement: 'bottom',
 *   zIndex: 0,
 *   isDragging: false,
 *   isPinned: false,
 *   entry,
 * });
 * ```
 *
 * @see {@link PopoverCard}
 * @see {@link QuadTree}
 */
export function usePopoverGeometry({
  id,
  anchorRect,
  placement,
  zIndex,
  isDragging,
  isPinned,
  entry,
  enableSpatialCollision = false,
}: UsePopoverGeometryOptions): UsePopoverGeometryResult {
  const globalCollision = usePopoverCollisionConfig();
  const storeApi = usePopoverStoreApi();
  const cascadeOffsetStep = usePopoverStore((state) => state.cascadeOffsetStep);
  const defaultOffset = usePopoverStore((state) => state.defaultOffset);
  const localCollision = entry?.collision;

  // Merge local overrides with global defaults
  const boundary = localCollision?.boundary ?? globalCollision?.boundary;
  const padding = localCollision?.padding ?? globalCollision?.padding;
  const flipOption = localCollision?.flip ?? globalCollision?.flip;
  const shiftOption = localCollision?.shift ?? globalCollision?.shift;
  const sizeOption = localCollision?.size ?? globalCollision?.size;

  const [resolvedBoundary, setResolvedBoundary] = useState<Boundary | undefined>(
    typeof boundary !== 'function' ? boundary : undefined,
  );

  useEffect(() => {
    if (typeof boundary === 'function') {
      try {
        const el = boundary();
        if (el) {
          setResolvedBoundary(el);
        }
      } catch {
        // Fail-safe for early mount phases where DOM nodes might not be created yet
      }
    } else {
      setResolvedBoundary(boundary);
    }
  }, [boundary]);

  const boundaryOption = resolvedBoundary || undefined;

  const anchorRectHash = anchorRect
    ? Math.imul(Math.round(anchorRect.top), 73856093) ^
      Math.imul(Math.round(anchorRect.left), 19349663) ^
      Math.imul(Math.round(anchorRect.width), 83492791) ^
      Math.imul(Math.round(anchorRect.height), 4256233)
    : 0;

  const virtualElement = useMemo(() => {
    if (!anchorRect) return null;
    return {
      getBoundingClientRect: () => anchorRect,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRectHash]);

  function resolveMiddlewareExtraProps(option: unknown): Record<string, unknown> {
    return typeof option === 'object' && option !== null ? (option as Record<string, unknown>) : {};
  }

  // Configure useFloating positioning middleware dynamically with autoUpdate
  const middleware = useMemo(() => {
    const list = [
      offset(entry?.offset ?? defaultOffset ?? 8), // Gap distance from trigger
    ];

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
  }, [entry?.offset, defaultOffset, flipOption, shiftOption, sizeOption, boundaryOption, padding]);

  const resolvedAutoPlacement = useMemo(() => {
    return calculateAutoPlacement(placement, anchorRect);
  }, [placement, anchorRect]);

  const {
    refs,
    x,
    y,
    update,
    placement: resolvedPlacement,
  } = useFloating({
    placement: resolvedAutoPlacement ?? 'bottom',
    whileElementsMounted: isPinned ? undefined : autoUpdate,
    middleware,
  });

  useEffect(() => {
    refs.setReference(virtualElement);
  }, [virtualElement, refs]);

  useEffect(() => {
    if (isPinned || isDragging) return;
    const floatingEl = refs.floating.current;
    if (!floatingEl) return;

    const unobserve = ResizeObserverRegistry.observe(floatingEl, () => {
      void update();
    });
    return unobserve;
  }, [isPinned, isDragging, update, refs.floating]);

  useEffect(() => {
    if (!isPinned && !isDragging) {
      void update();
    }
  }, [
    id,
    anchorRect,
    resolvedAutoPlacement,
    zIndex,
    isDragging,
    isPinned,
    entry?.pinnedLayoutPos,
    update,
  ]);

  const globalResponsiveMode = usePopoverStore((state) => state.responsiveMode);
  const mobileBreakpoint = usePopoverStore((state) => state.mobileBreakpoint);
  const effectiveResponsiveMode = entry?.responsiveMode ?? globalResponsiveMode;
  const layoutStrategy = entry?.layoutStrategy ?? 'floating-ui';

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

  // Calculate the final coordinates with optional QuadTree spatial partitioning
  const finalLayoutPos = useMemo(() => {
    if (isPinned && entry?.pinnedLayoutPos) {
      return entry.pinnedLayoutPos;
    }

    const { width: winWidth, height: winHeight } = getViewportBounds();

    const responsivePos = calculateResponsivePosition(
      effectiveResponsiveMode,
      isMobileViewport,
      layoutStrategy,
      winWidth,
      winHeight,
    );
    if (responsivePos) {
      return responsivePos;
    }

    const step = entry?.cascadeOffsetStep ?? cascadeOffsetStep;
    const direction =
      entry?.cascadeOffsetDirection ?? (resolvedPlacement.startsWith('left') ? 'left' : 'right');
    const { topOffset, leftOffset } = calculateCascadeOffset(
      zIndex,
      step,
      direction as 'left' | 'right' | 'top' | 'bottom',
    );

    let calculatedTop = (y ?? 0) + topOffset;
    let calculatedLeft = (x ?? 0) + leftOffset;

    // Optional QuadTree spatial collision resolution
    if (enableSpatialCollision) {
      const { floating: activeFloating, offsets: activeOffsets } = storeApi.getState();
      const spatialBounds: BoundingBox = {
        x: 0,
        y: 0,
        width: winWidth,
        height: winHeight,
      };
      const spatialTree = new QuadTree(spatialBounds);

      for (const sibling of activeFloating) {
        if (sibling.key !== id) {
          const off = activeOffsets[sibling.key] ?? { x: 0, y: 0 };
          spatialTree.insert({
            id: sibling.key,
            bounds: {
              x: (sibling.pinnedLayoutPos?.left ?? 0) + off.x,
              y: (sibling.pinnedLayoutPos?.top ?? 0) + off.y,
              width: 320,
              height: 240,
            },
          });
        }
      }

      const cardBox = {
        x: calculatedLeft,
        y: calculatedTop,
        width: 320,
        height: 240,
      };
      spatialTree.insert({ id, bounds: cardBox });

      const collisions = spatialTree.retrieve([], cardBox);
      if (collisions.length > 1) {
        calculatedTop += 16;
        calculatedLeft += 16;
      }
    }

    return {
      top: calculatedTop,
      left: calculatedLeft,
    };
  }, [
    isPinned,
    entry?.pinnedLayoutPos,
    entry?.cascadeOffsetStep,
    entry?.cascadeOffsetDirection,
    effectiveResponsiveMode,
    isMobileViewport,
    layoutStrategy,
    cascadeOffsetStep,
    resolvedPlacement,
    x,
    y,
    zIndex,
    enableSpatialCollision,
    id,
    storeApi,
  ]);

  return {
    finalLayoutPos,
    setFloating: refs.setFloating,
  };
}
