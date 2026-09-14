/**
 * DOM Focus Utilities for Card Keyboard Navigation.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/cardKeyboardFocus
 */

import { FOCUSABLE_ELEMENTS_SELECTOR } from '../../constants';
import { isDOM, escapeCssIdentifier } from '../../utils/typeGuards';
import { compact } from '../../utils/collections';
import { first } from '../../utils/arrayUtils';

export function getFocusableCardElements(cardEl: HTMLElement | null): HTMLElement[] {
  if (!cardEl) return [];
  return Array.from(
    cardEl.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
    (el) => el,
  ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
}

export function focusParentCard(parentKey: string): boolean {
  if (!isDOM() || !parentKey) return false;
  const escapedKey = escapeCssIdentifier(parentKey);

  const parentCard = first(
    compact([
      document.querySelector<HTMLElement>(`#popover-card-${escapedKey}`),
      document.querySelector<HTMLElement>(`[data-key="${escapedKey}"]`),
      document.querySelector<HTMLElement>(`[aria-labelledby="title-${escapedKey}"]`),
    ]),
  );

  if (!parentCard) return false;

  const firstFocusable = parentCard.querySelector<HTMLElement>(
    "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
  );

  if (firstFocusable) {
    firstFocusable.focus?.();
    return true;
  }

  parentCard.focus?.();
  return true;
}
