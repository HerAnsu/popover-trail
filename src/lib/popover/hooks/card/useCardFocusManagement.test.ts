import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TrailEntry } from '../../types';
import { useCardFocusManagement } from './useCardFocusManagement';
import { focusParentCard } from './useCardKeyboardNav';
import { useBodyScrollLock } from '../useBodyScrollLock';

const capturedEffects: Array<() => (() => void) | void> = [];

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: <T>(initial: T) => ({ current: initial }),
    useEffect: (fn: () => (() => void) | void) => {
      capturedEffects.push(fn);
    },
  };
});
vi.mock('./useCardKeyboardNav', () => ({ focusParentCard: vi.fn() }));
vi.mock('../useBodyScrollLock', () => ({ useBodyScrollLock: vi.fn() }));

class MockHTMLElement {
  focus = vi.fn();
}

describe('useCardFocusManagement', () => {
  const origWin = globalThis.window;
  const origDoc = globalThis.document;
  const origEl = globalThis.HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedEffects.length = 0;
  });

  afterEach(() => {
    globalThis.window = origWin;
    globalThis.document = origDoc;
    globalThis.HTMLElement = origEl;
  });

  const runEffects = (): Array<() => void> => {
    const cleanups: Array<() => void> = [];
    for (const eff of capturedEffects) {
      const c = eff();
      if (typeof c === 'function') cleanups.push(c);
    }
    return cleanups;
  };

  it('handles auto-focus element string selector and lockScroll option', () => {
    const mockEl = new MockHTMLElement();
    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
    globalThis.document = {
      querySelector: vi.fn((sel: string) => (sel === '#auto-btn' ? mockEl : null)),
    } as unknown as Document;

    const entry: TrailEntry = {
      key: 'c1',
      isLoading: false,
      error: null,
      focusLockOptions: { autoFocusElement: '#auto-btn', lockScroll: true },
    };
    useCardFocusManagement(entry, { current: null });

    expect(useBodyScrollLock).toHaveBeenCalledWith(true);
    runEffects();
    expect(mockEl.focus).toHaveBeenCalled();
  });

  it('handles auto-focus element function returning HTMLElement', () => {
    const mockEl = new MockHTMLElement();
    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
    globalThis.document = {} as unknown as Document;

    const autoFocusFn = vi.fn(() => mockEl as unknown as HTMLElement);
    const entry: TrailEntry = {
      key: 'c2',
      isLoading: false,
      error: null,
      focusLockOptions: { autoFocusElement: autoFocusFn },
    };
    useCardFocusManagement(entry, { current: null });

    runEffects();
    expect(autoFocusFn).toHaveBeenCalled();
    expect(mockEl.focus).toHaveBeenCalled();
  });

  it('restores focus to previous element on unmount when focus is within card', () => {
    const prevEl = new MockHTMLElement();
    const activeEl = new MockHTMLElement();
    const cardEl = Object.assign(new MockHTMLElement(), {
      contains: vi.fn((n: unknown) => n === activeEl),
    });

    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
    globalThis.document = {
      activeElement: prevEl,
      body: { contains: vi.fn((el: unknown) => el === prevEl) },
    } as unknown as Document;

    const entry: TrailEntry = {
      key: 'c3',
      isLoading: false,
      error: null,
      focusLockOptions: { returnFocus: true },
    };
    useCardFocusManagement(entry, { current: cardEl as unknown as HTMLElement });

    const cleanups = runEffects();
    Object.assign(globalThis.document, { activeElement: activeEl });
    for (const c of cleanups) c();
    expect(prevEl.focus).toHaveBeenCalled();
  });

  it('delegates to focusParentCard on unmount when previously focused element cannot receive focus', () => {
    const entry: TrailEntry = {
      key: 'child',
      parentKey: 'parent',
      isLoading: false,
      error: null,
    };
    useCardFocusManagement(entry, { current: null });
    const cleanups = runEffects();
    for (const c of cleanups) c();
    expect(focusParentCard).toHaveBeenCalledWith('parent');
  });

  it('skips focus restoration when returnFocus is explicitly false', () => {
    const entry: TrailEntry = {
      key: 'no-ret',
      parentKey: 'parent',
      isLoading: false,
      error: null,
      focusLockOptions: { returnFocus: false },
    };
    useCardFocusManagement(entry, { current: null });
    const cleanups = runEffects();
    for (const c of cleanups) c();
    expect(focusParentCard).not.toHaveBeenCalled();
  });
});
