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

/**
 * Configuration options for calculating popover card positioning, offset, and styling.
 */
export interface UseCardPositioningOptions {
  /** Active popover trail entry. */
  entry: TrailEntry;
  /** Positional index within active trail. */
  index: number;
  /** Whether the card is pinned. */
  isPinned: boolean;
  /** Preferred placement fallback (default: 'bottom'). */
  placement?: PopoverPlacement;
  /** Calculated coordinate offsets. */
  offset: { readonly x: number; readonly y: number };
  /** Relative stack z-index order. */
  zIndex: number;
  /** Computed base z-index. */
  effectiveBaseZIndex: number;
}

/**
 * Computes floating coordinates, layout offsets, and inline CSS positioning styles for a popover card.
 *
 * @param options - Positioning options.
 * @returns Object containing DOM `ref`, combined ref callback `setCombinedRef`, and `style` CSSProperties.
 *
 * @example
 * ```tsx
 * const { ref, setCombinedRef, style } = useCardPositioning({
 *   entry,
 *   index,
 *   isPinned,
 *   offset,
 *   zIndex,
 *   effectiveBaseZIndex,
 * });
 * return <div ref={setCombinedRef} style={style}>...</div>;
 * ```
 */
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
