/**
 * Lightweight Zero-Dependency Accessible Focus Trap Hook.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useFocusTrap
 */

import { useEffect, useRef, type RefObject } from 'react';
import { isBrowser } from '../utils/typeGuards';
import { findNextFocusable } from '../utils/domGuards';

/**
 * Options for configuring keyboard focus trapping within a container.
 */
export interface UseFocusTrapOptions {
  /** Whether focus trapping is active. Defaults to `true`. */
  readonly enabled?: boolean;
  /** Automatically focus the first focusable element on mount. Defaults to `true`. */
  readonly autoFocus?: boolean;
  /** Restore focus to the previously active element when unmounting. Defaults to `true`. */
  readonly returnFocus?: boolean;
}

/**
 * Traps keyboard Tab / Shift+Tab focus navigation within a container element.
 *
 * Implements accessible modal/dialog focus containment (WAI-ARIA Dialog):
 * - Cycles forward to the first focusable element when tabbing past the last.
 * - Cycles backward to the last focusable element when shift-tabbing past the first.
 * - Restores focus to the trigger element when unmounted.
 *
 * @param containerRef - React ref pointing to the DOM container element.
 * @param options - Focus trap configuration options.
 *
 * @example
 * ```tsx
 * function ModalDialog({ isOpen, onClose }: ModalProps) {
 *   const dialogRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap(dialogRef, { enabled: isOpen, autoFocus: true, returnFocus: true });
 *
 *   return (
 *     <div ref={dialogRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       <input placeholder="Name" />
 *     </div>
 *   );
 * }
 * ```
 */
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
