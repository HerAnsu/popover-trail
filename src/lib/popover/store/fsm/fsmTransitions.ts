/**
 * Discrete State Transition Reducer for Popover FSM.
 *
 * @module store/fsm/fsmTransitions
 */

import type { PopoverFSMEvent, PopoverFSMState, PopoverStateValue } from './fsmTypes';
import { isValidTransition } from './fsmMatrix';

export { buildInitialFSMState, type PopoverFSMOptions } from './fsmInitializer';

export function transitionFSMState<TData = unknown, TPopoverKey extends string = string>(
  state: PopoverFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
  const { value, context } = state;

  switch (event.type) {
    case 'OPEN_ROOT':
    case 'PUSH_NESTED':
      return isValidTransition(value, 'Hydrating')
        ? { value: 'Hydrating', context: { key: event.key } }
        : state;

    case 'RESOLVE_SUCCESS': {
      const next = value === 'Resolved.Pinned' ? 'Resolved.Pinned' : 'Resolved.Trailing';
      return isValidTransition(value, next)
        ? { value: next, context: { ...context, data: event.data, error: undefined } }
        : state;
    }

    case 'RESOLVE_FAILURE':
      return isValidTransition(value, 'Error')
        ? { value: 'Error', context: { ...context, error: event.error } }
        : state;

    case 'TOGGLE_PIN': {
      if (value !== 'Resolved.Trailing' && value !== 'Resolved.Pinned') return state;
      const isPinned = value === 'Resolved.Pinned';
      return {
        value: isPinned ? 'Resolved.Trailing' : 'Resolved.Pinned',
        context: { ...context, pinnedPos: isPinned ? undefined : event.rect },
      };
    }

    case 'CLOSE':
      return isValidTransition(value, 'Unmounting') ? { value: 'Unmounting', context } : state;

    case 'TRANSITION_END':
      return isValidTransition(value, 'Idle')
        ? { value: 'Idle', context: { key: context.key } }
        : state;

    case 'RETRY':
      return value === 'Error' && isValidTransition(value, 'Hydrating')
        ? { value: 'Hydrating', context: { ...context, error: undefined } }
        : state;

    default:
      return state;
  }
}

export const popoverFSMReducer = transitionFSMState;

export function assertPopoverFSMState<
  V extends PopoverStateValue,
  TData = unknown,
  TPopoverKey extends string = string,
>(
  state: PopoverFSMState<TData, TPopoverKey>,
  expectedValue: V,
): asserts state is Extract<PopoverFSMState<TData, TPopoverKey>, { readonly value: V }> {
  if (state.value !== expectedValue) {
    throw new Error(
      `[assertPopoverFSMState] Expected FSM state "${expectedValue}", received "${state.value}"`,
    );
  }
}
