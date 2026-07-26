import { describe, it, expect, vi } from 'vitest';
import {
  warnDev,
  warnDevDetails,
  validatePopoverKey,
  validatePlacement,
  validateHoverDelays,
  validateCascadeAncestry,
} from './devWarnings';

describe('Enhanced Guardrail Warnings Utility', () => {
  it('logs basic warnDev console warning', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnDev(true, 'Basic warning message');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[popover-trail dev warning]: Basic warning message',
    );
    consoleWarnSpy.mockRestore();
  });

  it('logs structured warnDevDetails warning with solution', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnDevDetails(true, {
      code: 'PT-TEST',
      issue: 'Test issue occurred.',
      solution: 'Apply test fix.',
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[popover-trail warning PT-TEST]: Test issue occurred.\n  💡 Solution: Apply test fix.',
    );
    consoleWarnSpy.mockRestore();
  });

  it('validates empty or invalid popover keys', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validatePopoverKey('');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-101]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates invalid layout placement strings', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validatePlacement('top-center' as unknown as import('../types').PopoverPlacement);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-102]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates hover delays outside reasonable ranges', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateHoverDelays(50000, 100);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-103]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('detects circular parent-child cascade loops', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateCascadeAncestry('card-1', 'card-1');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-105]'),
    );

    consoleWarnSpy.mockRestore();
  });
});
