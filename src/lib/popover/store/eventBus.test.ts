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

    bus.emit('popover:close', { key: 'card-1' });
    bus.emit('popover:close', { key: 'card-1' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('correctly identifies PopoverCustomEvent instance via isPopoverCustomEvent guard', () => {
    const ev = new PopoverCustomEvent('popover:pin', { key: 'card-1' });

    expect(isPopoverCustomEvent(ev)).toBe(true);
    expect(isPopoverCustomEvent(ev, 'popover:pin')).toBe(true);
    expect(isPopoverCustomEvent(ev, 'popover:unpin')).toBe(false);
    expect(isPopoverCustomEvent(new Event('custom'))).toBe(false);
  });
});
