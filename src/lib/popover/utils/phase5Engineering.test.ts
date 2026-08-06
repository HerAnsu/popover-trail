import { describe, it, expect, vi } from 'vitest';
import {
  PopoverError,
  PopoverErrorCode,
  fastClone,
  createBroadcastSync,
  PopoverEventBus,
  trackMemoryCleanup,
  applyThemeTokens,
} from '../index';

describe('Phase 5 Engineering Enhancements', () => {
  it('PopoverError encapsulates error code and message correctly', () => {
    const err = new PopoverError(
      PopoverErrorCode.RESOLVER_TIMEOUT,
      'Data fetch timed out after 5000ms',
    );
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('PopoverError');
    expect(err.code).toBe(PopoverErrorCode.RESOLVER_TIMEOUT);
    expect(err.message).toContain('ERR_RESOLVER_TIMEOUT');
    expect(PopoverError.isPopoverError(err)).toBe(true);
    expect(PopoverError.isPopoverError(err, PopoverErrorCode.RESOLVER_TIMEOUT)).toBe(true);
    expect(PopoverError.isPopoverError(err, PopoverErrorCode.WORKER_CRASHED)).toBe(false);
  });

  it('fastClone performs cloning accurately with fallback', () => {
    const original = { a: 1, b: [2, 3], c: { d: 'test' } };
    const cloned = fastClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
  });

  it('createBroadcastSync creates instance and provides subscribe/broadcast API', () => {
    const sync = createBroadcastSync('test-channel');
    expect(sync.tabId).toBeDefined();
    expect(typeof sync.broadcast).toBe('function');

    const fn = vi.fn();
    const unsub = sync.subscribe(fn);
    sync.broadcast('OPEN', 'card-1');
    unsub();
    sync.destroy();
  });

  it('PopoverEventBus emits and subscribes to typed custom events', () => {
    const bus = new PopoverEventBus();
    const listener = vi.fn();

    const unsub = bus.on('popover:open', listener);
    bus.emit('popover:open', { key: 'card-1', parentKey: null });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ key: 'card-1', parentKey: null });

    unsub();
    bus.emit('popover:open', { key: 'card-2' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('trackMemoryCleanup accepts targets safely', () => {
    const obj = {};
    expect(() => trackMemoryCleanup(obj, 'key-1')).not.toThrow();
  });

  it('applyThemeTokens injects CSS Custom Properties onto DOM elements', () => {
    const props = new Map<string, string>();
    const el = {
      style: {
        setProperty: (key: string, val: string) => props.set(key, val),
        getPropertyValue: (key: string) => props.get(key) || '',
      },
    } as unknown as HTMLElement;

    applyThemeTokens(el, { baseZIndex: 2000, cascadeOffset: 32 });

    expect(el.style.getPropertyValue('--pt-base-z-index')).toBe('2000');
    expect(el.style.getPropertyValue('--pt-cascade-offset')).toBe('32px');
  });
});
