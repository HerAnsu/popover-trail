import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverWarningCode } from './warningEngine';
import {
  validateCascadeAncestry,
  validateTriggerEvent,
  validatePopoverKey,
  validatePlacement,
  validateHoverDelays,
} from './validateTrigger';

describe('validateTrigger', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('detects circular cascade loop (PT-105)', () => {
    validateCascadeAncestry('panel-a', 'panel-a');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.CIRCULAR_CASCADE_LOOP),
    );

    warnSpy.mockClear();
    validateCascadeAncestry('panel-a', 'panel-b');
    expect(warnSpy).not.toHaveBeenCalled();

    validateCascadeAncestry('panel-a', null);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('detects missing trigger event (PT-118)', () => {
    validateTriggerEvent(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.MISSING_TRIGGER_EVENT),
    );

    warnSpy.mockClear();
    validateTriggerEvent(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates popover key format (PT-101)', () => {
    validatePopoverKey('');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_POPOVER_KEY),
    );

    warnSpy.mockClear();
    validatePopoverKey('   ');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_POPOVER_KEY),
    );

    warnSpy.mockClear();
    validatePopoverKey('__proto__');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_POPOVER_KEY),
    );

    warnSpy.mockClear();
    validatePopoverKey('validKey');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates layout placement (PT-102)', () => {
    validatePlacement('invalid-placement' as never);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_PLACEMENT),
    );

    warnSpy.mockClear();
    validatePlacement('bottom');
    expect(warnSpy).not.toHaveBeenCalled();

    validatePlacement(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates hover open and close delays (PT-103 & PT-104)', () => {
    validateHoverDelays(50000, 100);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_HOVER_OPEN_DELAY),
    );

    warnSpy.mockClear();
    validateHoverDelays(100, 50000);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_HOVER_CLOSE_DELAY),
    );

    warnSpy.mockClear();
    validateHoverDelays(-5, 100);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_HOVER_OPEN_DELAY),
    );

    warnSpy.mockClear();
    validateHoverDelays(150, 200);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
