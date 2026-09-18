import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverWarningCode } from './warningEngine';
import {
  validateSchemaKey,
  validateSchemaCircularChild,
  validateResolverTimeout,
} from './validateSchema';

describe('validateSchema', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('validates schema key presence and formatting (PT-108)', () => {
    validateSchemaKey(false, 'unknownKey');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.UNDEFINED_SCHEMA_KEY),
    );

    warnSpy.mockClear();
    validateSchemaKey(true, '');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.UNDEFINED_SCHEMA_KEY),
    );

    warnSpy.mockClear();
    validateSchemaKey(true, '   ');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.UNDEFINED_SCHEMA_KEY),
    );

    warnSpy.mockClear();
    validateSchemaKey(true, 'profile');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('detects self-referential circular child definitions (PT-128)', () => {
    validateSchemaCircularChild('item-1', 'item-1');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.SCHEMA_CIRCULAR_CHILD),
    );

    warnSpy.mockClear();
    validateSchemaCircularChild('item-1', 'item-2');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when resolver exceeds timeout threshold (PT-129)', () => {
    validateResolverTimeout(5001, 'slowData');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.RESOLVER_TIMEOUT),
    );

    warnSpy.mockClear();
    validateResolverTimeout(6000, 'slowData');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.RESOLVER_TIMEOUT),
    );

    warnSpy.mockClear();
    validateResolverTimeout(5000, 'normalData');
    expect(warnSpy).not.toHaveBeenCalled();

    validateResolverTimeout(150, 'fastData');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
