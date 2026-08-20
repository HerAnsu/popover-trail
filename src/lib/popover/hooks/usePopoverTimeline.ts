import { useCallback, useDebugValue, useMemo } from 'react';
import { usePopoverActions, usePopoverStore } from '../context/usePopoverStore';
import { usePopoverFloating, usePopoverTrail } from './usePopoverSelectors';

/**
 * Item element in the popover timeline history.
 *
 * @template TData - Resolved data payload type.
 */
export interface PopoverTimelineItem<TData = unknown> {
  /** Sequential step index integer. */
  stepIndex: number;
  /** Active popover keys in the cascading trail at this point in history. */
  trailKeys: string[];
  /** Active pinned popover keys at this point in history. */
  pinnedKeys: string[];
  /** Topmost or focus key at this point in history. */
  primaryKey: string;
  /** Optional timestamp when step occurred. */
  timestamp?: number;
  /** Optional data payload associated with the step. */
  payload?: TData;
}

/**
 * Result object returned by the `usePopoverTimeline` hook.
 *
 * @template TData - Resolved data payload type.
 */
export interface UsePopoverTimelineResult<TData = unknown> {
  /** Chronological history entries list. */
  history: PopoverTimelineItem<TData>[];
  /** Current active history step index. */
  currentIndex: number;
  /** True if undo action is available in history stack. */
  canUndo: boolean;
  /** True if redo action is available in history stack. */
  canRedo: boolean;
  /** Executes undo to previous state snapshot. */
  undo: () => void;
  /** Executes redo to next state snapshot. */
  redo: () => void;
  /** Navigates directly to a specific step in history by index. */
  jumpToStep: (index: number) => void;
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
  const history = useMemo<PopoverTimelineItem<TData>[]>(() => {
    if (trail.length === 0 && floating.length === 0) {
      return [];
    }

    const pinnedKeys = floating.map((e) => e.key);

    // If there is an active cascading trail, each depth level is an interactive step
    if (trail.length > 0) {
      return trail.map((entry, idx) => ({
        stepIndex: idx,
        trailKeys: trail.slice(0, idx + 1).map((e) => e.key),
        pinnedKeys,
        primaryKey: entry.key,
        payload: entry.data ?? undefined,
      }));
    }

    // If only floating/pinned windows exist
    return floating.map((entry, idx) => ({
      stepIndex: idx,
      trailKeys: [],
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

      // Bring target popover to front and focus
      if (targetStep.primaryKey) {
        actions.bringToFront(targetStep.primaryKey);
      }
    },
    [history, actions],
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
