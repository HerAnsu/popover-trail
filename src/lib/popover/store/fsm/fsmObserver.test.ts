import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from '../core/storeFactory';
import { createPopoverFSMRegistry } from './fsmRegistry';
import { bindFSMRegistryToEventBus } from './fsmObserver';
import { PopoverEventBus } from '../eventBus';

describe('FSM Shadow Watchdog Observer', () => {
  it('synchronously transitions card FSM machine upon store events', async () => {
    const store = createPopoverStore<string, unknown, string>(async () => 'resolved data');

    await store.getState().openRootWithResolver('card-1');
    const fsmA = store.getFSM('card-1');
    expect(fsmA?.getState().value).toBe('Resolved.Trailing');

    // Pin card
    store.getState().togglePin('card-1');
    expect(fsmA?.getState().value).toBe('Resolved.Pinned');

    // Close card
    store.getState().closeByKey('card-1');
    expect(fsmA?.getState().value).toBe('Unmounting');

    // Transition end
    fsmA?.send({ type: 'TRANSITION_END' });
    expect(fsmA?.getState().value).toBe('Idle');

    store.dispose();
    expect(store.fsmRegistry.size).toBe(0);
  });

  it('triggers onIllegalTransition watchdog on out-of-order event', () => {
    const onIllegal = vi.fn();
    const eventBus = new PopoverEventBus<string, string>();
    const registry = createPopoverFSMRegistry<string, string>({
      isDev: true,
      onIllegalTransition: onIllegal,
    });

    const unbind = bindFSMRegistryToEventBus(registry, eventBus);

    // Initial state is Idle
    const cardFsm = registry.getOrCreate('card-x');
    expect(cardFsm.getState().value).toBe('Idle');

    // Illegal: resolve_success directly from Idle
    eventBus.emit('popover:resolve_success', { key: 'card-x', data: 'data' });
    expect(onIllegal).toHaveBeenCalledWith(
      'card-x',
      'Idle',
      expect.objectContaining({ type: 'RESOLVE_SUCCESS' }),
    );

    unbind();
    registry.destroyAll();
  });
});
