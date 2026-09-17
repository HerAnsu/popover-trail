/**
 * Resource Lifecycle & Disposal Errors and Factory Helpers.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/disposableErrors
 */

import { isObjectRecord } from '../guards/objectGuards';

export interface ObjectDisposedError {
  readonly code: 'OBJECT_DISPOSED';
  readonly message: string;
  readonly contextName?: string;
}

export type ResourceDomainError = ObjectDisposedError;

/**
 * Creates an `ObjectDisposedError` representing access to an already-disposed terminal resource.
 *
 * @param contextName - Optional name of the subsystem or resource.
 * @returns An `ObjectDisposedError` instance.
 *
 * @example
 * ```typescript
 * const err = createDisposedError('HistoryBuffer');
 * console.error(err.message);
 * ```
 */
export function createDisposedError(contextName?: string): ObjectDisposedError {
  const target = contextName ? ` "${contextName}"` : '';
  return {
    code: 'OBJECT_DISPOSED',
    message: `Cannot perform operation on disposed resource${target}. Resource has entered terminal state Ω.`,
    contextName,
  };
}

/**
 * Type guard verifying if an unknown error object is an `ObjectDisposedError`.
 *
 * @param val - Value to test.
 * @returns True if value is an ObjectDisposedError.
 *
 * @example
 * ```typescript
 * if (isObjectDisposedError(error)) {
 *   console.warn('Attempted to use disposed resource:', error.contextName);
 * }
 * ```
 */
export function isObjectDisposedError(val: unknown): val is ObjectDisposedError {
  return isObjectRecord(val) && val.code === 'OBJECT_DISPOSED';
}
