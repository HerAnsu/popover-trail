/**
 * Keyboard Event & Navigation Key Predicates.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/keyboardGuards
 */

import { isObjectRecord } from './objectGuards';

export * from './keyboardNavGuards';

export interface KeyIdentifiable {
  readonly key: string;
}

export interface ModifierIdentifiable {
  readonly metaKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly altKey?: boolean;
  readonly shiftKey?: boolean;
}

/** Type guard verifying if an unknown entity has a string key property. */
export function isKeyIdentifiable(val: unknown): val is KeyIdentifiable {
  return isObjectRecord(val) && typeof val.key === 'string';
}

/** Type guard verifying if an unknown value is a native KeyboardEvent or duck-type. */
export function isKeyboardEvent(val: unknown): val is KeyboardEvent {
  if (typeof KeyboardEvent !== 'undefined' && val instanceof KeyboardEvent) return true;
  return isKeyIdentifiable(val) && 'preventDefault' in val;
}

/** Helper predicate checking if an event matches a specific key string. */
export function isKey(e: KeyIdentifiable, key: string): boolean {
  return e.key === key;
}

/** Checks if the event key corresponds to Escape. */
export function isEscapeKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'Escape');
}

/** Checks if the event key corresponds to Tab. */
export function isTabKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'Tab');
}

/** Checks if the event key corresponds to Enter. */
export function isEnterKey(e: KeyIdentifiable): boolean {
  return isKey(e, 'Enter');
}

/** Checks if the event key corresponds to Space. */
export function isSpaceKey(e: KeyIdentifiable): boolean {
  return isKey(e, ' ') || isKey(e, 'Spacebar');
}

/** Checks if the event key is a WCAG standard activation key (Enter or Space). */
export function isActivationKey(e: KeyIdentifiable): boolean {
  return isEnterKey(e) || isSpaceKey(e);
}

/** Checks if any modifier keys (Cmd/Ctrl/Alt/Shift) are active. */
export function hasModifierKey(e: ModifierIdentifiable): boolean {
  return Boolean(e.metaKey || e.ctrlKey || e.altKey || e.shiftKey);
}
