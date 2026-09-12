import { describe, it, expect, vi } from 'vitest';
import { PopoverFSMRegistry, createPopoverFSMRegistry } from './fsmRegistry';
import { FSMStatusBit } from './fsmMatrix';

describe('PopoverFSMRegistry', () => {
  it('tracks FSM instances and bitmask statuses', () => {
    const registry = new PopoverFSMRegistry();
    const fsm = registry.getOrCreate('k1');
    expect(fsm.getState().value).toBe('Idle');
    expect(registry.getStatusBit('k1')).toBe(FSMStatusBit.Idle);

    registry.send('k1', { type: 'OPEN_ROOT', key: 'k1' });
    expect(fsm.getState().value).toBe('Hydrating');
    expect(registry.getStatusBit('k1')).toBe(FSMStatusBit.Hydrating);

    registry.destroy('k1');
    expect(registry.size).toBe(0);
    expect(registry.getStatusBit('k1')).toBe(0);
  });

  it('detects and logs illegal transitions in dev mode', () => {
    const onIllegalTransition = vi.fn();
    const registry = createPopoverFSMRegistry({ isDev: true, onIllegalTransition });

    // Idle card cannot receive RESOLVE_SUCCESS without being in Hydrating state
    registry.send('k1', { type: 'RESOLVE_SUCCESS', data: 'data' });
    expect(onIllegalTransition).toHaveBeenCalled();
  });

  it('destroys all instances on [Symbol.dispose]', () => {
    const registry = createPopoverFSMRegistry();
    registry.getOrCreate('k1');
    registry.getOrCreate('k2');
    expect(registry.size).toBe(2);

    registry[Symbol.dispose]();
    expect(registry.size).toBe(0);
  });
});
