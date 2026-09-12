/**
 * Focus Lifecycle Management for popover cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/useCardFocusManagement
 */

import { useEffect, useRef } from 'react';
import type { TrailEntry } from '../../types';
import {
  isDOM,
  isFunction,
  isNonEmptyString,
  getActiveHTMLElement,
  canElementReceiveFocus,
  isFocusWithin,
} from '../../utils/typeGuards';
import { focusParentCard } from './useCardKeyboardNav';
import { useBodyScrollLock } from '../useBodyScrollLock';

function restoreCardFocus(
  cardElement: HTMLElement | null,
  previouslyFocused: HTMLElement | null,
  parentKey?: string,
): void {
  if (canElementReceiveFocus(previouslyFocused) && isFocusWithin(cardElement)) {
    previouslyFocused.focus();
    return;
  }
  if (parentKey) {
    focusParentCard(parentKey);
  }
}

export function useCardFocusManagement(
  entry: TrailEntry,
  cardRef: React.RefObject<HTMLElement | null>,
): void {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current = getActiveHTMLElement();
    }

    const cardElement = cardRef.current;
    return () => {
      if (entry.focusLockOptions?.returnFocus === false) return;
      restoreCardFocus(cardElement, previouslyFocusedElementRef.current, entry.parentKey);
    };
  }, [entry.parentKey, entry.focusLockOptions?.returnFocus, cardRef]);

  useEffect(() => {
    if (!entry.focusLockOptions?.autoFocusElement || !isDOM()) return;
    const autoFocus = entry.focusLockOptions.autoFocusElement;
    const target = isFunction(autoFocus)
      ? autoFocus()
      : isNonEmptyString(autoFocus)
        ? document.querySelector<HTMLElement>(autoFocus)
        : null;

    target?.focus?.();
  }, [entry.focusLockOptions, entry.focusLockOptions?.autoFocusElement]);

  useBodyScrollLock(entry.focusLockOptions?.lockScroll);
}
