/**
 * Card Store Slice & Transition Utilities for popover-trail.
 * Provides atomic store selectors, mounting transition triggers, and button control resolvers.
 *
 * @module hooks/card/useCardStoreSlice
 */

import { useCallback, useEffect } from 'react';
import { usePopoverStore } from '../../context/usePopoverStore';
import { shallowEqual } from '../../utils/equality';
import type { PopoverActions, PopoverStore, TrailEntry } from '../../types';

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

/**
 * Resolved store slice data for a single popover card.
 */
export interface CardStoreSliceData {
  /** Saved drag coordinate offset. */
  readonly offset: { readonly x: number; readonly y: number };
  /** Card z-index position within active zIndexOrder stack. */
  readonly zIndex: number;
  /** Whether card is the topmost active popover. */
  readonly isTop: boolean;
  /** Whether keyboard arrow navigation is enabled. */
  readonly enableArrowNavigation: boolean;
  /** Active cascading trail entries. */
  readonly trail: readonly TrailEntry[];
  /** Active pinned floating entries. */
  readonly floating: readonly TrailEntry[];
  /** Global base starting z-index. */
  readonly baseZIndex: number;
  /** Global mounting CSS transition class name. */
  readonly mountingClassName?: string;
  /** Global unmounting CSS transition class name. */
  readonly unmountingClassName?: string;
  /** Global mounted CSS transition class name. */
  readonly mountedClassName?: string;
  /** Custom z-index mapping by stack group. */
  readonly zIndexBaseMap?: Record<string, number> | null;
}

/**
 * Resolves the effective CSS transition class name for a card based on its transition status.
 *
 * @param status - Current transition status ('mounting' | 'mounted' | 'unmounting').
 * @param entryClasses - Per-entry custom transition classes.
 * @param globalClasses - Global default transition classes.
 * @returns CSS class name string.
 */
export function resolveTransitionClassName(
  status: string | undefined,
  entryClasses: { mounting?: string; unmounting?: string; mounted?: string },
  globalClasses: { mounting?: string; unmounting?: string; mounted?: string },
): string {
  if (!status || (status !== 'mounting' && status !== 'mounted' && status !== 'unmounting')) {
    return '';
  }
  return entryClasses[status] ?? globalClasses[status] ?? '';
}

/**
 * Double-rAF transition hook transitioning a card from 'mounting' to 'mounted' state.
 *
 * @param key - Popover key.
 * @param status - Current transition status.
 * @param actions - Popover store actions dispatcher.
 */
export function useCardMountingTransition(
  key: string,
  status: string | undefined,
  actions: PopoverActions,
): void {
  useEffect(() => {
    if (status === 'mounting') {
      let rAF2: number;
      const rAF1 = requestAnimationFrame(() => {
        rAF2 = requestAnimationFrame(() => {
          actions.setTransitionStatus(key, 'mounted');
        });
      });
      return () => {
        cancelAnimationFrame(rAF1);
        if (rAF2) {
          cancelAnimationFrame(rAF2);
        }
      };
    }
    return undefined;
  }, [key, status, actions]);
}

/**
 * Subscribes to popover store state for a specific card key.
 *
 * @param entryKey - Popover card key identifier.
 * @returns Selected slice of store state.
 */
export function useCardStoreSlice(entryKey: string): CardStoreSliceData {
  return usePopoverStore(
    useCallback(
      (state: PopoverStore): CardStoreSliceData => ({
        offset: state.offsets[entryKey] ?? DEFAULT_OFFSET,
        zIndex: state.zIndexOrder.indexOf(entryKey),
        isTop: state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === entryKey,
        enableArrowNavigation: state.enableArrowNavigation,
        trail: state.trail,
        floating: state.floating,
        baseZIndex: state.baseZIndex,
        mountingClassName: state.mountingClassName,
        unmountingClassName: state.unmountingClassName,
        mountedClassName: state.mountedClassName,
        zIndexBaseMap: state.zIndexBaseMap,
      }),
      [entryKey],
    ),
    shallowEqual,
  );
}

/**
 * Resolves effective base z-index for a card taking stackGroup mapping into account.
 *
 * @param entry - Trail entry.
 * @param zIndexBaseMap - Optional stack group z-index mapping.
 * @param baseZIndex - Global base z-index fallback.
 * @returns Effective numeric base z-index.
 */
export function resolveEffectiveBaseZIndex(
  entry: TrailEntry,
  zIndexBaseMap?: Record<string, number> | null,
  baseZIndex?: number,
): number {
  if (entry.baseZIndex !== undefined) return entry.baseZIndex;
  if (entry.stackGroup && zIndexBaseMap) {
    const mapped = zIndexBaseMap[entry.stackGroup];
    if (mapped !== undefined) return mapped;
  }
  return baseZIndex ?? 1000;
}

/**
 * Resolves card button visibility and customization controls from entry or card feature overrides.
 *
 * @param entry - Target trail entry.
 * @param cardFeatures - Optional feature flags override.
 * @returns Object with resolved button flags and custom button list.
 */
export function resolveCardButtonControls(
  entry: TrailEntry,
  cardFeatures?: { enablePin?: boolean; enableClose?: boolean; enableDrag?: boolean },
) {
  const isPinEnabled = cardFeatures?.enablePin ?? entry.buttonControls?.enablePin ?? true;
  const isCloseEnabled = cardFeatures?.enableClose ?? entry.buttonControls?.enableClose ?? true;
  const isDragEnabled = cardFeatures?.enableDrag ?? entry.buttonControls?.enableDrag ?? true;
  const customBtns = entry.buttonControls?.customButtons ?? [];

  return {
    enablePin: isPinEnabled,
    enableClose: isCloseEnabled,
    enableDrag: isDragEnabled,
    customButtons: customBtns,
  };
}
