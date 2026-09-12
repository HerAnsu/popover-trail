/**
 * Lightweight Zero-Dependency Accessible Focus Trap Hook.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useFocusTrap
 */

import { useEffect, useRef, type RefObject } from 'react';
import { isBrowser } from '../utils/typeGuards';
import { findNextFocusable } from '../utils/domGuards';

export interface UseFocusTrapOptions {
  readonly enabled?: boolean;
  readonly autoFocus?: boolean;
  readonly returnFocus?: boolean;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions = {},
): void {
  const { enabled = true, autoFocus = true, returnFocus = true } = options;
  const prevActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !isBrowser()) return;

    const container = containerRef.current;
    if (!container) return;

    if (returnFocus) {
      prevActiveElement.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    if (autoFocus) {
      const first = findNextFocusable(container, false);
      if (first && typeof first.focus === 'function') first.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const first = findNextFocusable(container, false);
      const last = findNextFocusable(container, true);
      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (
        returnFocus &&
        prevActiveElement.current &&
        typeof prevActiveElement.current.focus === 'function'
      ) {
        prevActiveElement.current.focus();
      }
    };
  }, [containerRef, enabled, autoFocus, returnFocus]);
}
