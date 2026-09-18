/**
 * Cross-Version Action & Optimistic Runtime Adapters.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/adapters/react19Adapters
 */

import { useTransition, useState, useCallback } from 'react';
import type { PopoverServerAction, PopoverActionState } from '../../types/react19Types';
import { wrapAsyncResult, isOk } from '../../utils/result';
import { useLatestRef } from '../useHookUtils';

/**
 * Cross-version adapter for React 19's `useActionState` supporting concurrent transitions and error handling.
 *
 * @example
 * ```tsx
 * const [state, dispatch, isPending] = useCrossVersionActionState(
 *   async (prev, newName: string) => ({ status: 'success', data: { name: newName } }),
 *   { status: 'idle', data: null, error: null },
 * );
 * ```
 *
 * @template TData - Action result payload data type.
 * @template TInput - Input argument type passed to dispatch.
 * @param action - Asynchronous server action function.
 * @param initialState - Initial state value before action is invoked.
 * @returns Tuple of [state, dispatch, isPending].
 */
export function useCrossVersionActionState<TData, TInput = void>(
  action: PopoverServerAction<TData, TInput>,
  initialState: PopoverActionState<TData>,
): readonly [PopoverActionState<TData>, (input: TInput) => void, boolean] {
  const [state, setState] = useState<PopoverActionState<TData>>(initialState);
  const [isPending, startTransition] = useTransition();
  const actionRef = useLatestRef(action);

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
          setState({
            status: 'error',
            data: state.data,
            error: actionResult.error,
            isOptimistic: false,
          });
        }
      });
    },
    [state, actionRef],
  );

  return [state, dispatch, isPending] as const;
}

/**
 * Cross-version fallback for React 19's `useOptimistic` hook.
 * Allows applying immediate optimistic patches to confirmed data.
 *
 * @example
 * ```tsx
 * const [optimisticTitle, setOptimisticTitle] = useCrossVersionOptimistic(
 *   confirmedTitle,
 *   (current, newTitle: string) => newTitle,
 * );
 * ```
 *
 * @template TData - Confirmed data type.
 * @template TUpdate - Optimistic update patch type.
 * @param currentData - Current confirmed data.
 * @param updateFn - Pure reducer computing optimistic state from current data and patch.
 * @returns Tuple of [optimisticData, applyOptimisticUpdate].
 */
export function useCrossVersionOptimistic<TData, TUpdate>(
  currentData: TData,
  updateFn: (currentState: TData, update: TUpdate) => TData,
): readonly [TData, (update: TUpdate) => void] {
  const [prevData, setPrevData] = useState<TData>(currentData);
  const [optimisticState, setOptimisticState] = useState<TData>(currentData);

  if (prevData !== currentData) {
    setPrevData(currentData);
    setOptimisticState(currentData);
  }

  const setOptimistic = useCallback(
    (update: TUpdate) => {
      setOptimisticState((prev) => updateFn(prev, update));
    },
    [updateFn],
  );

  return [optimisticState, setOptimistic] as const;
}
