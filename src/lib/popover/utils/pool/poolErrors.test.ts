import { describe, it, expect } from 'vitest';
import {
  createInvalidPoolOptionsError,
  createPoolExhaustedError,
  createPoolDisposedError,
  isPoolDomainError,
  isInvalidPoolOptionsError,
  isPoolExhaustedError,
  isPoolDisposedError,
  matchPoolError,
} from './poolErrors';

describe('poolErrors', () => {
  it('creates and identifies InvalidPoolOptionsError', () => {
    const err = createInvalidPoolOptionsError('Bad factory', { factory: 123 });
    expect(err.code).toBe('INVALID_POOL_OPTIONS');
    expect(err.message).toBe('Bad factory');
    expect(isPoolDomainError(err)).toBe(true);
    expect(isInvalidPoolOptionsError(err)).toBe(true);
    expect(isPoolExhaustedError(err)).toBe(false);
  });

  it('creates and identifies PoolExhaustedError', () => {
    const err = createPoolExhaustedError(100);
    expect(err.code).toBe('POOL_EXHAUSTED');
    expect(err.capacity).toBe(100);
    expect(isPoolDomainError(err)).toBe(true);
    expect(isPoolExhaustedError(err)).toBe(true);
  });

  it('creates and identifies PoolDisposedError', () => {
    const err = createPoolDisposedError();
    expect(err.code).toBe('POOL_DISPOSED');
    expect(isPoolDomainError(err)).toBe(true);
    expect(isPoolDisposedError(err)).toBe(true);
  });

  it('correctly matches errors via matchPoolError', () => {
    const e1 = createInvalidPoolOptionsError('Invalid options');
    const e2 = createPoolExhaustedError(50);
    const e3 = createPoolDisposedError();

    const matcher = {
      INVALID_POOL_OPTIONS: (e: { message: string }) => `opt:${e.message}`,
      POOL_EXHAUSTED: (e: { capacity: number }) => `exh:${e.capacity}`,
      POOL_DISPOSED: () => 'disp',
    };

    expect(matchPoolError(e1, matcher)).toBe('opt:Invalid options');
    expect(matchPoolError(e2, matcher)).toBe('exh:50');
    expect(matchPoolError(e3, matcher)).toBe('disp');
  });

  it('returns false for non-error or unrelated values', () => {
    expect(isPoolDomainError(null)).toBe(false);
    expect(isPoolDomainError(undefined)).toBe(false);
    expect(isPoolDomainError({})).toBe(false);
    expect(isPoolDomainError({ code: 'OTHER' })).toBe(false);
  });
});
