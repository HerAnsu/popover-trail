import { describe, it, expect, vi } from 'vitest';
import {
  warnDev,
  warnDevDetails,
  validatePopoverKey,
  validatePlacement,
  validateHoverDelays,
  validateCascadeAncestry,
  validateDragOffset,
  validateCascadeDepth,
  validateStackGroup,
  validateHistoryCapacity,
  validateTriggerEvent,
  validateSharedMemorySupport,
  validateHydrationError,
  validatePinDragState,
  validateStorageKey,
  validateQuadTreeBounds,
  validateFSMTransitionEvent,
  validatePortalContainer,
} from './devWarnings';

describe('Comprehensive Guardrail Error Warnings Utility', () => {
  it('logs basic warnDev console warning', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnDev(true, 'Basic warning message');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[popover-trail dev warning]: Basic warning message',
    );
    consoleWarnSpy.mockRestore();
  });

  it('logs structured warnDevDetails warning with code and message', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnDevDetails(true, {
      code: 'PT-TEST',
      message: 'Test issue occurred.',
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[popover-trail warning PT-TEST]: Test issue occurred.',
    );
    consoleWarnSpy.mockRestore();
  });

  it('validates PT-101 empty or invalid popover keys', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validatePopoverKey('');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-101]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-102 invalid layout placement strings', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validatePlacement('top-center' as unknown as import('../types').PopoverPlacement);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-102]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-103 & PT-104 hover delays outside reasonable ranges', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateHoverDelays(50000, 100);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-103]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-105 circular parent-child cascade loops', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateCascadeAncestry('card-1', 'card-1');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-105]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-114 drag offset coordinates', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateDragOffset(NaN, 50);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-114]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-115 cascade depth limit', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateCascadeDepth(15);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-115]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-116 stack group filter string', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateStackGroup('   ');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-116]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-117 history capacity bounds', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateHistoryCapacity(-5);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-117]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-118 trigger anchor event requirement', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateTriggerEvent(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-118]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-119 shared memory support', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalSAB = globalThis.SharedArrayBuffer;
    // @ts-expect-error Mocking SAB absence for test environment
    delete globalThis.SharedArrayBuffer;

    validateSharedMemorySupport(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-119]'),
    );

    globalThis.SharedArrayBuffer = originalSAB;
    consoleWarnSpy.mockRestore();
  });

  it('validates PT-120 hydration error', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateHydrationError('card-1', new Error('Network error'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-120]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-121 pin drag state', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validatePinDragState(false, false);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-121]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-122 storage key', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateStorageKey('');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-122]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-123 QuadTree spatial bounds', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateQuadTreeBounds(0, 500);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-123]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-124 FSM transition event', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateFSMTransitionEvent('');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-124]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('validates PT-125 portal container presence', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validatePortalContainer(null);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[popover-trail warning PT-125]'),
    );

    consoleWarnSpy.mockRestore();
  });
});
