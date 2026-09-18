/**
 * Initial State Factory for Popover FSM.
 *
 * @module store/fsm/fsmInitializer
 */

import type { PopoverFSMContext, PopoverFSMState, PopoverStateValue } from './fsmTypes';

/**
 * Options for configuring the initial state of a popover finite state machine.
 *
 * @template TData - Type of data payload associated with the popover.
 * @template TPopoverKey - String identifier type for the popover key.
 */
export interface PopoverFSMOptions<TData = unknown, TPopoverKey extends string = string> {
  /** Unique key identifying the popover card. */
  readonly key: TPopoverKey;
  /** Initial lifecycle state (defaults to `'Idle'`). */
  readonly initialState?: PopoverStateValue;
  /** Initial resolved data payload if pre-hydrated. */
  readonly initialData?: TData;
  /** Initial error instance if starting in an error state. */
  readonly initialError?: Error;
  /** Additional custom context fields to merge. */
  readonly initialContext?: Partial<PopoverFSMContext<TData, TPopoverKey>>;
}

/**
 * Creates the initial state snapshot and context for a popover card FSM.
 *
 * Can be initialized with just a popover key string (defaults to `Idle` state),
 * or with a full `PopoverFSMOptions` configuration object.
 *
 * @template TData - Type of data payload associated with the popover.
 * @template TPopoverKey - String identifier type for the popover key.
 * @param keyOrOptions - Key string or configuration options object.
 * @returns Initialized immutable FSM state and context.
 *
 * @example
 * ```typescript
 * // Minimal initialization:
 * const state = createInitialFSMState('card-1');
 * console.log(state.value); // 'Idle'
 *
 * // Pre-resolved initialization:
 * const resolvedState = createInitialFSMState({
 *   key: 'card-1',
 *   initialState: 'Resolved.Trailing',
 *   initialData: { title: 'Settings' },
 * });
 * ```
 */
export function createInitialFSMState<TData = unknown, TPopoverKey extends string = string>(
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
