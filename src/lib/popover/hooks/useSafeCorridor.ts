/**
 * Hook for Safe Diagonal Pointer Corridor Navigation (Amazon/macOS Menu Style).
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useSafeCorridor
 */

import { useEffect, useRef, useState } from 'react';
import { isCursorInSafeCorridor } from '../utils/spatial';
import { sharedPointPool, sharedBoxPool } from '../utils/pool/spatialPools';

export interface UseSafeCorridorOptions {
  readonly triggerRef: React.RefObject<HTMLElement | null>;
  readonly childCardId?: string;
  readonly enabled?: boolean;
  readonly onLeave?: () => void;
}

export function useSafeCorridor({
  triggerRef,
  childCardId,
  enabled = true,
  onLeave,
}: UseSafeCorridorOptions): { isInsideCorridor: boolean } {
  const [isInside, setIsInside] = useState(false);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

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
        pAnchor.x = tRect.left + tRect.width / 2;
        pAnchor.y = tRect.top + tRect.height / 2;
        pCursor.x = e.clientX;
        pCursor.y = e.clientY;
        targetBox.x = r.left;
        targetBox.y = r.top;
        targetBox.width = r.width;
        targetBox.height = r.height;

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
  }, [enabled, triggerRef, childCardId]);

  return { isInsideCorridor: isInside };
}
