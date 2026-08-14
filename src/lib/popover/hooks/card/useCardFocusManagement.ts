import { useEffect, useRef } from 'react';
import type { TrailEntry } from '../../types';
import { focusParentCard } from './useCardKeyboardNav';

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

/**
 * Manages WAI-ARIA focus lifecycle for a popover card.
 *
 * @remarks
 * Encapsulates accessibility focus behaviors:
 * - Remembers the previously focused trigger element before mounting.
 * - Auto-focuses a target selector or callback when specified (`autoFocusElement`).
 * - Locks document scrolling when `lockScroll: true` is configured.
 * - Restores focus to the original trigger element or parent card upon unmounting.
 *
 * @param entry - TrailEntry configuration including focusLockOptions.
 * @param cardRef - React ref pointing to the card container element.
 */
export function useCardFocusManagement(
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
