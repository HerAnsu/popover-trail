/**
 * Finite State Automata (FSM) Matrix and Transition Validation Rules.
 *
 * @module store/fsm/fsmMatrix
 */

import type { PopoverStateValue } from './fsmTypes';
import type { PopoverTransitionStatus } from '../../types';

export interface FSMStateConfig {
  readonly bit: number;
  readonly active?: boolean;
  readonly validTransitions: readonly PopoverStateValue[];
}

export const FSM_STATE_MANIFEST = {
  Idle: {
    bit: 1,
    validTransitions: ['Hydrating'],
  },
  Hydrating: {
    bit: 1 << 1,
    active: true,
    validTransitions: ['Resolved.Trailing', 'Resolved.Pinned', 'Error', 'Unmounting', 'Idle'],
  },
  'Resolved.Trailing': {
    bit: 1 << 2,
    active: true,
    validTransitions: ['Resolved.Pinned', 'Unmounting', 'Hydrating', 'Idle'],
  },
  'Resolved.Pinned': {
    bit: 1 << 3,
    active: true,
    validTransitions: ['Resolved.Trailing', 'Unmounting', 'Hydrating', 'Idle'],
  },
  Error: {
    bit: 1 << 4,
    validTransitions: ['Hydrating', 'Unmounting', 'Idle'],
  },
  Unmounting: {
    bit: 1 << 5,
    validTransitions: ['Idle', 'Hydrating'],
  },
} as const satisfies Record<PopoverStateValue, FSMStateConfig>;

export const FSMStatusBit = {
  Idle: FSM_STATE_MANIFEST.Idle.bit,
  Hydrating: FSM_STATE_MANIFEST.Hydrating.bit,
  ResolvedTrailing: FSM_STATE_MANIFEST['Resolved.Trailing'].bit,
  ResolvedPinned: FSM_STATE_MANIFEST['Resolved.Pinned'].bit,
  Error: FSM_STATE_MANIFEST.Error.bit,
  Unmounting: FSM_STATE_MANIFEST.Unmounting.bit,
  Active:
    FSM_STATE_MANIFEST.Hydrating.bit |
    FSM_STATE_MANIFEST['Resolved.Trailing'].bit |
    FSM_STATE_MANIFEST['Resolved.Pinned'].bit,
} as const;

export const STATE_VALUE_TO_BIT_MAP: Record<PopoverStateValue, number> = {
  Idle: FSM_STATE_MANIFEST.Idle.bit,
  Hydrating: FSM_STATE_MANIFEST.Hydrating.bit,
  'Resolved.Trailing': FSM_STATE_MANIFEST['Resolved.Trailing'].bit | FSMStatusBit.Active,
  'Resolved.Pinned': FSM_STATE_MANIFEST['Resolved.Pinned'].bit | FSMStatusBit.Active,
  Error: FSM_STATE_MANIFEST.Error.bit,
  Unmounting: FSM_STATE_MANIFEST.Unmounting.bit,
};

export const VALID_TRANSITIONS: Record<PopoverStateValue, readonly PopoverStateValue[]> = {
  Idle: FSM_STATE_MANIFEST.Idle.validTransitions,
  Hydrating: FSM_STATE_MANIFEST.Hydrating.validTransitions,
  'Resolved.Trailing': FSM_STATE_MANIFEST['Resolved.Trailing'].validTransitions,
  'Resolved.Pinned': FSM_STATE_MANIFEST['Resolved.Pinned'].validTransitions,
  Error: FSM_STATE_MANIFEST.Error.validTransitions,
  Unmounting: FSM_STATE_MANIFEST.Unmounting.validTransitions,
};

export const ALL_FSM_STATE_VALUES: readonly PopoverStateValue[] = Object.keys(
  FSM_STATE_MANIFEST,
) as readonly PopoverStateValue[];

const TransitionStatusBit: Record<PopoverTransitionStatus, number> = {
  mounting: 1,
  mounted: 1 << 1,
  unmounting: 1 << 2,
};

const VALID_STATUS_TRANSITIONS: Record<PopoverTransitionStatus, number> = {
  mounting: TransitionStatusBit.mounted | TransitionStatusBit.unmounting,
  mounted: TransitionStatusBit.mounting | TransitionStatusBit.unmounting,
  unmounting: TransitionStatusBit.mounting,
};

export function isValidTransition(from: PopoverStateValue, to: PopoverStateValue): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidTransitionStatusChange(
  from?: PopoverTransitionStatus,
  to?: PopoverTransitionStatus,
): boolean {
  if (!from || !to || from === to) return true;
  return (VALID_STATUS_TRANSITIONS[from] & TransitionStatusBit[to]) !== 0;
}
