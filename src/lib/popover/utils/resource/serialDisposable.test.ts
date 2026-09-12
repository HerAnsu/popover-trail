import { describe, it, expect, vi } from 'vitest';
import { SerialDisposable } from './serialDisposable';
import { DISPOSE_SYMBOL } from './disposableTypes';

describe('SerialDisposable', () => {
  it('disposes previous item when a new item is set', () => {
    const serial = new SerialDisposable();
    const d1 = vi.fn();
    const d2 = vi.fn();

    serial.set(d1);
    expect(serial.get()).toBe(d1);
    expect(d1).not.toHaveBeenCalled();

    serial.set(d2);
    expect(d1).toHaveBeenCalledTimes(1);
    expect(d2).not.toHaveBeenCalled();
    expect(serial.get()).toBe(d2);
  });

  it('disposes current item on container disposal', () => {
    const serial = new SerialDisposable();
    const d1 = vi.fn();
    serial.set(d1);

    serial.dispose();
    expect(d1).toHaveBeenCalledTimes(1);
    expect(serial.isDisposed).toBe(true);
    expect(serial.get()).toBeNull();

    // Idempotent
    serial.dispose();
    expect(d1).toHaveBeenCalledTimes(1);
  });

  it('immediately disposes any item set after container disposal', () => {
    const serial = new SerialDisposable();
    serial.dispose();

    const d1 = vi.fn();
    serial.set(d1);
    expect(d1).toHaveBeenCalledTimes(1);
    expect(serial.get()).toBeNull();
  });

  it('supports [DISPOSE_SYMBOL]', () => {
    const serial = new SerialDisposable();
    const d1 = vi.fn();
    serial.set(d1);

    const fn = serial[DISPOSE_SYMBOL];
    if (fn) {
      fn.call(serial);
    }
    expect(d1).toHaveBeenCalledTimes(1);
    expect(serial.isDisposed).toBe(true);
  });
});
