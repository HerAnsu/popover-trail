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
import { usePopoverActions, usePopoverStore } from '../context/usePopoverStore';
import { getPopoverStyles } from '../utils/styles';
import { shallowEqual } from '../utils/equality';
import { FOCUSABLE_ELEMENTS_SELECTOR } from '../constants';
import type { TrailEntry, PopoverPlacement, PopoverStore } from '../types';

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

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
  /** Callback handler to toggle the pinned status of the card. */
  readonly handlePinToggle: () => void;
}

export interface CardKeyboardNavigationOptions {
  event: React.KeyboardEvent<HTMLElement>;
  cardElement: HTMLElement | null;
  entry: TrailEntry;
  enableArrowNavigation: boolean;
  isPinned: boolean;
  trail: readonly TrailEntry[];
  floatingCount: number;
  actions: { closeFrom: (index: number) => void };
}

function handleCustomShortcuts(
  e: React.KeyboardEvent<HTMLElement>,
  cardEntry: TrailEntry,
): boolean {
  if (!cardEntry.keyboardShortcuts) return false;
  const keyName = e.key;
  const modKey = (e.metaKey || e.ctrlKey ? 'Mod+' : '') + keyName;
  const handler = cardEntry.keyboardShortcuts[modKey] ?? cardEntry.keyboardShortcuts[keyName];
  if (handler) {
    e.preventDefault();
    handler(cardEntry.key);
    return true;
  }
  return false;
}

function getFocusableCardElements(cardEl: HTMLElement | null): HTMLElement[] {
  if (!cardEl) return [];
  return Array.from(cardEl.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0,
  );
}

function isUserEditingText(el: HTMLElement | null): boolean {
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

function handleVerticalArrowNavigation(
  e: React.KeyboardEvent<HTMLElement>,
  cardEl: HTMLElement | null,
): void {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const activeEl =
    typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

  if (isUserEditingText(activeEl) || !cardEl) return;
  const elements = getFocusableCardElements(cardEl);
  if (elements.length === 0) return;

  e.preventDefault();
  const currentIndex = activeEl ? elements.indexOf(activeEl) : -1;
  const nextIndex =
    e.key === 'ArrowDown'
      ? (currentIndex + 1) % elements.length
      : (currentIndex - 1 + elements.length) % elements.length;
  elements[nextIndex]?.focus();
}

function handleHorizontalArrowNavigation(
  e: React.KeyboardEvent<HTMLElement>,
  cardEntry: TrailEntry,
  pinned: boolean,
  trailList: readonly TrailEntry[],
  floatCount: number,
  act?: { closeFrom: (index: number) => void },
): void {
  if (e.key === 'ArrowRight') {
    const activeEl =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
    if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A')) {
      e.preventDefault();
      activeEl.click();
    }
  } else if (e.key === 'ArrowLeft' && !pinned) {
    const trailIndex = trailList.findIndex((t) => t.key === cardEntry.key);
    if (trailIndex > 0) {
      e.preventDefault();
      act?.closeFrom(floatCount + trailIndex);
    }
  }
}

interface ResolvedNavParams {
  e: React.KeyboardEvent<HTMLElement> | undefined;
  cardEl: HTMLElement | null;
  cardEntry: TrailEntry | undefined;
  enableArrow: boolean;
  pinned: boolean;
  trailList: readonly TrailEntry[];
  floatCount: number;
  act?: { closeFrom: (index: number) => void };
}

function resolveNavParams(
  eventOrOptions: React.KeyboardEvent<HTMLElement> | CardKeyboardNavigationOptions,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry[],
  floatingCount?: number,
  actions?: { closeFrom: (index: number) => void },
): ResolvedNavParams {
  if (typeof eventOrOptions === 'object' && 'event' in eventOrOptions) {
    return {
      e: eventOrOptions.event,
      cardEl: eventOrOptions.cardElement ?? null,
      cardEntry: eventOrOptions.entry,
      enableArrow: Boolean(eventOrOptions.enableArrowNavigation),
      pinned: Boolean(eventOrOptions.isPinned),
      trailList: eventOrOptions.trail ?? [],
      floatCount: eventOrOptions.floatingCount ?? 0,
      act: eventOrOptions.actions,
    };
  }
  return {
    e: eventOrOptions,
    cardEl: cardElement ?? null,
    cardEntry: entry,
    enableArrow: Boolean(enableArrowNavigation),
    pinned: Boolean(isPinned),
    trailList: trail ?? [],
    floatCount: floatingCount ?? 0,
    act: actions,
  };
}

/**
 * Helper function for handling Arrow navigation and custom keyboard shortcuts on popover cards.
 */
export function handleCardKeyboardNavigation(
  eventOrOptions: React.KeyboardEvent<HTMLElement> | CardKeyboardNavigationOptions,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry[],
  floatingCount?: number,
  actions?: { closeFrom: (index: number) => void },
): void {
  const { e, cardEl, cardEntry, enableArrow, pinned, trailList, floatCount, act } =
    resolveNavParams(
      eventOrOptions,
      cardElement,
      entry,
      enableArrowNavigation,
      isPinned,
      trail,
      floatingCount,
      actions,
    );

  if (!e || !cardEntry) return;
  if (handleCustomShortcuts(e, cardEntry)) return;
  if (!enableArrow) return;

  handleVerticalArrowNavigation(e, cardEl);
  handleHorizontalArrowNavigation(e, cardEntry, pinned, trailList, floatCount, act);
}

function focusParentCard(parentKey: string): boolean {
  const escapedKey =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(parentKey)
      : parentKey.replace(/[^a-zA-Z0-9_-]/g, '');
  const parentCard = document.querySelector<HTMLElement>(`[aria-labelledby="title-${escapedKey}"]`);
  if (!parentCard) return false;

  const firstFocusable = parentCard.querySelector<HTMLElement>(
    "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
  );
  if (firstFocusable) {
    firstFocusable.focus();
    return true;
  }
  parentCard.focus();
  return true;
}

function tryRestorePreviousElementFocus(
  cardElement: HTMLElement | null,
  previouslyFocused: HTMLElement | null,
): boolean {
  if (!previouslyFocused || !document.body.contains(previouslyFocused)) return false;
  if (typeof previouslyFocused.focus !== 'function') return false;

  const activeEl = document.activeElement;
  const isFocusInside = cardElement?.contains(activeEl) || activeEl === document.body || !activeEl;
  if (isFocusInside) {
    previouslyFocused.focus();
    return true;
  }
  return false;
}

function restoreCardFocus(
  cardElement: HTMLElement | null,
  previouslyFocused: HTMLElement | null,
  parentKey?: string,
): void {
  if (tryRestorePreviousElementFocus(cardElement, previouslyFocused)) return;
  if (parentKey && focusParentCard(parentKey)) return;
  document.querySelector<HTMLElement>('h1')?.focus();
}

function resolveTransitionClassName(
  status: string | undefined,
  entryClasses: { mounting?: string; unmounting?: string; mounted?: string },
  globalClasses: { mounting?: string; unmounting?: string; mounted?: string },
): string {
  if (!status || (status !== 'mounting' && status !== 'mounted' && status !== 'unmounting')) {
    return '';
  }
  return entryClasses[status] ?? globalClasses[status] ?? '';
}

/**
 * A unified composite hook that encapsulates all layout positioning, keyboard/hover controls,
 * focus lock restoration, and actions into a single simple interface.
 * Independent of drag-and-drop libraries.
 *
 * @param options - Hook configuration settings.
 * @returns Object containing refs, compiled styles, interaction state flags, and actions.
 */
function useCardFocusManagement(
  entry: TrailEntry,
  cardRef: React.RefObject<HTMLElement | null>,
): void {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    }
    const cardElement = cardRef.current;

    return () => {
      if (entry.focusLockOptions?.returnFocus === false) return;
      restoreCardFocus(cardElement, previouslyFocusedElementRef.current, entry.parentKey);
    };
  }, [entry.parentKey, entry.focusLockOptions?.returnFocus, cardRef]);

  useEffect(() => {
    if (!entry.focusLockOptions?.autoFocusElement || typeof document === 'undefined') return;
    const autoFocus = entry.focusLockOptions.autoFocusElement;
    const target =
      typeof autoFocus === 'function'
        ? autoFocus()
        : typeof autoFocus === 'string' && autoFocus.trim() !== ''
          ? document.querySelector<HTMLElement>(autoFocus)
          : null;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, [entry.focusLockOptions, entry.focusLockOptions?.autoFocusElement]);

  useEffect(() => {
    if (!entry.focusLockOptions?.lockScroll || typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [entry.focusLockOptions?.lockScroll]);
}

function useCardMountingTransition(
  key: string,
  status: string | undefined,
  actions: PopoverActions,
): void {
  useEffect(() => {
    if (status === 'mounting') {
      let rAF2: number;
      const rAF1 = requestAnimationFrame(() => {
        rAF2 = requestAnimationFrame(() => {
          actions.setTransitionStatus(key, 'mounted');
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
  }, [key, status, actions]);
}

function useCardStoreSlice(entryKey: string) {
  return usePopoverStore(
    useCallback(
      (state: PopoverStore) => ({
        offset: state.offsets[entryKey] ?? DEFAULT_OFFSET,
        zIndex: state.zIndexOrder.indexOf(entryKey),
        isTop:
          state.zIndexOrder.length > 0 &&
          state.zIndexOrder[state.zIndexOrder.length - 1] === entryKey,
        enableArrowNavigation: state.enableArrowNavigation,
        trail: state.trail,
        floating: state.floating,
        baseZIndex: state.baseZIndex,
        mountingClassName: state.mountingClassName,
        unmountingClassName: state.unmountingClassName,
        mountedClassName: state.mountedClassName,
        zIndexBaseMap: state.zIndexBaseMap,
      }),
      [entryKey],
    ),
    shallowEqual,
  );
}

function resolveEffectiveBaseZIndex(
  entry: TrailEntry,
  zIndexBaseMap?: Record<string, number>,
  baseZIndex?: number,
): number {
  if (entry.baseZIndex !== undefined) return entry.baseZIndex;
  if (entry.stackGroup && zIndexBaseMap && zIndexBaseMap[entry.stackGroup] !== undefined) {
    return zIndexBaseMap[entry.stackGroup];
  }
  return baseZIndex ?? 1000;
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

  useCardFocusManagement(entry, ref);

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

  // Compile styles using the compiler utility (static offsets only)
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
    [enableArrowNavigation, isPinned, trail, floating.length, entry, actions],
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

  const handlePinToggle = useCallback(() => {
    if (ref.current) {
      actions.togglePin(entry.key, ref.current.getBoundingClientRect());
    } else {
      actions.togglePin(entry.key);
    }
  }, [actions, entry.key]);

  return {
    ref: setCombinedRef,
    style,
    isTop,
    isDragging: false,
    actions,
    dragHandleProps: {
      'aria-roledescription': 'draggable card handle',
      'aria-grabbed': false,
    },
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    transitionClassName,
    buttonControls,
    handlePinToggle,
  };
}
