/**
 * Cross-Version Action & Optimistic Runtime Adapters.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/adapters/react19Adapters
 */

import { useTransition, useState, useCallback, useRef } from 'react';
import type { PopoverServerAction, PopoverActionState } from '../../types/react19Types';
import { wrapAsyncResult, isOk } from '../../utils/result';

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
          setState({
            status: 'error',
            data: state.data,
            error: actionResult.error,
            isOptimistic: false,
          });
        }
      });
    },
    [state],
  );

  return [state, dispatch, isPending] as const;
}

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
