import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, TrailEntry } from '../types';
import { usePopoverKeyboardShortcuts } from './usePopoverKeyboard';
import { useEventListener } from '../hooks/useEventListener';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
  };
});

let capturedHandler: ((e: KeyboardEvent) => void) | null = null;
vi.mock('../hooks/useEventListener', () => ({
  useEventListener: vi.fn((event: string, handler: (e: KeyboardEvent) => void) => {
    if (event === 'keydown') capturedHandler = handler;
  }),
}));

describe('usePopoverKeyboardShortcuts', () => {
  const closeTopmost = vi.fn();

  const createMockStore = (overrides?: Partial<PopoverStore>): StoreApi<PopoverStore> =>
    ({
      getState: () =>
        ({
          trail: [],
          floating: [],
          closeTopmost,
          ...overrides,
        }) as unknown as PopoverStore,
    }) as unknown as StoreApi<PopoverStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedHandler = null;
  });

  const createKeyboardEvent = (key: string, defaultPrevented = false): KeyboardEvent =>
    ({
      key,
      defaultPrevented,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }) as unknown as KeyboardEvent;

  it('registers keydown listener via useEventListener', () => {
    const store = createMockStore();
    usePopoverKeyboardShortcuts(store, true);
    expect(useEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(capturedHandler).toBeTypeOf('function');
  });

  it('does nothing when enableKeyboardClose is false or defaultPrevented is true', () => {
    const store = createMockStore({ trail: [{ key: 'c1' } as TrailEntry] });
    usePopoverKeyboardShortcuts(store, false);
    if (!capturedHandler) throw new Error('Handler not bound');

    const ev = createKeyboardEvent('Escape');
    capturedHandler(ev);
    expect(closeTopmost).not.toHaveBeenCalled();
    expect(ev.preventDefault).not.toHaveBeenCalled();

    usePopoverKeyboardShortcuts(store, true);
    const evPrevented = createKeyboardEvent('Escape', true);
    if (!capturedHandler) throw new Error('Handler not bound');
    capturedHandler(evPrevented);
    expect(closeTopmost).not.toHaveBeenCalled();
  });

  it('ignores non-escape keys', () => {
    const store = createMockStore({ trail: [{ key: 'c1' } as TrailEntry] });
    usePopoverKeyboardShortcuts(store, true);
    if (!capturedHandler) throw new Error('Handler not bound');

    const ev = createKeyboardEvent('Enter');
    capturedHandler(ev);
    expect(closeTopmost).not.toHaveBeenCalled();
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  it('dismisses topmost popover when Escape is pressed and trail or floating is active', () => {
    const storeWithTrail = createMockStore({ trail: [{ key: 'c1' } as TrailEntry] });
    usePopoverKeyboardShortcuts(storeWithTrail, true);
    if (!capturedHandler) throw new Error('Handler not bound');

    const evTrail = createKeyboardEvent('Escape');
    capturedHandler(evTrail);
    expect(evTrail.preventDefault).toHaveBeenCalled();
    expect(evTrail.stopPropagation).toHaveBeenCalled();
    expect(closeTopmost).toHaveBeenCalledTimes(1);

    const storeWithFloating = createMockStore({ floating: [{ key: 'f1' } as TrailEntry] });
    usePopoverKeyboardShortcuts(storeWithFloating, true);
    if (!capturedHandler) throw new Error('Handler not bound');

    const evFloating = createKeyboardEvent('Escape');
    capturedHandler(evFloating);
    expect(closeTopmost).toHaveBeenCalledTimes(2);
  });

  it('does not close or prevent default when both trail and floating are empty on Escape', () => {
    const emptyStore = createMockStore({ trail: [], floating: [] });
    usePopoverKeyboardShortcuts(emptyStore, true);
    if (!capturedHandler) throw new Error('Handler not bound');

    const ev = createKeyboardEvent('Escape');
    capturedHandler(ev);
    expect(closeTopmost).not.toHaveBeenCalled();
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });
});
