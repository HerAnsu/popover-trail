import { describe, it, expect } from 'vitest';
import { Ok, Err } from './resultTypes';
import {
  fromThrowable,
  fromPromise,
  collectResults,
  partitionResults,
  combineResults,
} from './resultCombinators';

describe('Advanced Result Monadic Combinators', () => {
  it('fromThrowable captures return value on success', () => {
    const result = fromThrowable(() => 42);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(42);
    }
  });

  it('fromThrowable captures threw exception and converts with onError', () => {
    const customErr = fromThrowable(
      () => {
        throw new TypeError('Invalid input');
      },
      (e) => `Custom: ${(e as Error).message}`,
    );
    expect(customErr.success).toBe(false);
    if (!customErr.success) {
      expect(customErr.error).toBe('Custom: Invalid input');
    }
  });

  it('fromThrowable captures threw exception with default Error conversion', () => {
    const result = fromThrowable(() => {
      throw new Error('string failure');
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('string failure');
    }
  });

  it('fromPromise captures resolved promise into Ok Result', async () => {
    const result = await fromPromise(Promise.resolve('async data'));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('async data');
    }
  });

  it('fromPromise captures rejected promise into Err Result', async () => {
    const result = await fromPromise(
      Promise.reject(new Error('Async reject')),
      (e) => (e as Error).message,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Async reject');
    }
  });

  it('collectResults returns all data when all items are Ok', () => {
    const results = [Ok(1), Ok(2), Ok(3)];
    const collected = collectResults(results);
    expect(collected.success).toBe(true);
    if (collected.success) {
      expect(collected.data).toEqual([1, 2, 3]);
      expect(Object.isFrozen(collected.data)).toBe(true);
    }
  });

  it('collectResults short-circuits on first Err', () => {
    const results = [Ok(1), Err('failure at 2'), Ok(3), Err('failure at 4')];
    const collected = collectResults(results);
    expect(collected.success).toBe(false);
    if (!collected.success) {
      expect(collected.error).toBe('failure at 2');
    }
  });

  it('partitionResults groups successes and errors without throwing', () => {
    const results = [Ok(10), Err('e1'), Ok(20), Err('e2'), Ok(30)];
    const partitioned = partitionResults(results);
    expect(partitioned.ok).toEqual([10, 20, 30]);
    expect(partitioned.err).toEqual(['e1', 'e2']);
    expect(Object.isFrozen(partitioned.ok)).toBe(true);
    expect(Object.isFrozen(partitioned.err)).toBe(true);
  });

  it('combineResults zips two Ok Results into a tuple', () => {
    const r1 = Ok('hello');
    const r2 = Ok(123);
    const combined = combineResults(r1, r2);
    expect(combined.success).toBe(true);
    if (combined.success) {
      expect(combined.data).toEqual(['hello', 123]);
      expect(Object.isFrozen(combined.data)).toBe(true);
    }
  });

  it('combineResults short-circuits if first or second Result is Err', () => {
    const ok = Ok('val');
    const err1 = Err('first err');
    const err2 = Err('second err');

    expect(combineResults(err1, ok)).toEqual(err1);
    expect(combineResults(ok, err2)).toEqual(err2);
  });
});
