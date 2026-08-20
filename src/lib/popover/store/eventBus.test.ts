import { describe, it, expect, vi } from 'vitest';
import { PopoverEventBus, PopoverCustomEvent, isPopoverCustomEvent } from './eventBus';

describe('eventBus module', () => {
  it('emits events and receives payload in listener', () => {
    const bus = new PopoverEventBus<{ title: string }>();
    const listener = vi.fn();

    const unsub = bus.on('popover:open', listener);

    bus.emit('popover:open', { key: 'card-1', parentKey: null });

    expect(listener).toHaveBeenCalledTimes(1);
    const eventArg = listener.mock.calls[0]?.[0];
    expect(eventArg?.detail).toEqual({ key: 'card-1', parentKey: null });

    unsub();
    bus.emit('popover:open', { key: 'card-2' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('triggers once listener only once', () => {
    const bus = new PopoverEventBus();
    const listener = vi.fn();

    bus.once('popover:close', listener);

    bus.emit('popover:close', { keys: ['card-1'], key: 'card-1' });
    bus.emit('popover:close', { keys: ['card-1'], key: 'card-1' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('correctly identifies PopoverCustomEvent instance via isPopoverCustomEvent guard', () => {
    const ev = new PopoverCustomEvent('popover:pin', { key: 'card-1' });

    expect(isPopoverCustomEvent(ev)).toBe(true);
    expect(isPopoverCustomEvent(ev, 'popover:pin')).toBe(true);
    expect(isPopoverCustomEvent(ev, 'popover:unpin')).toBe(false);
    expect(isPopoverCustomEvent(new Event('custom'))).toBe(false);
  });

  it('unsubscribes listeners returned from on() and once()', () => {
    const bus = new PopoverEventBus();
    const l1 = vi.fn();
    const l2 = vi.fn();

    const unsub1 = bus.on('popover:open', l1);
    const unsub2 = bus.once('popover:close', l2);

    unsub1();
    unsub2();

    bus.emit('popover:open', { key: 'c1' });
    bus.emit('popover:close', { keys: ['c2'], key: 'c2' });

    expect(l1).not.toHaveBeenCalled();
    expect(l2).not.toHaveBeenCalled();
  });

  it('tracks subscription size and supports clear/dispose', () => {
    const bus = new PopoverEventBus();
    expect(bus.size).toBe(0);

    bus.on('popover:open', () => {});
    expect(bus.size).toBe(1);

    bus.clear();
    expect(bus.size).toBe(0);

    bus.on('popover:pin', () => {});
    bus.dispose();
    expect(bus.size).toBe(0);
  });
});
