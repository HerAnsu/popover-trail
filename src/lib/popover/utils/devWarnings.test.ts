import { describe, it, expect, vi } from 'vitest';
import { warnDev } from './devWarnings';

describe('warnDev Utility', () => {
  it('logs console warning when condition is true', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnDev(true, 'Test warning message');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[popover-trail dev warning]: Test warning message',
    );
    consoleWarnSpy.mockRestore();
  });

  it('does not log console warning when condition is false', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnDev(false, 'Test warning message');

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});
