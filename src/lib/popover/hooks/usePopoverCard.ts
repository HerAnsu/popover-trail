import {
  useRef,
  useCallback,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { usePopoverGeometry } from './useGeometry';
import { usePopoverActions } from '../context/usePopoverStore';
import { getPopoverStyles } from '../utils/styles';
import type { TrailEntry, PopoverPlacement } from '../types';
import { handleCardKeyboardNavigation } from './card/useCardKeyboardNav';
import { useCardFocusManagement } from './card/useCardFocusManagement';
import {
  useCardStoreSlice,
  useCardMountingTransition,
  resolveEffectiveBaseZIndex,
  resolveCardButtonControls,
  resolveTransitionClassName,
} from './card/useCardStoreSlice';

export {
  handleCardKeyboardNavigation,
  type CardKeyboardNavigationOptions,
} from './card/useCardKeyboardNav';

/**
 * Options parameters for the `usePopoverCard` hook.
 */
export interface UsePopoverCardOptions {
  /** The specific trail entry data represented by the card. */
  entry: TrailEntry;
  /** The 0-based virtual rendering index of the card. */
  index: number;
  /** Whether this card is pinned as a floating window (`true`) or stacked in the trail (`false`). */
  isPinned: boolean;
  /** Relative alignment placement direction preference (defaults to 'bottom'). */
  placement?: PopoverPlacement;
}

/**
 * Result object returned by the `usePopoverCard` hook.
 */
export interface UsePopoverCardResult {
  /** Callback ref attached to the card DOM element to calculate positioning. */
  readonly ref: (node: HTMLDivElement | null) => void;
  /** Compiled inline styles including top, left, z-index, and CSS custom variables. */
  readonly style: Readonly<CSSProperties>;
  /** Whether this card currently has the highest z-index in the active stack. */
  readonly isTop: boolean;
  /** Whether the card is currently being dragged with pointer. */
  readonly isDragging: boolean;
  /** Imperative store action dispatchers (close, togglePin, etc.). */
  readonly actions: ReturnType<typeof usePopoverActions>;
  /** Optional drag handle accessibility attributes and pointer event listeners. */
  readonly dragHandleProps: HTMLAttributes<HTMLElement>;
  /** Pointer enter handler to cancel pending hover close timers. */
  readonly onMouseEnter: () => void;
  /** Pointer leave handler to start hover close delay timer when unpinned. */
  readonly onMouseLeave: () => void;
  /** Keyboard event handler for Escape dismiss, Arrow navigation, and focus trapping. */
  readonly onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  /** Active mounting or unmounting transition CSS class name. */
  readonly transitionClassName: string;
  /** Resolved button visibility and customization controls from schema or options. */
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
  /** Callback handler to toggle the card between trailing stack and pinned window. */
  readonly handlePinToggle: () => void;
}

/**
 * Composite hook unifying Floating UI geometry, focus management, keyboard arrow navigation,
 * transition class names, and style compilation for popover cards.
 *
 * @remarks
 * Encapsulates the entire lifecycle of an active popover card:
 * - Floating UI positioning relative to the anchor trigger element.
 * - Stacking order calculation and topological z-index assignment.
 * - Keyboard navigation (Escape to close current branch, Arrow Left/Right to traverse trail cards).
 * - Automatic focus restoration when cards open and close.
 * - CSS transition status class generation (`mounting`, `mounted`, `unmounting`).
 *
 * @param options - Card entry data, index, pinned status, and placement preferences.
 * @returns Complete suite of reactive styles, event handlers, and action dispatchers.
 */
export function usePopoverCard({
  entry,
  index,
  isPinned,
  placement = 'bottom',
}: UsePopoverCardOptions): UsePopoverCardResult {
  const ref = useRef<HTMLDivElement | null>(null);

  useCardFocusManagement(entry, ref);

  const { finalLayoutPos, setFloating } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    placement: entry.placement ?? placement,
    zIndex: index,
    isDragging: false,
    isPinned,
    entry,
  });

  const {
    offset,
    zIndex,
    isTop,
    enableArrowNavigation,
    trail,
    floating,
    baseZIndex,
    mountingClassName: globalMounting,
    unmountingClassName: globalUnmounting,
    mountedClassName: globalMounted,
    zIndexBaseMap,
  } = useCardStoreSlice(entry.key);

  const actions = usePopoverActions();

  useCardMountingTransition(entry.key, entry.transitionStatus, actions);

  const transitionClassName = resolveTransitionClassName(
    entry.transitionStatus,
    {
      mounting: entry.mountingClassName,
      unmounting: entry.unmountingClassName,
      mounted: entry.mountedClassName,
    },
    {
      mounting: globalMounting,
      unmounting: globalUnmounting,
      mounted: globalMounted,
    },
  );

  const effectiveBaseZIndex = resolveEffectiveBaseZIndex(entry, zIndexBaseMap, baseZIndex);

  const style = getPopoverStyles({
    finalLayoutPos,
    offset,
    dragX: 0,
    dragY: 0,
    rotation: 0,
    zIndex: zIndex + effectiveBaseZIndex,
  });

  const setCombinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setFloating(node);
      ref.current = node;
    },
    [setFloating],
  );

  const handlePinToggle = useCallback(() => {
    actions.togglePin(entry.key);
  }, [actions, entry.key]);

  const onMouseEnter = useCallback(() => {
    actions.hoverEnter(entry.key);
  }, [actions, entry.key]);

  const onMouseLeave = useCallback(() => {
    if (isPinned) return;
    actions.hoverLeave(entry.key);
  }, [actions, entry.key, isPinned]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      handleCardKeyboardNavigation({
        event: e,
        cardElement: ref.current,
        entry,
        enableArrowNavigation,
        isPinned,
        trail,
        floatingCount: floating.length,
        actions,
      });
    },
    [actions, enableArrowNavigation, entry, floating.length, isPinned, trail],
  );

  const buttonControls = useMemo(() => resolveCardButtonControls(entry), [entry]);

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
    handlePinToggle,
  };
}
