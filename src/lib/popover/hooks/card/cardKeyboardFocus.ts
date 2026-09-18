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

/**
 * Queries all visible, interactive, focusable DOM elements inside a card container.
 * Filters out hidden elements (zero dimensions and empty client rects).
 *
 * @param cardEl - Root container element of the card.
 * @returns Array of focusable HTMLElements in document order.
 *
 * @example
 * ```ts
 * const elements = getFocusableCardElements(cardElement);
 * elements[0]?.focus();
 * ```
 */
export function getFocusableCardElements(cardEl: HTMLElement | null): HTMLElement[] {
  if (!cardEl) return [];
  return Array.from(
    cardEl.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
    (el) => el,
  ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
}

/**
 * Traverses DOM to locate and shift focus back to the parent card of a nested popover.
 * Queries by `#popover-card-${escapedKey}`, `[data-key]`, or `[aria-labelledby]`.
 * Focuses the first focusable child element inside the parent card, or the card element itself.
 *
 * @param parentKey - Unique key string of the parent card.
 * @returns `true` if parent card was found and focused; `false` otherwise.
 *
 * @example
 * ```ts
 * const focused = focusParentCard('menu-root');
 * ```
 */
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
