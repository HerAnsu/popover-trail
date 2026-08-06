import { describe, it, expect } from 'vitest';
import {
  Ok,
  Err,
  isOk,
  isErr,
  mapResult,
  flatMapResult,
  unwrapOr,
  wrapResult,
  wrapAsyncResult,
} from './result';
import { PopoverErrorCode } from './errors';

describe('result monad utility', () => {
  it('creates Ok and Err results correctly', () => {
    const okRes = Ok(42);
    const errRes = Err('error');

    expect(isOk(okRes)).toBe(true);
    expect(isErr(okRes)).toBe(false);
    expect(isOk(errRes)).toBe(false);
    expect(isErr(errRes)).toBe(true);
  });

  it('maps result data when Ok, preserves Err', () => {
    const okRes = Ok(10);
    const errRes = Err<string>('error');

    const mappedOk = mapResult(okRes, (x) => x * 2);
    const mappedErr = mapResult(errRes, (x: number) => x * 2);

    expect(unwrapOr(mappedOk, 0)).toBe(20);
    expect(mappedErr.success).toBe(false);
  });

  it('flatMaps result when Ok, short-circuits on Err', () => {
    const okRes = Ok(5);
    const errRes = Err<string>('failed');

    const flatMappedOk = flatMapResult(okRes, (x) => Ok(x + 5));
    const flatMappedErr = flatMapResult(errRes, (x: number) => Ok(x + 5));

    expect(unwrapOr(flatMappedOk, 0)).toBe(10);
    expect(flatMappedErr.success).toBe(false);
  });

  it('unwraps data or returns fallback value', () => {
    expect(unwrapOr(Ok('hello'), 'fallback')).toBe('hello');
    expect(unwrapOr(Err('err'), 'fallback')).toBe('fallback');
  });

  it('wraps throwing sync function into Result', () => {
    const okResult = wrapResult(() => 'success');
    expect(okResult.success).toBe(true);

    const errResult = wrapResult(() => {
      throw new Error('Sync error');
    });
    expect(errResult.success).toBe(false);
    if (!errResult.success) {
      expect(errResult.error.code).toBe(PopoverErrorCode.INVALID_TRANSITION);
    }
  });

  it('wraps async promise into Result', async () => {
    const okRes = await wrapAsyncResult(Promise.resolve('async data'));
    expect(okRes.success).toBe(true);

    const errRes = await wrapAsyncResult(Promise.reject(new Error('Async error')));
    expect(errRes.success).toBe(false);
    if (!errRes.success) {
      expect(errRes.error.code).toBe(PopoverErrorCode.RESOLVER_TIMEOUT);
    }
  });
});
