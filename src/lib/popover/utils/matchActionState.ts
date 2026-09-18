/**
 * Exhaustive Pattern Matcher for React 19 Server Action States.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/matchActionState
 */

import type { PopoverActionState } from '../types/react19Types';
import { assertNever } from './assertNever';

export interface ActionStateMatchers<TData, TError, R> {
  readonly idle: (data?: TData) => R;
  readonly pending: (data?: TData, isOptimistic?: boolean) => R;
  readonly success: (data: TData) => R;
  readonly error: (error: TError, data?: TData) => R;
}

/**
 * Exhaustive pattern matcher executing the corresponding callback based on the action's lifecycle status.
 * Guarantees compile-time exhaustiveness via assertNever.
 *
 * @remarks
 * Designed for React 19 Concurrent Actions and optimistic reconciliation.
 * Pattern matching handles `idle`, `pending` (with optimistic flag), `success` (with non-null data),
 * and `error` (with typed error and optional fallback data).
 *
 * @template TData - Action payload model.
 * @template TError - Action error model (defaults to Error).
 * @template R - Return type produced by pattern matchers.
 * @param state - The PopoverActionState instance to match against.
 * @param matchers - Object containing callbacks for each distinct action lifecycle status.
 * @returns The return value of the matched branch callback.
 *
 * @example
 * ```typescript
 * const statusLabel = matchActionState(actionState, {
 *   idle: () => 'Ready',
 *   pending: (data, isOptimistic) => isOptimistic ? 'Saving optimistically...' : 'Submitting...',
 *   success: (data) => `Saved item ${data.id}`,
 *   error: (err) => `Failed: ${err.message}`,
 * });
 * ```
 */
export function matchActionState<TData, TError, R>(
  state: PopoverActionState<TData, TError>,
  matchers: ActionStateMatchers<TData, TError, R>,
): R {
  switch (state.status) {
    case 'idle':
      return matchers.idle(state.data);
    case 'pending':
      return matchers.pending(state.data, state.isOptimistic);
    case 'success':
      return matchers.success(state.data);
    case 'error':
      return matchers.error(state.error, state.data);
    default:
      return assertNever(state);
  }
}
