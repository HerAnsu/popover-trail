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

/** Validates whether an unknown value conforms to a PopoverFSMState structure. */
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

/** Checks if the machine is currently in the Idle initial state. */
export function isIdleFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is IdleFSMState<TData, K> {
  return state.value === 'Idle';
}

/** Checks if the machine is actively hydrating or fetching data. */
export function isHydratingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is HydratingFSMState<TData, K> {
  return state.value === 'Hydrating';
}

/** Checks if the machine is resolved (either trailing in cascade or pinned). */
export function isResolvedFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedTrailingFSMState<TData, K> | ResolvedPinnedFSMState<TData, K> {
  return state.value === 'Resolved.Trailing' || state.value === 'Resolved.Pinned';
}

/** Checks if the machine is in the active trailing cascade state. */
export function isTrailingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedTrailingFSMState<TData, K> {
  return state.value === 'Resolved.Trailing';
}

/** Checks if the machine is currently pinned in floating mode. */
export function isPinnedFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedPinnedFSMState<TData, K> {
  return state.value === 'Resolved.Pinned';
}

/** Checks if the machine entered the Error failure state. */
export function isErrorFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ErrorFSMState<TData, K> {
  return state.value === 'Error';
}

/** Checks if the machine is unmounting during exit transitions. */
export function isUnmountingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is UnmountingFSMState<TData, K> {
  return state.value === 'Unmounting';
}
