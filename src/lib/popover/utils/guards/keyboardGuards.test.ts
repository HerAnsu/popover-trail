import { describe, it, expect } from 'vitest';
import { KNOWN_KEYBOARD_KEYS } from '../../types';
import {
  isKeyIdentifiable,
  isKeyboardEvent,
  isKey,
  isEscapeKey,
  isTabKey,
  isEnterKey,
  isSpaceKey,
  isActivationKey,
  isArrowUpKey,
  isArrowDownKey,
  isArrowLeftKey,
  isArrowRightKey,
  isVerticalArrowKey,
  isHorizontalArrowKey,
  isHomeKey,
  isEndKey,
  hasModifierKey,
} from './keyboardGuards';

describe('keyboardGuards', () => {
  it('identifies key identifiable objects and keyboard events', () => {
    expect(isKeyIdentifiable({ key: 'Enter' })).toBe(true);
    expect(isKeyIdentifiable({ other: 1 })).toBe(false);
    expect(isKeyIdentifiable(null)).toBe(false);

    expect(isKeyboardEvent({ key: 'Enter', preventDefault: () => {} })).toBe(true);
    expect(isKeyboardEvent({ key: 'Enter' })).toBe(false);

    expect(isKey({ key: 'Escape' }, 'Escape')).toBe(true);
    expect(isKey({ key: 'Enter' }, 'Escape')).toBe(false);
  });

  it('identifies navigation and activation keys', () => {
    expect(isEscapeKey({ key: 'Escape' })).toBe(true);
    expect(isTabKey({ key: 'Tab' })).toBe(true);
    expect(isEnterKey({ key: 'Enter' })).toBe(true);
    expect(isSpaceKey({ key: ' ' })).toBe(true);
    expect(isSpaceKey({ key: 'Spacebar' })).toBe(true);

    expect(isActivationKey({ key: 'Enter' })).toBe(true);
    expect(isActivationKey({ key: ' ' })).toBe(true);
    expect(isActivationKey({ key: 'ArrowDown' })).toBe(false);

    expect(isArrowUpKey({ key: 'ArrowUp' })).toBe(true);
    expect(isArrowDownKey({ key: 'ArrowDown' })).toBe(true);
    expect(isArrowLeftKey({ key: 'ArrowLeft' })).toBe(true);
    expect(isArrowRightKey({ key: 'ArrowRight' })).toBe(true);

    expect(isVerticalArrowKey({ key: 'ArrowUp' })).toBe(true);
    expect(isVerticalArrowKey({ key: 'ArrowDown' })).toBe(true);
    expect(isHorizontalArrowKey({ key: 'ArrowLeft' })).toBe(true);
    expect(isHorizontalArrowKey({ key: 'ArrowRight' })).toBe(true);

    expect(isHomeKey({ key: 'Home' })).toBe(true);
    expect(isEndKey({ key: 'End' })).toBe(true);
  });

  it('detects modifier keys correctly', () => {
    expect(hasModifierKey({ metaKey: true })).toBe(true);
    expect(hasModifierKey({ ctrlKey: true })).toBe(true);
    expect(hasModifierKey({ altKey: true })).toBe(true);
    expect(hasModifierKey({ shiftKey: true })).toBe(true);
    expect(hasModifierKey({})).toBe(false);
  });

  it('exports KNOWN_KEYBOARD_KEYS containing standard navigation and activation keys', () => {
    expect(KNOWN_KEYBOARD_KEYS).toContain('Escape');
    expect(KNOWN_KEYBOARD_KEYS).toContain('Enter');
    expect(KNOWN_KEYBOARD_KEYS).toContain('ArrowUp');
    expect(KNOWN_KEYBOARD_KEYS).toContain('ArrowDown');
    expect(KNOWN_KEYBOARD_KEYS).toContain('Tab');
    expect(KNOWN_KEYBOARD_KEYS).toContain('Space');
    expect(KNOWN_KEYBOARD_KEYS).toHaveLength(12);
  });
});
