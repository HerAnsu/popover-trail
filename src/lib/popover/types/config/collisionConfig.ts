/**
 * Collision Avoidance, Outside Click, and Focus Trapping Configurations.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/config/collisionConfig
 */

import type { Boundary } from '@floating-ui/react';

export interface ClickOutsideConfig {
  enabled?: boolean;
  ignoreSelector?: string;
  ignoreClass?: string;
  popoverSelector?: string;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
}

export interface FocusLockOptions {
  enabled?: boolean;
  autoFocusElement?: string | (() => HTMLElement | null);
  returnFocus?: boolean;
  lockScroll?: boolean;
}

export interface CollisionConfig {
  enabled: boolean;
  boundary?: Boundary | (() => Element | null);
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  flip?: boolean;
  shift?: boolean;
  size?: boolean;
}
