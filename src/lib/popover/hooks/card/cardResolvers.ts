/**
 * Pure Calculation and Property Resolvers for Popover Cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/cardResolvers
 */

import { useEffect } from 'react';
import type { PopoverTransitionStatus, TrailEntry } from '../../types';
import { isTransitionStatus } from '../../utils/typeGuards';
import { DEFAULT_BASE_Z_INDEX, EMPTY_ARRAY } from '../../constants';
import { groupBy } from '../../utils/collections';

export function resolveTransitionClassName(
  status: string | undefined,
  entryClasses: { mounting?: string; unmounting?: string; mounted?: string },
  globalClasses: { mounting?: string; unmounting?: string; mounted?: string },
): string {
  if (!isTransitionStatus(status)) {
    return '';
  }
  return entryClasses[status] ?? globalClasses[status] ?? '';
}

export interface CardMountingTransitionActions<TPopoverKey extends string = string> {
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;
}

export function useCardMountingTransition<TPopoverKey extends string = string>(
  key: TPopoverKey,
  status: string | undefined,
  actions: CardMountingTransitionActions<TPopoverKey>,
): void {
  useEffect(() => {
    if (status === 'mounting') {
      let rAF = 0;
      let frameCount = 0;
      const step = () => {
        frameCount += 1;
        if (frameCount >= 2) {
          actions.setTransitionStatus(key, 'mounted');
        } else {
          rAF = requestAnimationFrame(step);
        }
      };
      rAF = requestAnimationFrame(step);
      return () => {
        if (rAF) cancelAnimationFrame(rAF);
      };
    }
    return undefined;
  }, [key, status, actions]);
}

export function resolveEffectiveBaseZIndex<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  zIndexBaseMap?: Record<string, number> | null,
  baseZIndex?: number,
): number {
  if (entry.baseZIndex !== undefined) return entry.baseZIndex;
  if (entry.stackGroup && zIndexBaseMap) {
    const mapped = zIndexBaseMap[entry.stackGroup];
    if (mapped !== undefined) return mapped;
  }
  return baseZIndex ?? DEFAULT_BASE_Z_INDEX;
}

export function resolveCardButtonControls<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  cardFeatures?: { enablePin?: boolean; enableClose?: boolean; enableDrag?: boolean },
) {
  return {
    enablePin: cardFeatures?.enablePin ?? entry.buttonControls?.enablePin ?? true,
    enableClose: cardFeatures?.enableClose ?? entry.buttonControls?.enableClose ?? true,
    enableDrag: cardFeatures?.enableDrag ?? entry.buttonControls?.enableDrag ?? true,
    customButtons: entry.buttonControls?.customButtons ?? EMPTY_ARRAY,
  };
}

/**
 * Groups active popover entries by their stackGroup identifier for layered z-index assignment.
 */
export function groupEntriesByStackGroup<TData = unknown, TPopoverKey extends string = string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
): Record<string, readonly TrailEntry<TData, TPopoverKey>[]> {
  return groupBy(entries, (entry) => entry.stackGroup ?? 'default');
}

