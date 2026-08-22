/**
 * React 19 Server Action and Mutation Lifecycle Integration Hook for Popover Cards.
 * Coordinates optimistic state updates, background transitions, and auto-rollback on failure.
 *
 * @module hooks/usePopoverAction
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  PopoverActionState,
  PopoverServerAction,
  UsePopoverActionOptions,
  UsePopoverActionResult,
} from '../types/react19Types';
import { useCrossVersionActionState } from '../utils/react19Adapters';
import { usePopoverStoreApi } from '../context/usePopoverStore';
import { wrapAsyncResult, isOk } from '../utils/result';

/**
 * Executes a React 19 Server Action or async mutation with automatic popover store synchronization.
 *
 * @remarks
 * 1. Optimistic updates are applied immediately to avoid UI stutter.
 * 2. On server action resolution, the card data in the store is updated.
 * 3. On server action rejection, the state is rolled back and an error event is dispatched.
 *
 * @template TData - Popover card payload type.
 * @template TInput - Input argument type passed into the server action.
 *
 * @param cardKey - Unique identifier of the popover card receiving the action results.
 * @param action - Async function taking previous state and input parameters.
 * @param options - Configuration options for initial data, optimistic values, and callbacks.
 * @returns Tuple of current action state, dispatch function, and isPending boolean.
 */
export function usePopoverAction<TData, TInput = void>(
  cardKey: string,
  action: PopoverServerAction<TData, TInput>,
  options: Omit<UsePopoverActionOptions<TData, TInput>, 'action'> = {},
): UsePopoverActionResult<TData, TInput> {
  const { initialData, optimisticData, onSuccess, onError } = options;
  const store = usePopoverStoreApi<TData>();

  const updateCardData = useCallback(
    (nextData: TData) => {
      store.setState((state) => {
        const inFloating = state.floating.some((e) => e.key === cardKey);
        const inTrail = state.trail.some((e) => e.key === cardKey);
        if (!inFloating && !inTrail) return state;

        return {
          floating: inFloating
            ? state.floating.map((e) =>
                e.key === cardKey ? { ...e, data: nextData, isLoading: false } : e,
              )
            : state.floating,
          trail: inTrail
            ? state.trail.map((e) =>
                e.key === cardKey ? { ...e, data: nextData, isLoading: false } : e,
              )
            : state.trail,
        };
      });
    },
    [store, cardKey],
  );

  const initialState = useMemo<PopoverActionState<TData>>(() => {
    if (initialData !== undefined) {
      return {
        status: 'idle',
        data: initialData,
        error: undefined,
        isOptimistic: false,
      };
    }
    return {
      status: 'idle',
      data: undefined,
      error: undefined,
      isOptimistic: false,
    };
  }, [initialData]);

  const [optimisticActive, setOptimisticActive] = useState(false);
  const callbacksRef = useRef({ onSuccess, onError });
  callbacksRef.current = { onSuccess, onError };

  const wrappedAction: PopoverServerAction<TData, TInput> = useCallback(
    async (prevState, input) => {
      const execResult = await wrapAsyncResult(Promise.resolve(action(prevState, input)));
      setOptimisticActive(false);

      if (isOk(execResult)) {
        const result = execResult.data;
        if (result.status === 'success' && result.data !== undefined) {
          updateCardData(result.data);
          callbacksRef.current.onSuccess?.(result.data);
        } else if (result.status === 'error') {
          if (prevState.data !== undefined) {
            updateCardData(prevState.data);
          }
          callbacksRef.current.onError?.(result.error);
        }
        return result;
      }

      if (prevState.data !== undefined) {
        updateCardData(prevState.data);
      }

      const error =
        execResult.error instanceof Error ? execResult.error : new Error(String(execResult.error));
      callbacksRef.current.onError?.(error);
      return {
        status: 'error',
        data: prevState.data,
        error,
        isOptimistic: false,
      };
    },
    [action, updateCardData],
  );

  const actionTuple = useCrossVersionActionState<TData, TInput>(wrappedAction, initialState);
  const actionState = actionTuple[0];
  const dispatchAction = actionTuple[1];
  const isPending = actionTuple[2];

  const execute = useCallback(
    (input: TInput) => {
      if (optimisticData && cardKey) {
        const optimisticValue = optimisticData(actionState.data, input);
        if (optimisticValue !== undefined) {
          setOptimisticActive(true);
          updateCardData(optimisticValue);
        }
      }
      dispatchAction(input);
    },
    [actionState.data, cardKey, dispatchAction, optimisticData, updateCardData],
  );

  const [localResetState, setLocalResetState] = useState<PopoverActionState<TData> | null>(null);

  const reset = useCallback(() => {
    setLocalResetState(initialState);
    setOptimisticActive(false);
  }, [initialState]);

  const activeState = localResetState ?? actionState;

  return {
    state: activeState,
    isPending,
    isOptimistic: optimisticActive,
    execute,
    reset,
  };
}
