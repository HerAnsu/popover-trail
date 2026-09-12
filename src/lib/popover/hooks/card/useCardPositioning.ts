/**
 * Card Geometry & Positioning Hook for popover cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/useCardPositioning
 */

import { useRef, useCallback, type CSSProperties } from 'react';
import { usePopoverGeometry } from '../useGeometry';
import { getPopoverStyles } from '../../utils/styles';
import type { TrailEntry, PopoverPlacement } from '../../types';

export interface UseCardPositioningOptions {
  entry: TrailEntry;
  index: number;
  isPinned: boolean;
  placement?: PopoverPlacement;
  offset: { readonly x: number; readonly y: number };
  zIndex: number;
  effectiveBaseZIndex: number;
}

export function useCardPositioning({
  entry,
  index,
  isPinned,
  placement = 'bottom',
  offset,
  zIndex,
  effectiveBaseZIndex,
}: UseCardPositioningOptions) {
  const ref = useRef<HTMLElement | null>(null);

  const { finalLayoutPos, setFloating } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    placement: entry.placement ?? placement,
    zIndex: index,
    isDragging: false,
    isPinned,
    entry,
  });

  const style: Readonly<CSSProperties> = getPopoverStyles({
    finalLayoutPos,
    offset,
    dragX: 0,
    dragY: 0,
    rotation: 0,
    zIndex: zIndex + effectiveBaseZIndex,
  });

  const setCombinedRef = useCallback(
    (node: HTMLElement | null) => {
      setFloating(node);
      ref.current = node;
    },
    [setFloating],
  );

  return { ref, setCombinedRef, style };
}
