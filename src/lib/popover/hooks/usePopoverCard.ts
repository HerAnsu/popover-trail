import {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
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
 * Result object returned by the `usePopoverCard` hook.
 */
export interface UsePopoverCardResult {
  /** Combined reference setter to be attached to the popover's outer DOM element. */
  readonly ref: (node: HTMLDivElement | null) => void;
  /** Compiled absolute layout CSS style properties. */
  readonly style: Readonly<CSSProperties>;
  /** True if this popover card is currently topmost in the z-index stack. */
  readonly isTop: boolean;
  /** Always false for static cards (overridden in draggable cards). */
  readonly isDragging: boolean;
  /** Reference to the popover store dispatch actions. */
  readonly actions: ReturnType<typeof usePopoverActions>;
  /** HTML attribute props to bind to the dragging handle element. */
  readonly dragHandleProps: HTMLAttributes<HTMLElement>;
  /** Hover pointer enter callback handler. */
  readonly onMouseEnter: () => void;
  /** Hover pointer leave callback handler. */
  readonly onMouseLeave: () => void;
  /** Keyboard accessibility keydown event callback handler. */
  readonly onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  /** Active transition CSS class name resolved from mounting/unmounting states. */
  readonly transitionClassName: string;
  /** Resolved button controls and action toggles configuration state. */
  readonly buttonControls: Readonly<{
    enablePin: boolean;
    enableClose: boolean;
    enableDrag: boolean;
    customButtons: ReadonlyArray<{
      id: string;
      label: string;
      icon?: string;
      disabled?: boolean;
      onClick?: (key: string) => void;
    }>;
  }>;
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
}: UsePopoverCardOptions): UsePopoverCardResult {
  const ref = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Capture active element on mount and restore focus on unmount (WAI-ARIA compliance)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    }
    // Capture ref.current at setup time — it may be null by the time cleanup runs
    const cardElement = ref.current;

    return () => {
      const elementToFocus = previouslyFocusedElementRef.current;
      const isStillInDom = elementToFocus && document.body.contains(elementToFocus);

      if (isStillInDom && typeof elementToFocus?.focus === 'function') {
        const activeEl = document.activeElement;
        const isFocusInside =
          cardElement?.contains(activeEl) || activeEl === document.body || !activeEl;
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
    placement: entry.placement ?? placement,
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
  const baseZIndex = usePopoverStore((state) => state.baseZIndex);
  const globalMounting = usePopoverStore((state) => state.mountingClassName);
  const globalUnmounting = usePopoverStore((state) => state.unmountingClassName);
  const globalMounted = usePopoverStore((state) => state.mountedClassName);

  // Handle transition state automatically (mounting -> mounted) using requestAnimationFrame for frame-adaptive rendering
  useEffect(() => {
    if (entry.transitionStatus === 'mounting') {
      let rAF2: number;
      const rAF1 = requestAnimationFrame(() => {
        rAF2 = requestAnimationFrame(() => {
          actions.setTransitionStatus(entry.key, 'mounted');
        });
      });
      return () => {
        cancelAnimationFrame(rAF1);
        if (rAF2) {
          cancelAnimationFrame(rAF2);
        }
      };
    }
    return undefined;
  }, [entry.key, entry.transitionStatus, actions]);

  const mountingClass = entry.mountingClassName ?? globalMounting;
  const unmountingClass = entry.unmountingClassName ?? globalUnmounting;
  const mountedClass = entry.mountedClassName ?? globalMounted;

  let transitionClassName = '';
  if (entry.transitionStatus === 'mounting') {
    transitionClassName = mountingClass;
  } else if (entry.transitionStatus === 'mounted') {
    transitionClassName = mountedClass;
  } else if (entry.transitionStatus === 'unmounting') {
    transitionClassName = unmountingClass;
  }

  // Compile styles using the compiler utility (static offsets only)
  const style = getPopoverStyles({
    finalLayoutPos,
    offset,
    dragX: 0,
    dragY: 0,
    rotation: 0,
    zIndex: zIndex + (entry.baseZIndex ?? baseZIndex ?? 1000),
  });

  const setCombinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setFloating(node);
      ref.current = node;
    },
    [setFloating],
  );

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
      // 1. Check custom keyboardShortcuts on entry first
      if (entry.keyboardShortcuts) {
        const keyName = e.key;
        const modKey = (e.metaKey || e.ctrlKey ? 'Mod+' : '') + keyName;
        const handler = entry.keyboardShortcuts[modKey] ?? entry.keyboardShortcuts[keyName];
        if (handler) {
          e.preventDefault();
          handler(entry.key);
          return;
        }
      }

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
    [
      enableArrowNavigation,
      isPinned,
      trail,
      floating.length,
      entry.key,
      entry.keyboardShortcuts,
      actions,
    ],
  );

  const buttonControls = useMemo(
    () => ({
      enablePin: entry.buttonControls?.enablePin ?? true,
      enableClose: entry.buttonControls?.enableClose ?? true,
      enableDrag: entry.buttonControls?.enableDrag ?? true,
      customButtons: entry.buttonControls?.customButtons ?? [],
    }),
    [entry.buttonControls],
  );

  return {
    ref: setCombinedRef,
    style,
    isTop,
    isDragging: false,
    actions,
    dragHandleProps: {},
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    transitionClassName,
    buttonControls,
  };
}
