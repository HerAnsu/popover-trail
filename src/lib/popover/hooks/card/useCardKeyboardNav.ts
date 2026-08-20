import type { TrailEntry } from '../../types';
import { FOCUSABLE_ELEMENTS_SELECTOR } from '../../constants';

export type KeyboardNavEvent =
  | React.KeyboardEvent<HTMLElement>
  | Pick<React.KeyboardEvent<HTMLElement>, 'key' | 'preventDefault'>;

export interface CardKeyboardNavigationOptions {
  event: KeyboardNavEvent;
  cardElement: HTMLElement | null;
  entry: TrailEntry;
  enableArrowNavigation: boolean;
  isPinned: boolean;
  trail: readonly TrailEntry[];
  floatingCount: number;
  actions: { closeFrom: (index: number) => void };
}

function handleCustomShortcuts(e: KeyboardNavEvent, cardEntry: TrailEntry): boolean {
  if (!cardEntry.keyboardShortcuts) return false;
  const keyName = e.key;
  const modKey =
    (('metaKey' in e && e.metaKey) || ('ctrlKey' in e && e.ctrlKey) ? 'Mod+' : '') + keyName;
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
  return Array.from(
    cardEl.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
    (el) => el,
  ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
}

function isUserEditingText(el: HTMLElement | null): boolean {
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

function getActiveHtmlElement(): HTMLElement | null {
  return typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
}

function handleVerticalArrowNavigation(e: KeyboardNavEvent, cardEl: HTMLElement | null): void {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const activeEl = getActiveHtmlElement();

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

function handleArrowRightNavigation(e: KeyboardNavEvent): void {
  if (e.key !== 'ArrowRight') return;
  const activeEl = getActiveHtmlElement();
  if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A')) {
    e.preventDefault();
    activeEl.click();
  }
}

function handleArrowLeftNavigation(
  e: KeyboardNavEvent,
  cardEntry: TrailEntry,
  pinned: boolean,
  trailList: readonly TrailEntry[],
  act?: { closeFrom: (index: number) => void },
): void {
  if (e.key !== 'ArrowLeft' || pinned) return;
  const trailIndex = trailList.findIndex((t) => t.key === cardEntry.key);
  if (trailIndex > 0) {
    e.preventDefault();
    act?.closeFrom(trailIndex);
    const parentKey = trailList[trailIndex - 1]?.key;
    if (parentKey) {
      focusParentCard(parentKey);
    }
  }
}

function handleEscapeNavigation(
  e: KeyboardNavEvent,
  cardEntry: TrailEntry,
  pinned: boolean,
  trailList: readonly TrailEntry[],
  floatCount: number,
  act?: { closeFrom: (index: number) => void },
): void {
  if (e.key !== 'Escape') return;
  e.preventDefault();
  if (!pinned) {
    const trailIndex = trailList.findIndex((t) => t.key === cardEntry.key);
    if (trailIndex >= 0) {
      act?.closeFrom(trailIndex);
    }
  } else if (act?.closeFrom) {
    act.closeFrom(floatCount);
  }
}

function handleHorizontalArrowNavigation(
  e: KeyboardNavEvent,
  cardEntry: TrailEntry,
  pinned: boolean,
  trailList: readonly TrailEntry[],
  floatCount: number,
  act?: { closeFrom: (index: number) => void },
): void {
  handleArrowRightNavigation(e);
  handleArrowLeftNavigation(e, cardEntry, pinned, trailList, act);
  handleEscapeNavigation(e, cardEntry, pinned, trailList, floatCount, act);
}

/**
 * Focuses the parent popover card in the cascade tree by resolving its DOM ID or data-key.
 *
 * @param parentKey - Unique key string of the parent card.
 * @returns True if the parent card was found and focused.
 */
export function focusParentCard(parentKey: string): boolean {
  if (typeof document === 'undefined' || !parentKey) return false;

  const escapedKey =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(parentKey)
      : parentKey.replace(/[^a-zA-Z0-9_-]/g, '');

  // Robust multi-selector lookup matching PopoverCard and dnd PopoverCard DOM structures
  const parentCard =
    document.querySelector<HTMLElement>(`#popover-card-${escapedKey}`) ??
    document.querySelector<HTMLElement>(`[data-key="${escapedKey}"]`) ??
    document.querySelector<HTMLElement>(`[aria-labelledby="title-${escapedKey}"]`);

  if (!parentCard) return false;

  const firstFocusable = parentCard.querySelector<HTMLElement>(
    "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
  );

  if (firstFocusable && typeof firstFocusable.focus === 'function') {
    firstFocusable.focus();
    return true;
  }

  if (typeof parentCard.focus === 'function') {
    parentCard.focus();
    return true;
  }

  return false;
}

function isNavOptionsObject(
  arg: KeyboardNavEvent | CardKeyboardNavigationOptions,
): arg is CardKeyboardNavigationOptions {
  return 'event' in arg && typeof arg.event === 'object';
}

function resolveNavParams(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavigationOptions,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry[],
  floatingCount?: number,
  actions?: { closeFrom: (index: number) => void },
) {
  if (isNavOptionsObject(eventOrOptions)) {
    return {
      e: eventOrOptions.event,
      cardEl: eventOrOptions.cardElement,
      cardEntry: eventOrOptions.entry,
      enableArrow: eventOrOptions.enableArrowNavigation,
      pinned: eventOrOptions.isPinned,
      trailList: eventOrOptions.trail ?? [],
      floatCount: eventOrOptions.floatingCount,
      act: eventOrOptions.actions,
    };
  }

  return {
    e: eventOrOptions,
    cardEl: cardElement,
    cardEntry: entry,
    enableArrow: Boolean(enableArrowNavigation),
    pinned: Boolean(isPinned),
    trailList: trail ?? [],
    floatCount: floatingCount ?? 0,
    act: actions,
  };
}

/**
 * Handles Arrow navigation and custom keyboard shortcuts on popover cards.
 */
export function handleCardKeyboardNavigation(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavigationOptions,
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

  handleVerticalArrowNavigation(e, cardEl ?? null);
  handleHorizontalArrowNavigation(e, cardEntry, pinned, trailList, floatCount, act);
}
