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
import {
  handleCardKeyboardNavigation,
  type CardKeyboardNavigationOptions,
} from './card/useCardKeyboardNav';
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

export interface UsePopoverCardOptions {
  entry: TrailEntry;
  index: number;
  isPinned: boolean;
  placement?: PopoverPlacement;
}

export interface UsePopoverCardResult {
  readonly ref: (node: HTMLDivElement | null) => void;
  readonly style: Readonly<CSSProperties>;
  readonly isTop: boolean;
  readonly isDragging: boolean;
  readonly actions: ReturnType<typeof usePopoverActions>;
  readonly dragHandleProps: HTMLAttributes<HTMLElement>;
  readonly onMouseEnter: () => void;
  readonly onMouseLeave: () => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  readonly transitionClassName: string;
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
  readonly handlePinToggle: () => void;
}

/**
 * Composite hook unifying positioning, focus locks, keyboard navigation,
 * and style compilation for popover cards.
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
    if (isPinned) {
      actions.unpinPopover(entry.key);
    } else {
      actions.pinPopover(entry.key);
    }
  }, [actions, entry.key, isPinned]);

  const onMouseEnter = useCallback(() => {
    actions.cancelCloseTimer(entry.key);
  }, [actions, entry.key]);

  const onMouseLeave = useCallback(() => {
    if (isPinned) return;
    const leaveDelay = entry.hoverCloseDelay ?? 300;
    if (leaveDelay > 0) {
      actions.scheduleClose(entry.key, leaveDelay);
    }
  }, [actions, entry.key, entry.hoverCloseDelay, isPinned]);

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
