import { describe, it, expect } from 'vitest';
import { invariant } from './invariant';

describe('invariant', () => {
  it('does not throw when condition is true', () => {
    expect(() => invariant(true, 'Must be true')).not.toThrow();
  });

  it('throws Error with provided message when condition is false', () => {
    expect(() => invariant(false, 'Condition failed')).toThrow('[Popover Trail] Condition failed');
  });
});
