import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { FocusTrap } from './FocusTrap';

type EffectCallback = () => (() => void) | void;
const capturedEffects: EffectCallback[] = [];

class MockFocusElement {
  focus = vi.fn();
  offsetParent = {} as Element;
  hasAttribute = (attr: string): boolean => attr === 'disabled' && false;
}

class MockContainerElement {
  listeners: Record<string, (e: KeyboardEvent) => void> = {};
  addEventListener = (type: string, fn: (e: KeyboardEvent) => void): void => {
    this.listeners[type] = fn;
  };
  removeEventListener = (type: string): void => {
    delete this.listeners[type];
  };
  querySelectorAll = vi.fn();
}

let mockContainerInstance = new MockContainerElement();

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: <T,>(_init: T) => ({ current: mockContainerInstance as unknown as T }),
    useEffect: (fn: EffectCallback) => {
      capturedEffects.push(fn);
    },
  };
});

describe('FocusTrap component', () => {
  const origWin = globalThis.window;
  const origDoc = globalThis.document;
  const origEl = globalThis.HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedEffects.length = 0;
    mockContainerInstance = new MockContainerElement();
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

  it('renders container div wrapping children with styles and className', () => {
    const vnode = FocusTrap({
      children: <span>Child Content</span>,
      className: 'trap-container',
      style: { opacity: 1 },
    });

    expect(vnode.type).toBe('div');
    expect(vnode.props.className).toBe('trap-container');
    expect(vnode.props.style).toEqual({ opacity: 1 });
    expect(React.isValidElement(vnode)).toBe(true);
  });

  it('auto-focuses the first focusable child on initial mount', () => {
    const firstBtn = new MockFocusElement();
    const lastBtn = new MockFocusElement();
    mockContainerInstance.querySelectorAll.mockReturnValue([firstBtn, lastBtn]);

    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockFocusElement as unknown as typeof HTMLElement;
    globalThis.document = { activeElement: null } as unknown as Document;

    FocusTrap({ children: null, autoFocus: true });
    runEffects();

    expect(firstBtn.focus).toHaveBeenCalledTimes(1);
  });

  it('bounces Tab from last to first and Shift+Tab from first to last cyclically', () => {
    const firstBtn = new MockFocusElement();
    const lastBtn = new MockFocusElement();
    mockContainerInstance.querySelectorAll.mockReturnValue([firstBtn, lastBtn]);

    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockFocusElement as unknown as typeof HTMLElement;
    globalThis.document = { activeElement: lastBtn } as unknown as Document;

    FocusTrap({ children: null });
    runEffects();

    const keydownHandler = mockContainerInstance.listeners.keydown;
    expect(typeof keydownHandler).toBe('function');

    const tabEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownHandler?.(tabEvent);

    expect(tabEvent.preventDefault).toHaveBeenCalled();
    expect(firstBtn.focus).toHaveBeenCalledTimes(2); // 1 from autoFocus, 1 from Tab bounce

    globalThis.document = { activeElement: firstBtn } as unknown as Document;
    const shiftTabEvent = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownHandler?.(shiftTabEvent);

    expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
    expect(lastBtn.focus).toHaveBeenCalledTimes(1);
  });

  it('restores focus to previous active element on unmount', () => {
    const prevElement = new MockFocusElement();
    mockContainerInstance.querySelectorAll.mockReturnValue([]);

    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockFocusElement as unknown as typeof HTMLElement;
    globalThis.document = { activeElement: prevElement } as unknown as Document;

    FocusTrap({ children: null, returnFocus: true });
    const cleanups = runEffects();

    for (const cleanup of cleanups) cleanup();

    expect(prevElement.focus).toHaveBeenCalledTimes(1);
  });

  it('does not register event listeners or focus when disabled', () => {
    mockContainerInstance.querySelectorAll.mockReturnValue([]);
    globalThis.window = {} as unknown as Window & typeof globalThis;

    FocusTrap({ children: null, disabled: true });
    runEffects();

    expect(mockContainerInstance.listeners.keydown).toBeUndefined();
  });
});
