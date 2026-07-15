import { useRef, useCallback, useEffect } from 'react';
import { usePopoverGeometry } from './useGeometry';
import {
  usePopoverOffset,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverActions,
  usePopoverStore,
} from '../context';
import { getPopoverStyles } from '../utils/styles';
import type { TrailEntry, PopoverPlacement } from '../types';

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
}

/**
 * A unified composite hook that encapsulates all layout positioning, keyboard/hover controls,
 * focus lock restoration, and actions into a single simple interface.
 * Independent of drag-and-drop libraries.
 *
 * @param options - Hook configuration settings.
 * @returns Object containing refs, compiled styles, interaction state flags, and actions.
 */
export function usePopoverCard({
  entry,
  index,
  isPinned,
  placement = 'bottom',
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
      const isStillInDom = elementToFocus && document.body.contains(elementToFocus);

      if (isStillInDom && typeof elementToFocus?.focus === 'function') {
        const activeEl = document.activeElement;
        const isFocusInside =
          ref.current?.contains(activeEl) || activeEl === document.body || !activeEl;
        if (isFocusInside) {
          elementToFocus.focus();
        }
      } else {
        // Fallback: search for parent popover card in DOM
        if (entry.parentKey) {
          const parentCard = document.querySelector<HTMLElement>(
            `[aria-labelledby="title-${CSS.escape(entry.parentKey)}"]`,
          );
          if (parentCard) {
            const firstFocusable = parentCard.querySelector<HTMLElement>(
              "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
            );
            if (firstFocusable) {
              firstFocusable.focus();
              return;
            }
            parentCard.focus();
            return;
          }
        }
        // Fallback to page h1 or body
        const mainHeading = document.querySelector('h1');
        if (mainHeading) {
          mainHeading.focus();
        }
      }
    };
  }, [entry.parentKey]);

  // Geometry positioning setup
  const { finalLayoutPos, setFloating } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    placement,
    zIndex: index,
    isDragging: false,
    isPinned,
    entry,
  });

  // Select state coordinates and actions
  const offset = usePopoverOffset(entry.key);
  const zIndex = usePopoverZIndex(entry.key);
  const isTop = useIsPopoverTopMost(entry.key);
  const actions = usePopoverActions();
  const enableArrowNavigation = usePopoverStore((state) => state.enableArrowNavigation);
  const trail = usePopoverStore((state) => state.trail);
  const floating = usePopoverStore((state) => state.floating);

  // Compile styles using the compiler utility (static offsets only)
  const style = getPopoverStyles({
    finalLayoutPos,
    offset,
    dragX: 0,
    dragY: 0,
    rotation: 0,
    zIndex: zIndex + 1000,
  });

  const setCombinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setFloating(node);
      ref.current = node;
    },
    [setFloating],
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
    if (entry.hover?.closeOnMouseLeave === false) return;
    const delay = entry.hover?.closeDelay ?? 300;
    actions.hoverLeave(entry.key, delay);
  }, [actions, entry.key, entry.hover]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!enableArrowNavigation) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Find all focusable elements inside the card
        const focusableSelectors = [
          'a[href]',
          'area[href]',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          'button:not([disabled])',
          "[tabindex]:not([tabindex='-1'])",
        ].join(',');

        if (!ref.current) return;
        const elements = Array.from(ref.current.querySelectorAll<HTMLElement>(focusableSelectors));
        if (elements.length === 0) return;

        const activeEl = document.activeElement as HTMLElement;
        let currentIndex = elements.indexOf(activeEl);

        if (e.key === 'ArrowDown') {
          currentIndex = (currentIndex + 1) % elements.length;
        } else {
          currentIndex = (currentIndex - 1 + elements.length) % elements.length;
        }
        elements[currentIndex]?.focus();
      }

      if (e.key === 'ArrowRight') {
        const activeEl = document.activeElement as HTMLElement;
        // If focused element is a button/link (meaning a nested trigger)
        if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A')) {
          e.preventDefault();
          activeEl.click();
        }
      }

      if (e.key === 'ArrowLeft') {
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
    isDragging: false,
    actions,
    dragHandleProps: {},
    handlePinToggle,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
  };
}
