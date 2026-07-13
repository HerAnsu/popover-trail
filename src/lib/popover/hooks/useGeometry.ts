import { useEffect, useMemo } from "react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import type { TrailEntry, PopoverPlacement } from "../types";

interface UsePopoverGeometryOptions {
  id: string;
  anchorRect?: DOMRect;
  placement?: PopoverPlacement;
  zIndex: number;
  isDragging: boolean;
  isPinned: boolean;
  entry?: TrailEntry;
}

/**
 * Hook to compute coordinates positioning relative to anchor rect.
 * Integrates with Floating UI autoUpdate for dynamic scrolls/resizes.
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
  // 1. Setup a virtual element for Floating UI positioning using the anchor DOMRect
  const virtualElement = useMemo(() => {
    if (!anchorRect) return null;
    return {
      getBoundingClientRect: () => anchorRect,
    };
  }, [anchorRect]);

  // 2. Configure useFloating positioning middleware with autoUpdate
  const { refs, x, y, update } = useFloating({
    placement: placement ?? "bottom",
    whileElementsMounted: isPinned ? undefined : autoUpdate, // Native tracking of resize, scroll, and layout shifts (disabled when pinned)
    middleware: [
      offset(8), // Gap distance from trigger
      flip(), // Collision fallback (automatically flips opposite)
      shift({ padding: 12 }), // Keep within viewport margins
    ],
  });

  // 3. Keep references synced (accepts null safely if virtualElement unmounts)
  useEffect(() => {
    refs.setReference(virtualElement);
  }, [virtualElement, refs]);

  // 4. Force updates when specific inputs change
  useEffect(() => {
    void update();
  }, [id, anchorRect, placement, zIndex, isDragging, isPinned, entry?.pinnedLayoutPos, update]);

  // 5. Calculate the final coordinates
  const finalLayoutPos = useMemo(() => {
    if (isPinned && entry?.pinnedLayoutPos) {
      return entry.pinnedLayoutPos;
    }
    // Add slight horizontal cascade offset based on zIndex/nesting level to improve overlap aesthetics
    const cascadeOffset = zIndex * 8;
    return {
      top: y ?? 0,
      left: (x ?? 0) + cascadeOffset,
    };
  }, [isPinned, entry?.pinnedLayoutPos, x, y, zIndex]);

  return {
    finalLayoutPos,
    setFloating: refs.setFloating,
  };
}
