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

/**
 * Computes the CSS class name for a card's current lifecycle transition status.
 *
 * Checks entry-specific class overrides first, then falls back to global theme classes.
 *
 * @param status - Active transition status ('mounting' | 'unmounting' | 'mounted' | undefined).
 * @param entryClasses - Entry-specific class overrides.
 * @param globalClasses - Global default class names.
 * @returns Resolved CSS class string.
 *
 * @example
 * ```ts
 * const cls = resolveTransitionClassName('mounting', { mounting: 'fade-in' }, { mounting: 'enter' });
 * // returns 'fade-in'
 * ```
 */
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

/**
 * Action callbacks needed for card mounting transition updates.
 */
export interface CardMountingTransitionActions<TPopoverKey extends string = string> {
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;
}

/**
 * Schedules a two-frame rAF cycle when mounting to ensure the browser has painted
 * before transitioning the status from 'mounting' to 'mounted'.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - Popover card key.
 * @param status - Current transition status.
 * @param actions - Object containing `setTransitionStatus`.
 *
 * @example
 * ```tsx
 * useCardMountingTransition(entry.key, entry.transitionStatus, {
 *   setTransitionStatus: actions.setTransitionStatus,
 * });
 * ```
 */
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

/**
 * Determines the effective base z-index for an entry considering entry overrides,
 * stackGroup mappings, and global defaults.
 *
 * @template TData - Stored data type.
 * @template TPopoverKey - Branded key type.
 * @param entry - The popover trail entry.
 * @param zIndexBaseMap - Optional mapping of stack groups to base z-indices.
 * @param baseZIndex - Global base z-index fallback.
 * @returns The resolved numeric base z-index.
 *
 * @example
 * ```ts
 * const baseZ = resolveEffectiveBaseZIndex(entry, { modal: 2000 }, 1000);
 * ```
 */
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

/**
 * Resolves button visibility and custom buttons for a card header or footer.
 *
 * @template TData - Stored data type.
 * @template TPopoverKey - Branded key type.
 * @param entry - The trail entry.
 * @param cardFeatures - Optional consumer feature toggles.
 * @returns An object with booleans `enablePin`, `enableClose`, `enableDrag`, and `customButtons`.
 *
 * @example
 * ```ts
 * const controls = resolveCardButtonControls(entry, { enablePin: false });
 * ```
 */
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
 *
 * @template TData - Stored data type.
 * @template TPopoverKey - Branded key type.
 * @param entries - Array of active trail entries.
 * @returns A dictionary grouping entries by stackGroup (or 'default').
 *
 * @example
 * ```ts
 * const grouped = groupEntriesByStackGroup(activeEntries);
 * const modalEntries = grouped['modal'] ?? [];
 * ```
 */
export function groupEntriesByStackGroup<TData = unknown, TPopoverKey extends string = string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
): Record<string, readonly TrailEntry<TData, TPopoverKey>[]> {
  return groupBy(entries, (entry) => entry.stackGroup ?? 'default');
}

