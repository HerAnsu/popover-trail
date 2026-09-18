import { describe, it, expect } from 'vitest';
import {
  isPopoverActionState,
  isIdleActionState,
  isPendingActionState,
  isSuccessActionState,
  isErrorActionState,
} from './actionStateGuards';
import { type PopoverActionState, POPOVER_ACTION_STATUSES } from '../../types/react19Types';

describe('actionStateGuards', () => {
  it('validates generic PopoverActionState objects', () => {
    expect(isPopoverActionState({ status: 'idle', isOptimistic: false })).toBe(true);
    expect(isPopoverActionState({ status: 'pending', isOptimistic: true })).toBe(true);
    expect(isPopoverActionState({ status: 'invalid' })).toBe(false);
    expect(isPopoverActionState(null)).toBe(false);
    expect(isPopoverActionState(42)).toBe(false);
  });

  it('discriminates specific action lifecycle states', () => {
    const idle: PopoverActionState = { status: 'idle', isOptimistic: false };
    const pending: PopoverActionState = { status: 'pending', isOptimistic: false };
    const success: PopoverActionState<string> = {
      status: 'success',
      data: 'ok',
      isOptimistic: false,
    };
    const error: PopoverActionState = {
      status: 'error',
      error: new Error('fail'),
      isOptimistic: false,
    };

    expect(isIdleActionState(idle)).toBe(true);
    expect(isIdleActionState(pending)).toBe(false);

    expect(isPendingActionState(pending)).toBe(true);
    expect(isPendingActionState(idle)).toBe(false);

    expect(isSuccessActionState(success)).toBe(true);
    expect(isSuccessActionState(idle)).toBe(false);

    expect(isErrorActionState(error)).toBe(true);
    expect(isErrorActionState(success)).toBe(false);
  });

  it('exports POPOVER_ACTION_STATUSES containing all valid action statuses', () => {
    expect(POPOVER_ACTION_STATUSES).toEqual(['idle', 'pending', 'success', 'error']);
  });
});
