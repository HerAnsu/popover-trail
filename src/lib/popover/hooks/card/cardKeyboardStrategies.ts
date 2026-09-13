/**
 * Keyboard Navigation Strategy implementations for popover cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/cardKeyboardStrategies
 */

import type { TrailEntry } from '../../types';
import {
  getActiveHTMLElement,
  isEscapeKey,
  isArrowDownKey,
  isArrowLeftKey,
  isArrowRightKey,
  isVerticalArrowKey,
  isTextEditableElement,
  isClickableElement,
} from '../../utils/typeGuards';
import { getFocusableCardElements, focusParentCard } from './cardKeyboardFocus';
import { isMatchingKey } from '../../utils/predicates';

export type KeyboardNavEvent =
  | React.KeyboardEvent<HTMLElement>
  | Pick<React.KeyboardEvent<HTMLElement>, 'key' | 'preventDefault'>;

export function handleCustomShortcuts<TData = unknown, TPopoverKey extends string = string>(
  e: KeyboardNavEvent,
  cardEntry: TrailEntry<TData, TPopoverKey>,
): boolean {
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

export function handleVerticalArrowNavigation(
  e: KeyboardNavEvent,
  cardEl: HTMLElement | null,
): void {
  if (!isVerticalArrowKey(e)) return;
  const activeEl = getActiveHTMLElement();
  if (isTextEditableElement(activeEl) || !cardEl) return;
  const elements = getFocusableCardElements(cardEl);
  if (elements.length === 0) return;

  e.preventDefault();
  const currentIndex = activeEl ? elements.indexOf(activeEl) : -1;
  const nextIndex = isArrowDownKey(e)
    ? (currentIndex + 1) % elements.length
    : (currentIndex - 1 + elements.length) % elements.length;
  elements[nextIndex]?.focus();
}

export function handleHorizontalArrowNavigation<
  TData = unknown,
  TPopoverKey extends string = string,
>(
  e: KeyboardNavEvent,
  cardEntry: TrailEntry<TData, TPopoverKey>,
  pinned: boolean,
  trailList: readonly TrailEntry<TData, TPopoverKey>[],
  act?: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  },
): void {
  if (isArrowRightKey(e)) {
    const activeEl = getActiveHTMLElement();
    if (isClickableElement(activeEl)) {
      e.preventDefault();
      activeEl.click();
    }
  } else if (isArrowLeftKey(e) && !pinned) {
    const trailIndex = trailList.findIndex(isMatchingKey(cardEntry.key));
    if (trailIndex > 0) {
      e.preventDefault();
      if (act?.closeByKey) act.closeByKey(cardEntry.key);
      else act?.closeFrom(trailIndex);
      const parentKey = trailList[trailIndex - 1]?.key;
      if (parentKey) focusParentCard(parentKey);
    }
  } else if (isEscapeKey(e)) {
    e.preventDefault();
    if (act?.closeByKey) {
      act.closeByKey(cardEntry.key);
    } else if (!pinned) {
      const trailIndex = trailList.findIndex(isMatchingKey(cardEntry.key));
      if (trailIndex >= 0) act?.closeFrom(trailIndex);
    }
  }
}
