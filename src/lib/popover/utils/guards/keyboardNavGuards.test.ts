import { describe, it, expect } from 'vitest';
import {
  isArrowUpKey,
  isArrowDownKey,
  isArrowLeftKey,
  isArrowRightKey,
  isVerticalArrowKey,
  isHorizontalArrowKey,
  isHomeKey,
  isEndKey,
} from './keyboardNavGuards';

describe('keyboardNavGuards', () => {
  it('identifies directional arrow keys', () => {
    expect(isArrowUpKey({ key: 'ArrowUp' })).toBe(true);
    expect(isArrowUpKey({ key: 'ArrowDown' })).toBe(false);

    expect(isArrowDownKey({ key: 'ArrowDown' })).toBe(true);
    expect(isArrowDownKey({ key: 'ArrowUp' })).toBe(false);

    expect(isArrowLeftKey({ key: 'ArrowLeft' })).toBe(true);
    expect(isArrowLeftKey({ key: 'ArrowRight' })).toBe(false);

    expect(isArrowRightKey({ key: 'ArrowRight' })).toBe(true);
    expect(isArrowRightKey({ key: 'ArrowLeft' })).toBe(false);
  });

  it('identifies vertical and horizontal compound arrows', () => {
    expect(isVerticalArrowKey({ key: 'ArrowUp' })).toBe(true);
    expect(isVerticalArrowKey({ key: 'ArrowDown' })).toBe(true);
    expect(isVerticalArrowKey({ key: 'ArrowLeft' })).toBe(false);

    expect(isHorizontalArrowKey({ key: 'ArrowLeft' })).toBe(true);
    expect(isHorizontalArrowKey({ key: 'ArrowRight' })).toBe(true);
    expect(isHorizontalArrowKey({ key: 'ArrowUp' })).toBe(false);
  });

  it('identifies Home and End keys', () => {
    expect(isHomeKey({ key: 'Home' })).toBe(true);
    expect(isHomeKey({ key: 'End' })).toBe(false);

    expect(isEndKey({ key: 'End' })).toBe(true);
    expect(isEndKey({ key: 'Home' })).toBe(false);
  });
});
