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
 * Connects directly to the store's RingBuffer undo/redo engine and active trail stack.
 *
 * @example
 * ```tsx
 * import { usePopoverTimeline } from 'popover-trail';
 *
 * function TimelineBar() {
 *   const { canUndo, undo, canRedo, redo } = usePopoverTimeline();
 *   return (
 *     <div>
 *       <button disabled={!canUndo} onClick={undo}>Undo</button>
 *       <button disabled={!canRedo} onClick={redo}>Redo</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @template TData - The type of resolved data payload.
 * @returns Timeline step items, active step index, undo/redo triggers, and jumpToStep callback.
 */
export function usePopoverTimeline<TData = unknown>(): UsePopoverTimelineResult<TData> {
  const actions = usePopoverActions<TData>();
  const canUndo = usePopoverStore(
    (state) => Boolean(state.stateRevision !== undefined) && state.actions.canUndo(),
  );
  const canRedo = usePopoverStore(
    (state) => Boolean(state.stateRevision !== undefined) && state.actions.canRedo(),
  );
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();

  const history = useMemo<PopoverTimelineItem<TData>[]>(() => {
    const activeTrailKeys = trail.map((e) => e.key);
    const activePinnedKeys = floating.map((e) => e.key);
    const primaryKey = activeTrailKeys.at(-1) ?? activePinnedKeys[0] ?? 'root';

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
        const lastKey = targetStep.trailKeys.at(-1);
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
