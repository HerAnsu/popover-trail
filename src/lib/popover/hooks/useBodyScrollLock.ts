/**
 * Body Scroll Lock hook with scrollbar width compensation.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useBodyScrollLock
 */

import { useEffect } from 'react';
import { isDOM } from '../utils/typeGuards';

let activeScrollLockCount = 0;
let originalBodyOverflow: string | null = null;
let originalBodyPaddingRight: string | null = null;

/**
 * Acquires a reference-counted lock on body scrolling.
 *
 * Hides document body overflow and compensates for layout shifts by adding
 * right-padding matching the scrollbar width. Safe to call multiple times.
 *
 * @example
 * ```typescript
 * acquireScrollLock();
 * // later in teardown:
 * releaseScrollLock();
 * ```
 */
export function acquireScrollLock(): void {
  if (!isDOM()) return;
  if (activeScrollLockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  activeScrollLockCount++;
}

/**
 * Decrements the body scroll lock reference counter and restores body overflow/padding when reaching zero.
 *
 * @example
 * ```typescript
 * releaseScrollLock();
 * ```
 */
export function releaseScrollLock(): void {
  if (!isDOM()) return;
  if (activeScrollLockCount > 0) {
    activeScrollLockCount--;
    if (activeScrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow ?? '';
      document.body.style.paddingRight = originalBodyPaddingRight ?? '';
      originalBodyOverflow = null;
      originalBodyPaddingRight = null;
    }
  }
}

/**
 * Locks background document body scrolling when a modal or popover is open.
 *
 * Uses reference counting so nested popovers can each request a lock safely.
 * Restores original body overflow and padding styles when unmounted or disabled.
 *
 * @param shouldLock - Boolean indicating whether scrolling should currently be locked.
 *
 * @example
 * ```tsx
 * function ModalOverlay({ isOpen }: { isOpen: boolean }) {
 *   useBodyScrollLock(isOpen);
 *
 *   if (!isOpen) return null;
 *   return <div className="modal-backdrop">...</div>;
 * }
 * ```
 */
export function useBodyScrollLock(shouldLock?: boolean): void {
  useEffect(() => {
    if (!shouldLock || !isDOM()) return;
    acquireScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [shouldLock]);
}
