/**
 * Initial State Factory for Popover FSM.
 *
 * @module store/fsm/fsmInitializer
 */

import type { PopoverFSMContext, PopoverFSMState, PopoverStateValue } from './fsmTypes';

export interface PopoverFSMOptions<TData = unknown, TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  readonly initialState?: PopoverStateValue;
  readonly initialData?: TData;
  readonly initialError?: Error;
  readonly initialContext?: Partial<PopoverFSMContext<TData, TPopoverKey>>;
}

export function buildInitialFSMState<TData = unknown, TPopoverKey extends string = string>(
  keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
  if (typeof keyOrOptions === 'string') {
    return { value: 'Idle', context: { key: keyOrOptions } };
  }

  const {
    key,
    initialState = 'Idle',
    initialContext,
    initialData: data,
    initialError: error,
  } = keyOrOptions;

  const context: PopoverFSMContext<TData, TPopoverKey> = {
    key,
    data,
    error,
    ...initialContext,
  };

  if (initialState === 'Error') {
    return {
      value: 'Error',
      context: { ...context, error: error ?? new Error('Unknown FSM Error') },
    };
  }

  return { value: initialState, context };
}
