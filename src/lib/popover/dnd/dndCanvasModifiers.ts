/**
 * Modifier Composition Hook for PopoverCanvas.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndCanvasModifiers
 */

import { useMemo, useCallback } from 'react';
import type { Modifier } from '@dnd-kit/core';
import type { TrailEntry } from '../types';
import { clampToWindowBounds, clampToContainerBounds } from './dndClamp';
import { createMagneticSnapModifier, type SnapTargetRect } from './dndSnap';

export interface UseCanvasModifiersOptions {
  readonly modifiers?: Modifier[];
  readonly restrictToWindow?: boolean;
  readonly restrictToContainer?: boolean;
  readonly enableSnapping?: boolean;
  readonly snapThreshold?: number;
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
  readonly activeEntries: readonly { readonly entry: TrailEntry<unknown> }[];
}

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
        activeNodeRect ? clampToWindowBounds(transform, activeNodeRect) : transform,
      );
    }
    if (restrictToContainer) {
      list.push(({ transform, activeNodeRect }) => {
        if (!activeNodeRect || !containerRef.current) return transform;
        return clampToContainerBounds(
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
