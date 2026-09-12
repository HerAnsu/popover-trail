import { describe, it, expect } from 'vitest';
import { isError, isErrorLike, isAbortError, toError, toErrorMessage } from './errorGuards';

describe('errorGuards', () => {
  it('identifies standard Error instances and error-like objects', () => {
    const err = new Error('test error');
    expect(isError(err)).toBe(true);
    expect(isErrorLike(err)).toBe(true);
    expect(isErrorLike({ name: 'CustomError', message: 'Something went wrong' })).toBe(true);
    expect(isErrorLike({ message: 'Missing name' })).toBe(false);
    expect(isErrorLike(null)).toBe(false);
  });

  it('identifies AbortError instances properly', () => {
    const abortErr = new Error('Operation aborted');
    abortErr.name = 'AbortError';
    expect(isAbortError(abortErr)).toBe(true);
    expect(isAbortError(new Error('regular error'))).toBe(false);
    expect(isAbortError({ name: 'AbortError', message: 'aborted' })).toBe(true);
    expect(isAbortError(null)).toBe(false);
  });

  it('converts unknown values to Error with toError and toErrorMessage', () => {
    expect(toError('boom').message).toBe('boom');
    const existing = new Error('already an error');
    expect(toError(existing)).toBe(existing);
    expect(toErrorMessage({ name: 'Err', message: 'msg' })).toBe('msg');
    expect(toErrorMessage('literal string')).toBe('literal string');
  });
});
