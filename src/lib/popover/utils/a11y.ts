/**
 * WCAG 2.1 AA/AAA Accessibility and ARIA Attributes Resolvers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/a11y
 */

import type { TrailEntry } from '../types';
import { capitalize } from './stringUtils';

/**
 * Resolves an action label for accessibility with capitalized verb.
 *
 * @param action - Action verb (e.g. 'close', 'pin', 'expand').
 * @param entity - Target entity noun (default: 'popover').
 * @returns Human-readable ARIA label string.
 *
 * @example
 * ```typescript
 * resolveActionAriaLabel('close'); // "Close popover"
 * resolveActionAriaLabel('pin', 'card'); // "Pin card"
 * ```
 */
export function resolveActionAriaLabel(action: string, entity = 'popover'): string {
  return `${capitalize(action)} ${entity}`.trim();
}

/**
 * Computes standard WCAG-compliant ARIA dialog attributes for an active popover card.
 *
 * @param entry - Popover entry containing key and optional ariaDescribedby.
 * @param isPinned - If true, `aria-modal` is set to false to allow interaction with background elements.
 * @param userAriaLabel - Optional custom aria-label provided by the consumer.
 * @returns Object with role, aria-modal, aria-label, and aria-describedby.
 *
 * @example
 * ```typescript
 * const aria = resolvePopoverAriaAttributes(entry, false, 'User Settings');
 * // { role: 'dialog', 'aria-modal': true, 'aria-label': 'User Settings', ... }
 * ```
 */
export function resolvePopoverAriaAttributes(
  entry: Pick<TrailEntry, 'key' | 'ariaDescribedby'>,
  isPinned: boolean,
  userAriaLabel?: string,
): {
  role: string;
  'aria-modal': boolean;
  'aria-label': string;
  'aria-describedby'?: string;
} {
  return {
    role: 'dialog',
    'aria-modal': !isPinned,
    'aria-label': userAriaLabel || `Popover ${entry.key}`,
    'aria-describedby': entry.ariaDescribedby,
  };
}

/**
 * Computes standard ARIA attributes for a trigger element controlling a popover card.
 *
 * @param popoverKey - Controlled popover key.
 * @param isOpen - Whether the popover is currently active/open.
 * @returns Object with aria-haspopup, aria-expanded, and aria-controls.
 *
 * @example
 * ```typescript
 * const triggerAria = resolveTriggerAriaAttributes('profile-1', true);
 * // { 'aria-haspopup': 'dialog', 'aria-expanded': true, 'aria-controls': 'popover-card-profile-1' }
 * ```
 */
export function resolveTriggerAriaAttributes(
  popoverKey: string,
  isOpen: boolean,
): {
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string;
} {
  return {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': `popover-card-${popoverKey}`,
  };
}
