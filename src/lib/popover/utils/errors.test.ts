import { describe, it, expect } from 'vitest';
import { PopoverError, PopoverErrorCode, createPopoverError } from './errors';

describe('errors utility', () => {
  it('formats error message with code and remediation hint', () => {
    const err = new PopoverError(
      PopoverErrorCode.RESOLVER_TIMEOUT,
      'Data fetch timed out',
      'Increase timeout value',
      new Error('Root cause'),
    );

    expect(err.name).toBe('PopoverError');
    expect(err.code).toBe('ERR_RESOLVER_TIMEOUT');
    expect(err.message).toContain('[popover-trail:ERR_RESOLVER_TIMEOUT] Data fetch timed out');
    expect(err.message).toContain('💡 Remediation Hint: Increase timeout value');
    expect(err.remediationHint).toBe('Increase timeout value');
    expect(err.cause).toBeDefined();
  });

  it('formats error message without remediation hint', () => {
    const err = new PopoverError(PopoverErrorCode.UNMOUNTED, 'Element unmounted');
    expect(err.message).toBe('[popover-trail:ERR_UNMOUNTED] Element unmounted');
    expect(err.remediationHint).toBeUndefined();
  });

  it('correctly checks isPopoverError instance and code matching', () => {
    const err = createPopoverError(PopoverErrorCode.CIRCULAR_CASCADE, 'Cycle detected');

    expect(PopoverError.isPopoverError(err)).toBe(true);
    expect(PopoverError.isPopoverError(err, PopoverErrorCode.CIRCULAR_CASCADE)).toBe(true);
    expect(PopoverError.isPopoverError(err, PopoverErrorCode.WORKER_CRASHED)).toBe(false);
    expect(PopoverError.isPopoverError(new Error('Standard error'))).toBe(false);
    expect(PopoverError.isPopoverError(null)).toBe(false);
  });
});
