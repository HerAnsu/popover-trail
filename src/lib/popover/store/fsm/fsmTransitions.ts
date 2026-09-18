/**
 * Discrete State Transition Reducer for Popover FSM.
 *
 * @module store/fsm/fsmTransitions
 */

import type { PopoverFSMEvent, PopoverFSMState, PopoverStateValue } from './fsmTypes';
import { isValidTransition } from './fsmMatrix';

export { createInitialFSMState, type PopoverFSMOptions } from './fsmInitializer';

/**
 * Pure state transition reducer for a popover card finite state machine.
 *
 * Evaluates incoming events (`OPEN_ROOT`, `PUSH_NESTED`, `RESOLVE_SUCCESS`, `RESOLVE_FAILURE`,
 * `TOGGLE_PIN`, `CLOSE`, `TRANSITION_END`, `RETRY`) against `isValidTransition`.
 * If the transition is permitted, returns a new immutable state object with updated context;
 * otherwise returns the existing state reference unchanged.
 *
 * @template TData - Type of data payload associated with the popover.
 * @template TPopoverKey - String identifier type for the popover key.
 * @param state - Current FSM state and context.
 * @param event - Lifecycle event being processed.
 * @returns Next FSM state (or identical state reference if transition was rejected).
 *
 * @example
 * ```typescript
 * const next = transitionFSMState(currentState, {
 *   type: 'RESOLVE_SUCCESS',
 *   data: { title: 'Product Details' },
 * });
 * console.log(next.value); // 'Resolved.Trailing'
 * ```
 */
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

/**
 * TypeScript assertion function verifying that a popover FSM is in a specific lifecycle state.
 *
 * Throws a descriptive error if the state does not match, or narrows `state` to the expected
 * discriminant type upon success.
 *
 * @template V - Expected state value string literal.
 * @template TData - Type of data payload in state.
 * @template TPopoverKey - String identifier type for the popover key.
 * @param state - State object to assert against.
 * @param expectedValue - Expected state discriminant (e.g. `'Resolved.Trailing'`).
 * @throws Error if `state.value !== expectedValue`.
 *
 * @example
 * ```typescript
 * assertPopoverFSMState(fsmState, 'Resolved.Trailing');
 * // fsmState.context.data is now safely accessible without optional chaining
 * ```
 */
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
