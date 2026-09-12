/**
 * Resource Acquisition Is Initialization (RAII) Type Guards and Invariants.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/resource/disposableGuards
 */

import {
  DISPOSE_SYMBOL,
  ASYNC_DISPOSE_SYMBOL,
  type ScopeDisposable,
  type AsyncScopeDisposable,
} from './disposableTypes';
import { createDisposedError } from './disposableErrors';

/**
 * Type guard verifying if an unknown value is a non-null object record.
 *
 * @param val - Target candidate to inspect.
 * @returns True if value is an object record.
 */
function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown> {
  return typeof val === 'object' && val !== null;
}

/**
 * Type guard checking if an unknown target satisfies the synchronous ScopeDisposable contract.
 * Checks for either standard `dispose()` method or Symbol.dispose implementation.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if value conforms to ScopeDisposable.
 */
export function isDisposable(val: unknown): val is ScopeDisposable {
  if (!isObjectRecord(val)) return false;
  return (
    typeof val['dispose'] === 'function' ||
    typeof val[DISPOSE_SYMBOL] === 'function'
  );
}

/**
 * Type guard checking if an unknown target satisfies the AsyncScopeDisposable contract.
 * Checks for either `disposeAsync()` method or Symbol.asyncDispose implementation.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if value conforms to AsyncScopeDisposable.
 */
export function isAsyncDisposable(val: unknown): val is AsyncScopeDisposable {
  if (!isObjectRecord(val)) return false;
  return (
    typeof val['disposeAsync'] === 'function' ||
    typeof val[ASYNC_DISPOSE_SYMBOL] === 'function'
  );
}

/**
 * Asserts that a stateful subsystem has not been disposed, enforcing RAII lifecycle invariants.
 *
 * @param disposed - Boolean flag indicating if disposal has occurred.
 * @param contextName - Optional name of the subsystem for debugging.
 * @throws Error if already disposed.
 */
export function assertNotDisposed(disposed: boolean, contextName?: string): void {
  if (disposed) {
    const err = createDisposedError(contextName);
    throw new Error(err.message);
  }
}

/**
 * Invariant check verifying if an entity has reached the terminal Omega disposal state.
 *
 * @param target - Stateful entity carrying an isDisposed indicator.
 * @returns True if entity is in terminal Omega state.
 */
export function isTerminalOmegaState(target: { readonly isDisposed?: boolean }): boolean {
  return target.isDisposed === true;
}
