import { useEffect, useMemo } from 'react';
import { usePopoverStoreApi } from '../context/usePopoverStore';
import { usePopoverCollisionConfig } from './usePopoverSelectors';
import type { PopoverPlacement, TrailEntry } from '../types';
import {
  getViewportBounds,
  calculateResponsivePosition,
  resolveUnpinnedLayoutPosition,
} from './geometry/geometryUtils';
import {
  buildFloatingMiddlewareList,
  useVirtualAnchorElement,
  useFloatingResizeObserver,
  useMobileViewport,
  useGeometryStoreConfig,
  useCollisionMergedConfig,
  useFloatingUpdater,
  usePopoverFloatingSetup,
} from './geometry/useFloatingSetup';

/**
 * Options passed to `usePopoverGeometry`.
 */
export interface UsePopoverGeometryOptions {
  /** Identifying popover key string. */
  id: string;
  /** Bounding rectangle of the trigger or anchor element. */
  anchorRect?: DOMRect;
  /** Floating UI placement preference string. */
  placement?: PopoverPlacement;
  /** Current 0-based depth index in the z-index stack. */
  zIndex: number;
  /** True if card is actively undergoing pointer drag. */
  isDragging: boolean;
  /** True if card is pinned as a detached floating window. */
  isPinned: boolean;
  /** Active popover entry object. */
  entry?: TrailEntry;
  /** Set true to enable QuadTree 2D collision avoidance nudging. */
  enableSpatialCollision?: boolean;
}

/**
 * Result object returned by `usePopoverGeometry`.
 */
export interface UsePopoverGeometryResult {
  /** Final calculated top and left screen coordinates in pixels. */
  finalLayoutPos: {
    top: number;
    left: number;
  };
  /** Ref callback to attach to the floating card DOM node. */
  setFloating: (node: HTMLElement | null) => void;
}

/**
 * Composite hook calculating absolute positioning coordinates for popover cards.
 *
 * @remarks
 * Coordinates multiple positioning layers:
 * 1. Pinned layout override: Returns custom pinned screen coordinates when detached.
 * 2. Responsive mode overrides: Modals, bottom sheets, docked navigation bars on small screens.
 * 3. Cascade offset computation: Shifts child cards along the cascade vector based on z-index depth.
 * 4. Spatial collision avoidance: Nudges overlapping cards via QuadTree 2D spatial partitioning.
 *
 * @param options - Geometry calculation parameters.
 * @returns Final layout coordinates (`top`, `left`) and floating element ref callback.
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
  const {
    cascadeOffsetStep,
    defaultOffset,
    responsiveMode: globalResponsiveMode,
    mobileBreakpoint,
  } = useGeometryStoreConfig();

  const { padding, flipOption, shiftOption, sizeOption, boundaryOption } = useCollisionMergedConfig(
    entry?.collision,
    globalCollision,
  );

  const virtualElement = useVirtualAnchorElement(anchorRect);

  const middleware = useMemo(
    () =>
      buildFloatingMiddlewareList(
        entry?.offset ?? defaultOffset ?? 8,
        flipOption,
        shiftOption,
        sizeOption,
        boundaryOption,
        padding,
      ),
    [entry?.offset, defaultOffset, flipOption, shiftOption, sizeOption, boundaryOption, padding],
  );

  const {
    refs,
    x,
    y,
    update,
    placement: resolvedPlacement,
    resolvedAutoPlacement,
  } = usePopoverFloatingSetup(placement, anchorRect, isPinned, middleware);

  useEffect(() => {
    refs.setReference(virtualElement);
  }, [virtualElement, refs]);

  useFloatingResizeObserver(refs.floating.current, isPinned, isDragging, update);

  useFloatingUpdater(isPinned, isDragging, update, [
    id,
    anchorRect,
    resolvedAutoPlacement,
    zIndex,
    isDragging,
    isPinned,
    entry?.pinnedLayoutPos,
    update,
  ]);

  const effectiveResponsiveMode = entry?.responsiveMode ?? globalResponsiveMode;
  const layoutStrategy = entry?.layoutStrategy ?? 'floating-ui';
  const isMobileViewport = useMobileViewport(mobileBreakpoint);

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
    if (responsivePos) return responsivePos;

    return resolveUnpinnedLayoutPosition(
      id,
      entry,
      cascadeOffsetStep,
      resolvedPlacement,
      zIndex,
      y,
      x,
      enableSpatialCollision,
      storeApi,
      winWidth,
      winHeight,
    );
  }, [
    isPinned,
    entry,
    effectiveResponsiveMode,
    isMobileViewport,
    layoutStrategy,
    id,
    cascadeOffsetStep,
    resolvedPlacement,
    zIndex,
    y,
    x,
    enableSpatialCollision,
    storeApi,
  ]);

  return {
    finalLayoutPos,
    setFloating: refs.setFloating,
  };
}
