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

export interface UsePopoverGeometryOptions {
  id: string;
  anchorRect?: DOMRect;
  placement?: PopoverPlacement;
  zIndex: number;
  isDragging: boolean;
  isPinned: boolean;
  entry?: TrailEntry;
  enableSpatialCollision?: boolean;
}

export interface UsePopoverGeometryResult {
  finalLayoutPos: {
    top: number;
    left: number;
  };
  setFloating: (node: HTMLElement | null) => void;
}

/**
 * Composite hook calculating absolute positioning coordinates for popover cards.
 * Combines Floating UI positioning, responsive mode overrides, cascade offsets, and QuadTree spatial partitioning.
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
