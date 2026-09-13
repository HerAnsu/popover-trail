import { useCallback, useDebugValue, useMemo } from 'react';
import { usePopoverActions, usePopoverStore } from '../context/usePopoverStore';
import { usePopoverFloating, usePopoverTrail } from './usePopoverSelectors';
import { take } from '../utils/arrayUtils';
import { prop } from '../utils/functional';
import { EMPTY_ARRAY } from '../constants';

/**
 * Item element in the popover timeline history.
 *
 * @template TData - Resolved data payload type.
 */
export interface PopoverTimelineItem<TData = unknown> {
  /** Sequential step index integer. */
  readonly stepIndex: number;
  /** Active popover keys in the cascading trail at this point in history. */
  readonly trailKeys: readonly string[];
  /** Active pinned popover keys at this point in history. */
  readonly pinnedKeys: readonly string[];
  /** Topmost or focus key at this point in history. */
  readonly primaryKey: string;
  /** Optional timestamp when step occurred. */
  readonly timestamp?: number;
  /** Optional data payload associated with the step. */
  readonly payload?: TData;
}

/**
 * Result object returned by the `usePopoverTimeline` hook.
 *
 * @template TData - Resolved data payload type.
 */
export interface UsePopoverTimelineResult<TData = unknown> {
  /** Chronological history entries list. */
  readonly history: readonly PopoverTimelineItem<TData>[];
  /** Current active history step index. */
  readonly currentIndex: number;
  /** True if undo action is available in history stack. */
  readonly canUndo: boolean;
  /** True if redo action is available in history stack. */
  readonly canRedo: boolean;
  /** Jump directly to a specific historical step by index. */
  readonly jumpToStep: (stepIndex: number) => void;
  /** Step backwards in history. */
  readonly undo: () => void;
  /** Step forwards in history. */
  readonly redo: () => void;
}

/**
 * Hook to access and control the visual breadcrumb timeline and undo/redo history navigation.
 *
 * @remarks
 * Dynamically constructs timeline step items from active cascade trail cards and floating windows,
 * and binds directly to the store's undo/redo history manager.
 *
 * @template TData - The type of resolved data payload.
 * @returns Timeline step items, active step index, undo/redo triggers, and jumpToStep callback.
 */
export function usePopoverTimeline<TData = unknown>(): UsePopoverTimelineResult<TData> {
  const actions = usePopoverActions<TData>();

  // Reactively track undo/redo availability from store state
  const canUndo = usePopoverStore((state) => state.canUndo?.() ?? false);
  const canRedo = usePopoverStore((state) => state.canRedo?.() ?? false);

  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();

  // Construct real chronological step items from the active trail and pinned cards
  const history = useMemo<readonly PopoverTimelineItem<TData>[]>(() => {
    if (trail.length === 0 && floating.length === 0) {
      return EMPTY_ARRAY;
    }

    const pinnedKeys = floating.map(prop('key'));

    // If there is an active cascading trail, each depth level is an interactive step
    if (trail.length > 0) {
      return trail.map((entry, idx) => ({
        stepIndex: idx,
        trailKeys: take(trail, idx + 1).map(prop('key')),
        pinnedKeys,
        primaryKey: entry.key,
        payload: entry.data ?? undefined,
      }));
    }

    // If only floating/pinned windows exist
    return floating.map((entry, idx) => ({
      stepIndex: idx,
      trailKeys: EMPTY_ARRAY,
      pinnedKeys,
      primaryKey: entry.key,
      payload: entry.data ?? undefined,
    }));
  }, [trail, floating]);

  const currentIndex = useMemo(() => {
    if (history.length === 0) return 0;
    return history.length - 1;
  }, [history.length]);

  const jumpToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= history.length) return;
      const targetStep = history[stepIndex];
      if (!targetStep) return;

      if (trail.length > 0 && stepIndex < trail.length - 1) {
        actions.closeFrom(stepIndex + 1);
      }

      // Bring target popover to front and focus
      if (targetStep.primaryKey) {
        actions.bringToFront(targetStep.primaryKey);
      }
    },
    [history, trail.length, actions],
  );

  useDebugValue(
    `Timeline [Steps: ${history.length}, Current: ${currentIndex}, CanUndo: ${canUndo}, CanRedo: ${canRedo}]`,
  );

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    undo: actions.undo,
    redo: actions.redo,
    jumpToStep,
  };
}
