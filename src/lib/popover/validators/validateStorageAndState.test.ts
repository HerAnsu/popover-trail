import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverWarningCode } from './warningEngine';
import {
  validateHistoryCapacity,
  validateSharedMemorySupport,
  validateHydrationError,
  validateStorageKey,
  validateFSMTransitionEvent,
} from './validateStorageAndState';

describe('validateStorageAndState', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('validates history capacity bounds (PT-117)', () => {
    validateHistoryCapacity(0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_HISTORY_CAPACITY),
    );

    warnSpy.mockClear();
    validateHistoryCapacity(600);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_HISTORY_CAPACITY),
    );

    warnSpy.mockClear();
    validateHistoryCapacity(50);
    validateHistoryCapacity(1);
    validateHistoryCapacity(500);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates SharedMemory worker support (PT-119)', () => {
    const originalSAB = globalThis.SharedArrayBuffer;
    try {
      Reflect.deleteProperty(globalThis, 'SharedArrayBuffer');

      validateSharedMemorySupport(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(PopoverWarningCode.SHARED_MEMORY_UNSUPPORTED),
      );
    } finally {
      globalThis.SharedArrayBuffer = originalSAB;
    }

    warnSpy.mockClear();
    validateSharedMemorySupport(false);
    validateSharedMemorySupport(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates hydration error logging (PT-120)', () => {
    validateHydrationError('userCard', new Error('Network timeout'));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.HYDRATION_ERROR),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Network timeout'),
    );

    warnSpy.mockClear();
    validateHydrationError('userCard', null);
    validateHydrationError('userCard', undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates storage key format (PT-122)', () => {
    validateStorageKey('');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_STORAGE_KEY),
    );

    warnSpy.mockClear();
    validateStorageKey('   ');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_STORAGE_KEY),
    );

    warnSpy.mockClear();
    validateStorageKey('app_popover_trail_v1');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates FSM transition event types (PT-124)', () => {
    validateFSMTransitionEvent('');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_FSM_TRANSITION),
    );

    warnSpy.mockClear();
    validateFSMTransitionEvent('   ');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_FSM_TRANSITION),
    );

    warnSpy.mockClear();
    validateFSMTransitionEvent('OPEN');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
