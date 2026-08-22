/**
 * Focus & Scroll Locking Lifecycle Management for popover cards.
 *
 * @module hooks/card/useCardFocusManagement
 */

import { useEffect, useRef } from 'react';
import type { TrailEntry } from '../../types';
import { focusParentCard } from './useCardKeyboardNav';

let activeScrollLockCount = 0;
let originalBodyOverflow: string | null = null;

function acquireScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (activeScrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activeScrollLockCount++;
}

function releaseScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (activeScrollLockCount > 0) {
    activeScrollLockCount--;
    if (activeScrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow ?? '';
      originalBodyOverflow = null;
    }
  }
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
  if (parentKey) {
    focusParentCard(parentKey);
  }
}

/**
 * Manages WAI-ARIA focus lifecycle and body scroll lock for a popover card.
 */
export function useCardFocusManagement(
  entry: TrailEntry,
  cardRef: React.RefObject<HTMLElement | null>,
): void {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (
      !previouslyFocusedElementRef.current &&
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement
    ) {
      previouslyFocusedElementRef.current = document.activeElement;
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
        : autoFocus.trim() !== ''
          ? document.querySelector<HTMLElement>(autoFocus)
          : null;

    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, [entry.focusLockOptions, entry.focusLockOptions?.autoFocusElement]);

  useEffect(() => {
    if (!entry.focusLockOptions?.lockScroll || typeof document === 'undefined') return;

    acquireScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [entry.focusLockOptions?.lockScroll]);
}
