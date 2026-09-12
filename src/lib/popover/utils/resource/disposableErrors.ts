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

export function createDisposedError(contextName?: string): ObjectDisposedError {
  const target = contextName ? ` "${contextName}"` : '';
  return {
    code: 'OBJECT_DISPOSED',
    message: `Cannot perform operation on disposed resource${target}. Resource has entered terminal state Ω.`,
    contextName,
  };
}

export function isObjectDisposedError(val: unknown): val is ObjectDisposedError {
  return isObjectRecord(val) && val.code === 'OBJECT_DISPOSED';
}
