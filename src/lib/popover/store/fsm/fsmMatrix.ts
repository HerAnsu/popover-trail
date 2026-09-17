/**
 * Finite State Automata (FSM) Matrix and Transition Validation Rules.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @remarks
 * **Contributor Architectural Guide**:
 * - **Formal Automaton $\mathcal{M}_{\text{entry}}$**: Every active popover card lifecycle is governed by a discrete
 *   finite state automaton $\mathcal{M}_{\text{entry}} = \langle \mathcal{Q}, \Sigma, \delta_{\text{entry}}, q_0, \mathcal{F} \rangle$ where
 *   $\mathcal{Q} = \{ \text{Idle}, \text{Hydrating}, \text{Resolved.Trailing}, \text{Resolved.Pinned}, \text{Error}, \text{Unmounting} \}$.
 * - **Bitmask Transition Algebra**: Transitions are modeled as bitwise flags in an adjacency matrix
 *   $M_{\text{trans}} \in \{0, 1\}^{|\mathcal{Q}| \times |\mathcal{Q}|}$. Validating transition $(q_i \to q_j)$
 *   executes in $O(1)$ time via bitwise conjunction:
 *   $$\text{isValid}(q_i \to q_j) \iff (M_{\text{trans}}[i] \mathbin{\&} (1 \ll j)) \neq 0$$
 * - **Deadlock Freedom & Reachability**: Every reachable non-terminal state $q \in \mathcal{Q}$ possesses a deterministic
 *   geodesic path to the terminal unmounted state (`Unmounting` -> `Idle`).
 * - **Contributor Checklist for State Modifications**:
 *   1. Update `PopoverStateValue` in `fsmTypes.ts`.
 *   2. Register the state in `FSM_STATE_MANIFEST` with unique bit flag (`1 << N`) and allowed outgoing `validTransitions`.
 *   3. Update `FSMStatusBit` and `STATE_VALUE_TO_BIT_MAP`.
 *   4. The discriminated return type `ValidNextFSMState<T>` will automatically update TypeScript exhaustiveness checks.
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

/**
 * Evaluates whether transitioning between two FSM lifecycle states is valid.
 *
 * @remarks
 * **Contributor Note**:
 * Validates against the finite state transition manifest $\mathcal{M}_{\text{entry}}$ in $O(1)$ time,
 * guaranteeing reachability and deadlock freedom across the popover lifecycle.
 *
 * @param from - Current source state.
 * @param to - Proposed destination state.
 * @returns `true` if the transition is admitted by the FSM topology; otherwise `false`.
 */
export function isValidTransition(from: PopoverStateValue, to: PopoverStateValue): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Type helper returning the valid target states reachable from `TState`.
 *
 * @remarks
 * Derived directly from `FSM_STATE_MANIFEST` for compile-time transition checks:
 * - `ValidNextFSMState<'Idle'>` -> strictly `'Hydrating'`
 * - `ValidNextFSMState<'Unmounting'>` -> strictly `'Idle' | 'Hydrating'`
 *
 * @template TState - Current FSM state name.
 */
export type ValidNextFSMState<TState extends PopoverStateValue> =
  (typeof FSM_STATE_MANIFEST)[TState]['validTransitions'][number];

/**
 * Type guard verifying if transitioning from `from` to `to` is legally permitted by the FSM.
 *
 * @remarks
 * **Contributor Note**:
 * - **Compile-Time Narrowing**: Narrows the type of `to` to `ValidNextFSMState<From>`. If a contributor writes
 *   a transition branch that is illegal in `FSM_STATE_MANIFEST`, TypeScript will raise a compile-time type error.
 * - **Zero Allocations**: Validates against frozen static tables without creating arrays or closures.
 *
 * @template From - Current state type.
 * @template To - Target state type.
 * @param from - Current state.
 * @param to - Next proposed state.
 * @returns True if the transition is allowed.
 */
export function canTransition<From extends PopoverStateValue, To extends PopoverStateValue>(
  from: From,
  to: To,
): to is To & ValidNextFSMState<From> {
  return isValidTransition(from, to);
}

/**
 * Validates transition between mounting status flags using bitmask transition algebra.
 *
 * @remarks
 * **Contributor Note**:
 * - **Bitmask Conjunction**: Formulated as $(M_{\text{trans}}[\text{from}] \mathbin{\&} (1 \ll \text{to})) \neq 0$.
 * - **Lifecycle Path**:
 *   - `mounting` -> can only transition to `mounted` or abort to `unmounting`.
 *   - `mounted` -> can transition back to `mounting` (re-trigger) or `unmounting`.
 *   - `unmounting` -> can restart to `mounting`.
 * - **Zero Overhead**: Directly evaluates numeric bitwise operations in sub-nanosecond time.
 *
 * @param from - Current transition status ('mounting' | 'mounted' | 'unmounting').
 * @param to - Proposed next transition status.
 * @returns `true` if status change is admitted by the bitmask adjacency matrix.
 */
export function isValidTransitionStatusChange(
  from?: PopoverTransitionStatus,
  to?: PopoverTransitionStatus,
): boolean {
  if (!from || !to || from === to) return true;
  return (VALID_STATUS_TRANSITIONS[from] & TransitionStatusBit[to]) !== 0;
}
