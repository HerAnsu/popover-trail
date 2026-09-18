/**
 * FSM Machine State Discriminator Type Guards.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/fsm/fsmGuards
 */

import type {
  PopoverFSMState,
  IdleFSMState,
  HydratingFSMState,
  ResolvedTrailingFSMState,
  ResolvedPinnedFSMState,
  ErrorFSMState,
  UnmountingFSMState,
} from './fsmTypes';
import { ALL_FSM_STATE_VALUES } from './fsmMatrix';

const FSM_VALUES: ReadonlySet<string> = new Set(ALL_FSM_STATE_VALUES);

/**
 * Validates whether an unknown value conforms to a valid `PopoverFSMState` structure.
 *
 * @template TData - Type of data payload associated with the popover.
 * @template TPopoverKey - String identifier type for the popover key.
 * @param val - Value to check.
 * @returns `true` if `val` is a valid `PopoverFSMState` object; otherwise `false`.
 *
 * @example
 * ```typescript
 * if (isFSMState(obj)) {
 *   console.log(obj.value, obj.context.key);
 * }
 * ```
 */
export function isFSMState<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is PopoverFSMState<TData, TPopoverKey> {
  if (typeof val !== 'object' || val === null) return false;
  return (
    'value' in val &&
    typeof val.value === 'string' &&
    FSM_VALUES.has(val.value) &&
    'context' in val &&
    typeof val.context === 'object' &&
    val.context !== null
  );
}

/**
 * Checks whether the machine is currently in the `Idle` initial state.
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Idle`.
 *
 * @example
 * ```typescript
 * if (isIdleFSM(fsmState)) {
 *   console.log('Popover is idle and unmounted');
 * }
 * ```
 */
export function isIdleFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is IdleFSMState<TData, K> {
  return state.value === 'Idle';
}

/**
 * Checks whether the machine is actively hydrating or fetching data.
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Hydrating`.
 *
 * @example
 * ```typescript
 * if (isHydratingFSM(fsmState)) {
 *   // Render loading spinner
 * }
 * ```
 */
export function isHydratingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is HydratingFSMState<TData, K> {
  return state.value === 'Hydrating';
}

/**
 * Checks whether the machine is resolved (either trailing in cascade or pinned).
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Resolved.Trailing` or `Resolved.Pinned`.
 *
 * @example
 * ```typescript
 * if (isResolvedFSM(fsmState)) {
 *   // Safe to render card content
 * }
 * ```
 */
export function isResolvedFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedTrailingFSMState<TData, K> | ResolvedPinnedFSMState<TData, K> {
  return state.value === 'Resolved.Trailing' || state.value === 'Resolved.Pinned';
}

/**
 * Checks whether the machine is in the active trailing cascade state.
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Resolved.Trailing`.
 *
 * @example
 * ```typescript
 * if (isTrailingFSM(fsmState)) {
 *   // Popover follows cascade positioning
 * }
 * ```
 */
export function isTrailingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedTrailingFSMState<TData, K> {
  return state.value === 'Resolved.Trailing';
}

/**
 * Checks whether the machine is currently pinned in floating mode.
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Resolved.Pinned`.
 *
 * @example
 * ```typescript
 * if (isPinnedFSM(fsmState)) {
 *   console.log('Pinned coords:', fsmState.context.pinnedPos);
 * }
 * ```
 */
export function isPinnedFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedPinnedFSMState<TData, K> {
  return state.value === 'Resolved.Pinned';
}

/**
 * Checks whether the machine entered the `Error` failure state.
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Error`.
 *
 * @example
 * ```typescript
 * if (isErrorFSM(fsmState)) {
 *   console.error('Failure:', fsmState.context.error);
 * }
 * ```
 */
export function isErrorFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ErrorFSMState<TData, K> {
  return state.value === 'Error';
}

/**
 * Checks whether the machine is unmounting during exit transitions.
 *
 * @template TData - Type of data payload in state.
 * @template K - String identifier type for the popover key.
 * @param state - FSM state object to test.
 * @returns `true` if state is `Unmounting`.
 *
 * @example
 * ```typescript
 * if (isUnmountingFSM(fsmState)) {
 *   // Play exit animation
 * }
 * ```
 */
export function isUnmountingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is UnmountingFSMState<TData, K> {
  return state.value === 'Unmounting';
}
