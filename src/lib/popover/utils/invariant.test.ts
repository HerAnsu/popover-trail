import { describe, it, expect } from 'vitest';
import { invariant } from './invariant';

describe('invariant utility', () => {
  it('does not throw when condition is truthy', () => {
    expect(() => invariant(true, 'should not throw')).not.toThrow();
    expect(() => invariant(1, () => 'should not throw')).not.toThrow();
  });

  it('throws with string message when condition is falsy', () => {
    expect(() => invariant(false, 'Key is missing')).toThrowError('[Popover Trail] Key is missing');
  });

  it('throws with error generator callback', () => {
    class CustomDomainError extends Error {}
    expect(() => invariant(false, () => new CustomDomainError('Custom fail'))).toThrow(
      CustomDomainError,
    );
  });
});
