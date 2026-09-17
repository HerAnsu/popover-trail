/**
 * Modifier Composition Hook for PopoverCanvas.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndCanvasModifiers
 */

import { useMemo, useCallback } from 'react';
import type { Modifier } from '@dnd-kit/core';
import type { TrailEntry } from '../types';
import { clampToViewport, clampToContainer } from './dndClamp';
import { createMagneticSnapModifier, type SnapTargetRect } from './dndSnap';

/**
 * Configuration options for composing dnd-kit modifiers on the popover canvas.
 */
export interface UseCanvasModifiersOptions {
  /** Optional array of consumer-supplied dnd-kit modifiers. */
  readonly modifiers?: Modifier[];
  /** Whether to clamp card dragging to the browser window viewport. */
  readonly restrictToWindow?: boolean;
  /** Whether to clamp card dragging to the canvas container element bounds. */
  readonly restrictToContainer?: boolean;
  /** Whether magnetic boundary snapping between sibling cards is enabled. */
  readonly enableSnapping?: boolean;
  /** Pixel distance threshold for magnetic snapping (default: 12). */
  readonly snapThreshold?: number;
  /** Ref to the container DOM element when `restrictToContainer` is enabled. */
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
  /** Active popover entries used to derive obstacle boundaries for magnetic snapping. */
  readonly activeEntries: readonly { readonly entry: TrailEntry<unknown> }[];
}

/**
 * Composes dnd-kit modifiers for boundary clamping, container restrictions, and magnetic snapping.
 * Memoizes modifier pipelines to prevent re-instantiation on intermediate animation frames.
 *
 * @param options - Modifier configuration options.
 * @returns Array of active dnd-kit `Modifier` functions.
 *
 * @example
 * ```tsx
 * const modifiers = useCanvasModifiers({
 *   restrictToWindow: true,
 *   enableSnapping: true,
 *   snapThreshold: 12,
 *   containerRef,
 *   activeEntries,
 * });
 * ```
 */
export function useCanvasModifiers({
  modifiers,
  restrictToWindow,
  restrictToContainer,
  enableSnapping,
  snapThreshold,
  containerRef,
  activeEntries,
}: UseCanvasModifiersOptions): Modifier[] {
  const getObstacles = useCallback((): SnapTargetRect[] => {
    if (typeof document === 'undefined') return [];
    const list: SnapTargetRect[] = [];
    for (const item of activeEntries) {
      const el = document.getElementById(`popover-card-${item.entry.key}`);
      const r = el?.getBoundingClientRect();
      if (r) {
        list.push({
          id: item.entry.key,
          rect: { x: r.left, y: r.top, width: r.width, height: r.height },
        });
      }
    }
    return list;
  }, [activeEntries]);

  return useMemo(() => {
    const list: Modifier[] = [];
    if (enableSnapping) {
      list.push(createMagneticSnapModifier(getObstacles, snapThreshold));
    }
    if (restrictToWindow) {
      list.push(({ transform, activeNodeRect }) =>
        activeNodeRect ? clampToViewport(transform, activeNodeRect) : transform,
      );
    }
    if (restrictToContainer) {
      list.push(({ transform, activeNodeRect }) => {
        if (!activeNodeRect || !containerRef.current) return transform;
        return clampToContainer(
          transform,
          activeNodeRect,
          containerRef.current.getBoundingClientRect(),
        );
      });
    }
    if (modifiers) list.push(...modifiers);
    return list;
  }, [
    enableSnapping,
    restrictToWindow,
    restrictToContainer,
    snapThreshold,
    getObstacles,
    containerRef,
    modifiers,
  ]);
}
