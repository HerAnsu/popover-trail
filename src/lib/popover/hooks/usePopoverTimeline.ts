import { useCallback, useDebugValue, useMemo } from 'react';
import {
  usePopoverActions,
  usePopoverFloating,
  usePopoverStore,
  usePopoverTrail,
} from '../context';

/**
 * Item element in the popover timeline history.
 */
export interface PopoverTimelineItem<TData = unknown> {
  stepIndex: number;
  trailKeys: string[];
  pinnedKeys: string[];
  primaryKey: string;
  timestamp?: number;
  payload?: TData;
}

/**
 * Result object returned by the `usePopoverTimeline` hook.
 */
export interface UsePopoverTimelineResult<TData = unknown> {
  history: PopoverTimelineItem<TData>[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  jumpToStep: (index: number) => void;
}

/**
 * Hook to access and control the visual breadcrumb timeline and undo/redo history navigation.
 *
 * @template TData - The type of resolved data payload.
 * @returns Timeline step items, active step index, undo/redo triggers, and jumpToStep callback.
 */
export function usePopoverTimeline<TData = unknown>(): UsePopoverTimelineResult<TData> {
  const actions = usePopoverActions<TData>();
  const canUndo = usePopoverStore((state) => state.actions.canUndo());
  const canRedo = usePopoverStore((state) => state.actions.canRedo());
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();

  const history = useMemo<PopoverTimelineItem<TData>[]>(() => {
    const activeTrailKeys = trail.map((e) => e.key);
    const activePinnedKeys = floating.map((e) => e.key);
    const primaryKey = activeTrailKeys[activeTrailKeys.length - 1] ?? activePinnedKeys[0] ?? 'root';

    return [
      {
        stepIndex: 0,
        trailKeys: activeTrailKeys,
        pinnedKeys: activePinnedKeys,
        primaryKey,
      },
    ];
  }, [trail, floating]);

  const jumpToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= history.length) return;
      const targetStep = history[stepIndex];
      if (targetStep && targetStep.trailKeys.length > 0) {
        const lastKey = targetStep.trailKeys[targetStep.trailKeys.length - 1];
        if (lastKey) {
          actions.bringToFront(lastKey);
        }
      }
    },
    [history, actions],
  );

  useDebugValue(`Timeline Step 1/${history.length} [CanUndo: ${canUndo}, CanRedo: ${canRedo}]`);

  return {
    history,
    currentIndex: 0,
    canUndo,
    canRedo,
    undo: actions.undo,
    redo: actions.redo,
    jumpToStep,
  };
}
