import { describe, it, expect } from 'vitest';
import {
  isDisposable,
  isAsyncDisposable,
  assertNotDisposed,
  isTerminalOmegaState,
} from './disposableGuards';
import { createDisposedError, isObjectDisposedError } from './disposableErrors';
import { DISPOSE_SYMBOL, ASYNC_DISPOSE_SYMBOL } from './disposableTypes';

describe('disposableGuards & disposableErrors', () => {
  it('correctly detects synchronous disposables', () => {
    expect(isDisposable({ dispose: () => {} })).toBe(true);
    expect(isDisposable({ [DISPOSE_SYMBOL]: () => {} })).toBe(true);
    expect(isDisposable(null)).toBe(false);
    expect(isDisposable({})).toBe(false);
    expect(isDisposable(42)).toBe(false);
  });

  it('correctly detects asynchronous disposables', () => {
    expect(isAsyncDisposable({ disposeAsync: async () => {} })).toBe(true);
    expect(isAsyncDisposable({ [ASYNC_DISPOSE_SYMBOL]: async () => {} })).toBe(true);
    expect(isAsyncDisposable(null)).toBe(false);
    expect(isAsyncDisposable({ dispose: () => {} })).toBe(false);
  });

  it('assertNotDisposed validates terminal state', () => {
    expect(() => assertNotDisposed(false, 'TestCtx')).not.toThrow();
    expect(() => assertNotDisposed(true, 'TestCtx')).toThrow(/terminal state Ω/);
  });

  it('checks terminal omega state flag', () => {
    expect(isTerminalOmegaState({ isDisposed: true })).toBe(true);
    expect(isTerminalOmegaState({ isDisposed: false })).toBe(false);
    expect(isTerminalOmegaState({})).toBe(false);
  });

  it('creates and identifies ObjectDisposedError', () => {
    const err = createDisposedError('MyService');
    expect(err.code).toBe('OBJECT_DISPOSED');
    expect(err.contextName).toBe('MyService');
    expect(isObjectDisposedError(err)).toBe(true);
    expect(isObjectDisposedError({ code: 'OTHER' })).toBe(false);
  });
});
