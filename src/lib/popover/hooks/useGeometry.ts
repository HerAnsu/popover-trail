import { useEffect, useMemo, useState } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import type { TrailEntry, PopoverPlacement } from '../types';
import { usePopoverCollisionConfig, usePopoverStore } from '../context';

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
}

/**
 * Custom hook to calculate and track absolute positioning coordinates.
 * Integrates with Floating UI and supports auto-position updates on viewport scroll or resize.
 *
 * @remarks
 * Auto-position listeners are automatically detached when `isPinned` is active
 * to save CPU cycles and prevent scroll shifts from overriding custom pinned placement.
 * Includes a cascading offset multiplier based on depth (zIndex) to prevent identical
 * sibling popovers from stacking perfectly directly on top of each other.
 *
 * @param options - Hook options configuration.
 * @returns An object containing the computed layout coordinates and the floating ref setter.
 */
export function usePopoverGeometry({
  id,
  anchorRect,
  placement,
  zIndex,
  isDragging,
  isPinned,
  entry,
}: UsePopoverGeometryOptions) {
  const globalCollision = usePopoverCollisionConfig();
  const cascadeOffsetStep = usePopoverStore((state) => state.cascadeOffsetStep);
  const defaultOffset = usePopoverStore((state) => state.defaultOffset);
  const localCollision = entry?.collision;

  // Merge local overrides with global defaults
  const boundary = localCollision?.boundary ?? globalCollision?.boundary;
  const padding = localCollision?.padding ?? globalCollision?.padding;
  const flipOption = localCollision?.flip ?? globalCollision?.flip;
  const shiftOption = localCollision?.shift ?? globalCollision?.shift;

  const [resolvedBoundary, setResolvedBoundary] = useState<
    'clippingAncestors' | HTMLElement | HTMLElement[] | undefined
  >(typeof boundary === 'string' ? boundary : undefined);

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

  // 1. Setup a virtual element for Floating UI positioning using the anchor DOMRect
  const virtualElement = useMemo(() => {
    if (!anchorRect) return null;
    return {
      getBoundingClientRect: () => anchorRect,
    };
  }, [anchorRect]);

  // 2. Configure useFloating positioning middleware dynamically with autoUpdate
  const middleware = useMemo(() => {
    const list = [
      offset(entry?.offset ?? defaultOffset ?? 8), // Gap distance from trigger
    ];

    if (flipOption !== false) {
      list.push(
        flip({
          boundary: boundaryOption,
          padding: padding ?? undefined,
          ...(typeof flipOption === 'object' ? flipOption : {}),
        })
      );
    }

    if (shiftOption !== false) {
      list.push(
        shift({
          boundary: boundaryOption,
          padding: padding ?? 12,
          ...(typeof shiftOption === 'object' ? shiftOption : {}),
        })
      );
    }

    return list;
  }, [entry?.offset, defaultOffset, flipOption, shiftOption, boundaryOption, padding]);

  const { refs, x, y, update, placement: resolvedPlacement } = useFloating({
    placement: placement ?? 'bottom',
    whileElementsMounted: isPinned ? undefined : autoUpdate, // Native tracking of resize, scroll, and layout shifts (disabled when pinned)
    middleware,
  });

  // 3. Keep references synced (accepts null safely if virtualElement unmounts)
  useEffect(() => {
    refs.setReference(virtualElement);
  }, [virtualElement, refs]);

  // 4. Force updates when specific inputs change (disabled when pinned)
  useEffect(() => {
    if (!isPinned) {
      void update();
    }
  }, [id, anchorRect, placement, zIndex, isDragging, isPinned, entry?.pinnedLayoutPos, update]);

  // 5. Calculate the final coordinates
  const finalLayoutPos = useMemo(() => {
    if (isPinned && entry?.pinnedLayoutPos) {
      return entry.pinnedLayoutPos;
    }
    // Calculate horizontal/vertical offsets dynamically based on nesting level and custom direction overrides
    const step = entry?.cascadeOffsetStep ?? cascadeOffsetStep;
    const direction =
      entry?.cascadeOffsetDirection ??
      (resolvedPlacement.startsWith('left') ? 'left' : 'right');
    const offsetVal = zIndex * step;

    let topOffset = 0;
    let leftOffset = 0;
    if (direction === 'left') {
      leftOffset = -offsetVal;
    } else if (direction === 'right') {
      leftOffset = offsetVal;
    } else if (direction === 'top') {
      topOffset = -offsetVal;
    } else if (direction === 'bottom') {
      topOffset = offsetVal;
    }

    return {
      top: (y ?? 0) + topOffset,
      left: (x ?? 0) + leftOffset,
    };
  }, [isPinned, entry?.pinnedLayoutPos, x, y, zIndex, cascadeOffsetStep, resolvedPlacement, entry?.cascadeOffsetStep, entry?.cascadeOffsetDirection]);

  return {
    finalLayoutPos,
    setFloating: refs.setFloating,
  };
}
