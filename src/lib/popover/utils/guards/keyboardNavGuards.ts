/**
 * Keyboard Navigation & Directional Arrow Key Predicates.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/keyboardNavGuards
 */

import { isKey, type KeyIdentifiable } from './keyboardGuards';

/** Checks if the event key corresponds to ArrowUp. */
export function isArrowUpKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'ArrowUp');
}

/** Checks if the event key corresponds to ArrowDown. */
export function isArrowDownKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'ArrowDown');
}

/** Checks if the event key corresponds to ArrowLeft. */
export function isArrowLeftKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'ArrowLeft');
}

/** Checks if the event key corresponds to ArrowRight. */
export function isArrowRightKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'ArrowRight');
}

/** Checks if the event key is a vertical arrow navigation key (ArrowUp or ArrowDown). */
export function isVerticalArrowKey(e: KeyIdentifiable): boolean {
  return isArrowDownKey(e) || isArrowUpKey(e);
}

/** Checks if the event key is a horizontal arrow navigation key (ArrowLeft or ArrowRight). */
export function isHorizontalArrowKey(e: KeyIdentifiable): boolean {
  return isArrowLeftKey(e) || isArrowRightKey(e);
}

/** Checks if the event key corresponds to Home. */
export function isHomeKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'Home');
}

/** Checks if the event key corresponds to End. */
export function isEndKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'End');
}
