import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverWarningCode } from './warningEngine';
import {
  validateCascadeStep,
  validateDefaultOffset,
  validateBaseZIndex,
  validateExitDuration,
  validateProviderResolver,
  validateCascadeDepth,
  validateFactoryPlacement,
  validateStoreControllerInstance,
} from './validateProvider';

describe('validateProvider', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('validates cascade offset step bounds (PT-109)', () => {
    validateCascadeStep(250);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_CASCADE_OFFSET_STEP),
    );

    warnSpy.mockClear();
    validateCascadeStep(-1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_CASCADE_OFFSET_STEP),
    );

    warnSpy.mockClear();
    validateCascadeStep(15);
    validateCascadeStep(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates default offset gap bounds (PT-110)', () => {
    validateDefaultOffset(600);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_DEFAULT_OFFSET),
    );

    warnSpy.mockClear();
    validateDefaultOffset(12);
    validateDefaultOffset(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates base z-index (PT-111)', () => {
    validateBaseZIndex(-5);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_BASE_Z_INDEX),
    );

    warnSpy.mockClear();
    validateBaseZIndex(Number.NaN);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_BASE_Z_INDEX),
    );

    warnSpy.mockClear();
    validateBaseZIndex(1000);
    validateBaseZIndex(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates exit transition duration (PT-112)', () => {
    validateExitDuration(15000);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_EXIT_TRANSITION_DURATION),
    );

    warnSpy.mockClear();
    validateExitDuration(200);
    validateExitDuration(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates provider resolver presence (PT-113)', () => {
    validateProviderResolver(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.MISSING_RESOLVER_OR_SCHEMA),
    );

    warnSpy.mockClear();
    validateProviderResolver(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates cascade depth threshold (PT-115)', () => {
    validateCascadeDepth(15);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.CASCADE_DEPTH_EXCEEDED),
    );

    warnSpy.mockClear();
    validateCascadeDepth(5);
    validateCascadeDepth(10);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates factory placement outside render passes (PT-126)', () => {
    validateFactoryPlacement(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_FACTORY_PLACEMENT),
    );

    warnSpy.mockClear();
    validateFactoryPlacement(false);
    validateFactoryPlacement(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates store controller instance (PT-127)', () => {
    validateStoreControllerInstance(null);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_STORE_INSTANCE),
    );

    warnSpy.mockClear();
    validateStoreControllerInstance({ getState: 'not-a-function' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_STORE_INSTANCE),
    );

    warnSpy.mockClear();
    validateStoreControllerInstance({ getState: () => ({}) });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
