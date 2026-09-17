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

/**
 * Manages the focus lifecycle of a popover card.
 *
 * Responsibilities:
 * 1. Preserves the previously focused DOM element prior to mounting.
 * 2. Optionally focuses a specified initial element (`autoFocusElement`).
 * 3. Restores focus upon card unmount to either the previously focused element or the parent card.
 * 4. Coordinates background body scroll locking when enabled.
 *
 * @param entry - Active popover trail entry with focus lock configuration.
 * @param cardRef - Ref to the card's root DOM element.
 *
 * @example
 * ```tsx
 * function PopoverCardView({ entry }: { entry: TrailEntry }) {
 *   const cardRef = useRef<HTMLDivElement>(null);
 *   useCardFocusManagement(entry, cardRef);
 *   return <div ref={cardRef}>...</div>;
 * }
 * ```
 */
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
