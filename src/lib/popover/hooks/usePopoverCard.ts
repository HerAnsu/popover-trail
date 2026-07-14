import { useRef, useCallback, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { usePopoverGeometry } from './useGeometry';
import { usePopoverDragAndDrop } from './useDragAndDrop';
import {
  usePopoverOffset,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverActions,
  usePopoverStore,
} from "../context";
import { getPopoverStyles } from "../utils/styles";
import type { TrailEntry, PopoverPlacement } from "../types";

/**
 * Options parameters for the `usePopoverCard` unified hook.
 */
interface UsePopoverCardOptions {
  /** The specific trail entry data represented by the card. */
  entry: TrailEntry;
  /** The virtual rendering index of the card. */
  index: number;
  /** True if this card is currently pinned/floating. */
  isPinned: boolean;
  /** Relative alignment placement direction preference (default: "bottom"). */
  placement?: PopoverPlacement;
  /** True to allow drag-and-drop movement when pinned (default: true). */
  enableDrag?: boolean;
  /** True to enable physical spring rotation (tilt/swing) effects when dragging (default: true). */
  enableTilt?: boolean;
  /** Maximum tilt swing angle in degrees (default: 5). */
  maxTiltAngle?: number;
  /** Factor scaling tilt response to drag velocity (default: 8). */
  tiltSensitivity?: number;
}

/**
 * A unified composite hook that encapsulates all layout positioning, dragging physics,
 * focus lock restoration, z-index ordering, and actions into a single simple interface.
 *
 * @remarks
 * Restores keyboard focus to the triggering element upon unmounting (WAI-ARIA compliance).
 * Merges dnd-kit `useDraggable` ref bindings and Floating UI refs into a single composite ref.
 *
 * @param options - Hook configuration settings.
 * @returns Object containing refs, compiled styles, interaction state flags, and actions.
 */
export function usePopoverCard({
  entry,
  index,
  isPinned,
  placement = 'bottom',
  enableDrag = true,
  enableTilt = true,
  maxTiltAngle = 5,
  tiltSensitivity = 8,
}: UsePopoverCardOptions) {
  const ref = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Capture active element on mount and restore focus on unmount (WAI-ARIA compliance)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    }

    return () => {
      const elementToFocus = previouslyFocusedElementRef.current;
      if (
        elementToFocus &&
        typeof elementToFocus.focus === 'function' &&
        document.body.contains(elementToFocus)
      ) {
        const activeEl = document.activeElement;
        const isFocusInside =
          ref.current?.contains(activeEl) || activeEl === document.body || !activeEl;
        if (isFocusInside) {
          elementToFocus.focus();
        }
      }
    };
  }, []);

  // 1. Set up dnd-kit dragging (disabled if enableDrag is false or popover is not pinned)
  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: entry.key,
    disabled: !enableDrag || !isPinned,
  });

  // 2. Physics-based rotation swing setup
  const { rotation, dragX, dragY } = usePopoverDragAndDrop({
    isDragging: enableDrag ? isDragging : false,
    transform: enableDrag ? transform : null,
    enableTilt,
    maxTiltAngle,
    tiltSensitivity,
  });

  // 3. Geometry positioning setup
  const { finalLayoutPos, setFloating } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    placement,
    zIndex: index,
    isDragging: enableDrag ? isDragging : false,
    isPinned,
    entry,
  });

  // 4. Select state coordinates and actions
  const offset = usePopoverOffset(entry.key);
  const zIndex = usePopoverZIndex(entry.key);
  const isTop = useIsPopoverTopMost(entry.key);
  const actions = usePopoverActions();
  const enableArrowNavigation = usePopoverStore((state) => state.enableArrowNavigation);
  const trail = usePopoverStore((state) => state.trail);
  const floating = usePopoverStore((state) => state.floating);

  // 5. Compile styles using the compiler utility
  const style = getPopoverStyles({
    finalLayoutPos,
    offset: enableDrag ? offset : { x: 0, y: 0 },
    dragX: enableDrag ? dragX : 0,
    dragY: enableDrag ? dragY : 0,
    rotation: enableDrag ? rotation : 0,
    zIndex: zIndex + 1000,
  });

  const setCombinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (enableDrag) {
        setNodeRef(node);
      }
      setFloating(node);
      ref.current = node;
    },
    [enableDrag, setNodeRef, setFloating],
  );

  const handlePinToggle = useCallback(() => {
    if (ref.current) {
      const currentRect = ref.current.getBoundingClientRect();
      actions.togglePin(entry.key, currentRect);
    }
  }, [actions, entry.key]);

  const onMouseEnter = useCallback(() => {
    actions.hoverEnter(entry.key);
  }, [actions, entry.key]);

  const onMouseLeave = useCallback(() => {
    if (isDragging) return;
    const delay = entry.hover?.closeDelay ?? 300;
    actions.hoverLeave(entry.key, delay);
  }, [actions, entry.key, entry.hover, isDragging]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!enableArrowNavigation) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        // Find all focusable elements inside the card
        const focusableSelectors = [
          "a[href]",
          "area[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "button:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(",");

        if (!ref.current) return;
        const elements = Array.from(ref.current.querySelectorAll<HTMLElement>(focusableSelectors));
        if (elements.length === 0) return;

        const activeEl = document.activeElement as HTMLElement;
        let currentIndex = elements.indexOf(activeEl);

        if (e.key === "ArrowDown") {
          currentIndex = (currentIndex + 1) % elements.length;
        } else {
          currentIndex = (currentIndex - 1 + elements.length) % elements.length;
        }
        elements[currentIndex]?.focus();
      }

      if (e.key === "ArrowRight") {
        const activeEl = document.activeElement as HTMLElement;
        // If focused element is a button/link (meaning a nested trigger)
        if (activeEl && (activeEl.tagName === "BUTTON" || activeEl.tagName === "A")) {
          e.preventDefault();
          activeEl.click();
        }
      }

      if (e.key === "ArrowLeft") {
        if (!isPinned) {
          const trailIndex = trail.findIndex((t) => t.key === entry.key);
          if (trailIndex > 0) {
            e.preventDefault();
            actions.closeFrom(floating.length + trailIndex);
          }
        }
      }
    },
    [enableArrowNavigation, isPinned, trail, floating.length, entry.key, actions],
  );

  return {
    ref: setCombinedRef,
    style,
    isTop,
    isDragging: enableDrag ? isDragging : false,
    actions,
    dragHandleProps: enableDrag ? { ...attributes, ...listeners } : {},
    handlePinToggle,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
  };
}
