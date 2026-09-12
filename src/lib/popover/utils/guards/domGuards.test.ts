import { describe, it, expect } from 'vitest';
import {
  isHTMLElement,
  isElement,
  isMessageEvent,
  escapeCssIdentifier,
  isTextEditableElement,
  isClickableElement,
  isStorageAvailable,
} from './domGuards';

describe('utils/guards/domGuards', () => {
  it('identifies HTMLElements and Elements with fallbacks', () => {
    expect(isHTMLElement(null)).toBe(false);
    expect(isElement({})).toBe(false);
    expect(isHTMLElement(42)).toBe(false);
  });

  it('identifies native MessageEvent instances or mocks', () => {
    expect(isMessageEvent(null)).toBe(false);
    expect(isMessageEvent({ type: 'message', data: 'test' })).toBe(false);
    if (typeof MessageEvent !== 'undefined') {
      const msg = new MessageEvent('message', { data: 'test' });
      expect(isMessageEvent(msg)).toBe(true);
    }
  });

  it('escapes css identifiers safely with fallback', () => {
    expect(escapeCssIdentifier('simple')).toBe('simple');
    expect(escapeCssIdentifier('item"test"')).toBe('item\\"test\\"');
    expect(escapeCssIdentifier('path\\file')).toBe('path\\\\file');
  });

  it('identifies text editable and clickable elements safely', () => {
    expect(isTextEditableElement(null)).toBe(false);
    expect(isClickableElement(null)).toBe(false);
    expect(isTextEditableElement({})).toBe(false);
    expect(isClickableElement({})).toBe(false);
  });

  it('checks storage availability safely without throwing', () => {
    expect(typeof isStorageAvailable('localStorage')).toBe('boolean');
    expect(typeof isStorageAvailable('sessionStorage')).toBe('boolean');
  });
});
