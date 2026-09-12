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

export function useBodyScrollLock(shouldLock?: boolean): void {
  useEffect(() => {
    if (!shouldLock || !isDOM()) return;
    acquireScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [shouldLock]);
}
