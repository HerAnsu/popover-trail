import { describe, it, expect } from 'vitest';
import {
  isFSMState,
  isIdleFSM,
  isHydratingFSM,
  isResolvedFSM,
  isTrailingFSM,
  isPinnedFSM,
  isErrorFSM,
  isUnmountingFSM,
} from './fsmGuards';
import { assertPopoverFSMState } from './fsmTransitions';
import { canTransition } from './fsmMatrix';
import type { PopoverFSMState } from './fsmTypes';

describe('fsmGuards', () => {
  it('isFSMState validates state object shape', () => {
    const valid: PopoverFSMState = { value: 'Idle', context: { key: 'k1' } };
    expect(isFSMState(valid)).toBe(true);
    expect(isFSMState({ value: 'Unknown', context: {} })).toBe(false);
    expect(isFSMState(null)).toBe(false);
  });

  it('discriminates FSM states correctly', () => {
    const idle: PopoverFSMState = { value: 'Idle', context: { key: 'k' } };
    const hydrating: PopoverFSMState = { value: 'Hydrating', context: { key: 'k' } };
    const trailing: PopoverFSMState = { value: 'Resolved.Trailing', context: { key: 'k' } };
    const pinned: PopoverFSMState = { value: 'Resolved.Pinned', context: { key: 'k' } };
    const error: PopoverFSMState = { value: 'Error', context: { key: 'k' } };
    const unmounting: PopoverFSMState = { value: 'Unmounting', context: { key: 'k' } };

    expect(isIdleFSM(idle)).toBe(true);
    expect(isIdleFSM(hydrating)).toBe(false);

    expect(isHydratingFSM(hydrating)).toBe(true);
    expect(isHydratingFSM(idle)).toBe(false);

    expect(isResolvedFSM(trailing)).toBe(true);
    expect(isResolvedFSM(pinned)).toBe(true);
    expect(isResolvedFSM(hydrating)).toBe(false);

    expect(isTrailingFSM(trailing)).toBe(true);
    expect(isTrailingFSM(pinned)).toBe(false);

    expect(isPinnedFSM(pinned)).toBe(true);
    expect(isPinnedFSM(trailing)).toBe(false);

    expect(isErrorFSM(error)).toBe(true);
    expect(isErrorFSM(idle)).toBe(false);

    expect(isUnmountingFSM(unmounting)).toBe(true);
    expect(isUnmountingFSM(error)).toBe(false);
  });

  it('assertPopoverFSMState correctly asserts expected state and throws on mismatch', () => {
    const idle: PopoverFSMState<{ count: number }, 'modal'> = {
      value: 'Idle',
      context: { key: 'modal' },
    };

    expect(() => assertPopoverFSMState(idle, 'Idle')).not.toThrow();

    // Verify type narrowing after assertion:
    assertPopoverFSMState(idle, 'Idle');
    expect(idle.value).toBe('Idle');

    expect(() => assertPopoverFSMState(idle, 'Hydrating')).toThrow(
      '[assertPopoverFSMState] Expected FSM state "Hydrating", received "Idle"',
    );
  });

  it('canTransition validates allowed state transitions and narrows type', () => {
    expect(canTransition('Idle', 'Hydrating')).toBe(true);
    expect(canTransition('Idle', 'Resolved.Trailing')).toBe(false);
    expect(canTransition('Hydrating', 'Resolved.Trailing')).toBe(true);
    expect(canTransition('Hydrating', 'Resolved.Pinned')).toBe(true);
    expect(canTransition('Unmounting', 'Idle')).toBe(true);
    expect(canTransition('Unmounting', 'Resolved.Pinned')).toBe(false);
  });
});
