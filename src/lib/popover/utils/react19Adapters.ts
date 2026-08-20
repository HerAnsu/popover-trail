/**
 * Cross-Version Action & Optimistic Runtime Adapters.
 * Unconditionally uses React hooks to maintain strict adherence to React Rules of Hooks.
 *
 * @module utils/react19Adapters
 */

import { useTransition, useState, useCallback, useRef } from 'react';
import type { PopoverServerAction, PopoverActionState } from '../types/react19Types';

import { wrapAsyncResult, isOk } from './result';

/**
 * Universal Action State Hook compatible with React 18 and React 19 Concurrent Mode.
 *
 * @template TData - Returned data payload type.
 * @template TInput - Input argument type passed to action execution.
 * @param action - Async server action or state updater function.
 * @param initialState - Initial action state container.
 * @returns Tuple of [activeState, executeDispatcher, isPending].
 */
export function useCrossVersionActionState<TData, TInput = void>(
  action: PopoverServerAction<TData, TInput>,
  initialState: PopoverActionState<TData>,
): readonly [PopoverActionState<TData>, (input: TInput) => void, boolean] {
  const [state, setState] = useState<PopoverActionState<TData>>(initialState);
  const [isPending, startTransition] = useTransition();
  const actionRef = useRef(action);
  actionRef.current = action;

  const dispatch = useCallback(
    (input: TInput) => {
      startTransition(async () => {
        setState((prev) => ({
          status: 'pending',
          data: prev.data,
          error: undefined,
          isOptimistic: false,
        }));

        const actionResult = await wrapAsyncResult(
          Promise.resolve(actionRef.current(state, input)),
        );
        if (isOk(actionResult)) {
          setState(actionResult.data);
        } else {
          const error = actionResult.error;
          setState({
            status: 'error',
            data: state.data,
            error,
            isOptimistic: false,
          });
        }
      });
    },
    [state],
  );

  return [state, dispatch, isPending] as const;
}

/**
 * Universal Optimistic Hook applying pure reducer updates.
 *
 * @template TData - Optimistic state data type.
 * @template TUpdate - Update payload type.
 * @param currentData - Current confirmed data state.
 * @param updateFn - Pure reducer function calculating optimistic state.
 * @returns Tuple of [optimisticData, setOptimisticDispatcher].
 */
export function useCrossVersionOptimistic<TData, TUpdate>(
  currentData: TData,
  updateFn: (currentState: TData, update: TUpdate) => TData,
): readonly [TData, (update: TUpdate) => void] {
  const [optimisticState, setOptimisticState] = useState<TData>(currentData);

  const setOptimistic = useCallback(
    (update: TUpdate) => {
      setOptimisticState((prev) => updateFn(prev, update));
    },
    [updateFn],
  );

  return [optimisticState, setOptimistic] as const;
}
