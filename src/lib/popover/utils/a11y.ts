/**
 * WCAG 2.1 AA/AAA Accessibility and ARIA Attributes Resolvers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/a11y
 */

import type { TrailEntry } from '../types';

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
