import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TrailEntry } from '../../types';
import {
  handleCardKeyboardNavigation,
  focusParentCard,
  getFocusableCardElements,
} from './useCardKeyboardNav';

class MockHTMLElement {
  focus = vi.fn();
  click = vi.fn();
  offsetWidth = 10;
  offsetHeight = 10;
  getClientRects = () => [{} as DOMRect];
  tagName = 'BUTTON';
  isContentEditable = false;
}

describe('useCardKeyboardNav', () => {
  const origWin = globalThis.window;
  const origDoc = globalThis.document;
  const origEl = globalThis.HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    globalThis.window = origWin;
    globalThis.document = origDoc;
    globalThis.HTMLElement = origEl;
  });

  it('triggers custom shortcuts when defined on entry', () => {
    const shortcutHandler = vi.fn();
    const entry: TrailEntry = {
      key: 'c1',
      isLoading: false,
      error: null,
      keyboardShortcuts: { 'Mod+k': shortcutHandler },
    };
    const event = { key: 'k', metaKey: true, preventDefault: vi.fn() };
    handleCardKeyboardNavigation({
      event,
      cardElement: null,
      entry,
      enableArrowNavigation: true,
      isPinned: false,
      trail: [entry],
      floatingCount: 1,
      actions: { closeFrom: vi.fn() },
    });
    expect(event.preventDefault).toHaveBeenCalled();
    expect(shortcutHandler).toHaveBeenCalledWith('c1');
  });

  it('dismisses card on Escape for both pinned and unpinned cards', () => {
    const entryPinned: TrailEntry = { key: 'p1', isLoading: false, error: null };
    const closeByKey = vi.fn();
    handleCardKeyboardNavigation({
      event: { key: 'Escape', preventDefault: vi.fn() },
      cardElement: null,
      entry: entryPinned,
      enableArrowNavigation: true,
      isPinned: true,
      trail: [entryPinned],
      floatingCount: 1,
      actions: { closeFrom: vi.fn(), closeByKey },
    });
    expect(closeByKey).toHaveBeenCalledWith('p1');

    const entryUnpinned: TrailEntry = { key: 'u1', isLoading: false, error: null };
    const closeFrom = vi.fn();
    handleCardKeyboardNavigation({
      event: { key: 'Escape', preventDefault: vi.fn() },
      cardElement: null,
      entry: entryUnpinned,
      enableArrowNavigation: true,
      isPinned: false,
      trail: [entryUnpinned],
      floatingCount: 1,
      actions: { closeFrom },
    });
    expect(closeFrom).toHaveBeenCalledWith(0);
  });

  it('handles horizontal ArrowLeft to close child card and ArrowRight to activate', () => {
    const parentEntry: TrailEntry = { key: 'root', isLoading: false, error: null };
    const childEntry: TrailEntry = { key: 'sub', isLoading: false, error: null };
    const closeByKey = vi.fn();

    handleCardKeyboardNavigation(
      { key: 'ArrowLeft', preventDefault: vi.fn() },
      null,
      childEntry,
      true,
      false,
      [parentEntry, childEntry],
      0,
      { closeFrom: vi.fn(), closeByKey },
    );
    expect(closeByKey).toHaveBeenCalledWith('sub');

    const clickable = Object.assign(new MockHTMLElement(), {
      tagName: 'BUTTON',
      getAttribute: (a: string) => (a === 'role' ? 'button' : null),
    });
    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
    globalThis.document = { activeElement: clickable } as unknown as Document;

    handleCardKeyboardNavigation(
      { key: 'ArrowRight', preventDefault: vi.fn() },
      null,
      childEntry,
      true,
      false,
      [childEntry],
    );
    expect(clickable.click).toHaveBeenCalled();
  });

  it('navigates vertically across focusable elements with ArrowDown', () => {
    const el1 = new MockHTMLElement();
    const el2 = new MockHTMLElement();
    const card = { querySelectorAll: vi.fn(() => [el1, el2]) } as unknown as HTMLElement;

    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
    globalThis.document = { activeElement: el1 } as unknown as Document;

    const entry: TrailEntry = { key: 'c', isLoading: false, error: null };
    handleCardKeyboardNavigation({
      event: { key: 'ArrowDown', preventDefault: vi.fn() },
      cardElement: card,
      entry,
      enableArrowNavigation: true,
      isPinned: false,
      trail: [entry],
      floatingCount: 1,
      actions: { closeFrom: vi.fn() },
    });
    expect(el2.focus).toHaveBeenCalled();
  });

  it('focusParentCard queries card element and targets first focusable child', () => {
    expect(focusParentCard('')).toBe(false);
    const targetBtn = new MockHTMLElement();
    const parentNode = {
      querySelector: vi.fn((sel: string) => (sel.includes('button') ? targetBtn : null)),
      focus: vi.fn(),
    } as unknown as HTMLElement;

    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
    globalThis.document = {
      querySelector: vi.fn((sel: string) => (sel.includes('card-p') ? parentNode : null)),
    } as unknown as Document;

    expect(focusParentCard('p')).toBe(true);
    expect(targetBtn.focus).toHaveBeenCalled();
    expect(getFocusableCardElements(null)).toEqual([]);
  });
});
