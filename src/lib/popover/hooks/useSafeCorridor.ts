/**
 * Hook for Safe Diagonal Pointer Corridor Navigation (Amazon/macOS Menu Style).
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useSafeCorridor
 */

import { useEffect, useState } from 'react';
import { isCursorInSafeCorridor } from '../utils/spatial';
import { sharedPointPool, sharedBoxPool } from '../utils/pool/spatialPools';
import { useLatestRef } from './useHookUtils';

export interface UseSafeCorridorOptions {
  readonly triggerRef: React.RefObject<HTMLElement | null>;
  readonly childCardId?: string;
  readonly enabled?: boolean;
  readonly onLeave?: () => void;
}

/**
 * Hook providing pointer-safe corridor tracking between a menu trigger and its open child card.
 *
 * @remarks
 * Prevents submenus from accidentally closing when the user moves the pointer diagonally
 * across neighboring menu items towards the submenu (Amazon / macOS style menu navigation).
 *
 * @example
 * ```tsx
 * const { isInsideCorridor } = useSafeCorridor({
 *   triggerRef,
 *   childCardId: 'nested-menu',
 *   onLeave: () => closeSubmenu(),
 * });
 * ```
 *
 * @param options - Hook configuration options.
 * @returns Object with boolean `isInsideCorridor` flag.
 */
export function useSafeCorridor({
  triggerRef,
  childCardId,
  enabled = true,
  onLeave,
}: UseSafeCorridorOptions): { isInsideCorridor: boolean } {
  const [isInside, setIsInside] = useState(false);
  const onLeaveRef = useLatestRef(onLeave);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const trigger = triggerRef.current;
      if (!trigger || !childCardId || typeof document === 'undefined') return;

      const el = document.getElementById(`popover-card-${childCardId}`);
      const r = el?.getBoundingClientRect();
      if (!r) return;

      const tRect = trigger.getBoundingClientRect();
      const pAnchor = sharedPointPool.acquire();
      const pCursor = sharedPointPool.acquire();
      const targetBox = sharedBoxPool.acquire();

      try {
        const { left: tLeft, top: tTop, width: tWidth, height: tHeight } = tRect;
        const { left: rLeft, top: rTop, width: rWidth, height: rHeight } = r;
        const { clientX, clientY } = e;

        pAnchor.x = tLeft + tWidth / 2;
        pAnchor.y = tTop + tHeight / 2;
        pCursor.x = clientX;
        pCursor.y = clientY;
        targetBox.x = rLeft;
        targetBox.y = rTop;
        targetBox.width = rWidth;
        targetBox.height = rHeight;

        const inside = isCursorInSafeCorridor(pCursor, pAnchor, targetBox);
        setIsInside(inside);

        if (!inside && onLeaveRef.current) {
          onLeaveRef.current();
        }
      } finally {
        sharedPointPool.release(pAnchor);
        sharedPointPool.release(pCursor);
        sharedBoxPool.release(targetBox);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, triggerRef, childCardId, onLeaveRef]);

  return { isInsideCorridor: isInside };
}
