import { describe, it, expect, vi } from 'vitest';
import { PopoverQueryBus, PopoverCommandBus, createCQRSBuses } from './cqrs';
import { PopoverStore, TrailEntry } from '../types';

describe('cqrs module', () => {
  const createMockStoreState = () => ({
    ownerId: 'owner-1',
    context: { env: 'test' },
    floating: [{ key: 'pinned-1' }] as TrailEntry<unknown>[],
    trail: [{ key: 'root-1' }] as TrailEntry<unknown>[],
    pinnedStates: { 'pinned-1': true },
    offsets: { 'pinned-1': { x: 15, y: 30 } },
    actions: {
      closeByKey: vi.fn(),
      closeAll: vi.fn(),
      togglePin: vi.fn(),
      bringToFront: vi.fn(),
      updateOffset: vi.fn(),
    },
  });

  it('queries store state via PopoverQueryBus without side effects', () => {
    const mockState = createMockStoreState();
    const queryBus = new PopoverQueryBus(() => mockState as unknown as PopoverStore);

    expect(queryBus.ownerId).toBe('owner-1');
    expect(queryBus.context).toEqual({ env: 'test' });
    expect(queryBus.trail).toHaveLength(1);
    expect(queryBus.floating).toHaveLength(1);
    expect(queryBus.getEntry('root-1')?.key).toBe('root-1');
    expect(queryBus.isPinned('pinned-1')).toBe(true);
    expect(queryBus.getOffset('pinned-1')).toEqual({ x: 15, y: 30 });
    expect(queryBus.getOffset('unknown')).toEqual({ x: 0, y: 0 });
  });

  it('dispatches commands via PopoverCommandBus', () => {
    const mockState = createMockStoreState();
    const commandBus = new PopoverCommandBus(
      mockState.actions as unknown as PopoverStore['actions'],
    );

    commandBus.close('root-1');
    expect(mockState.actions.closeByKey).toHaveBeenCalledWith('root-1');

    commandBus.clearAll();
    expect(mockState.actions.closeAll).toHaveBeenCalled();

    commandBus.togglePin('pinned-1');
    expect(mockState.actions.togglePin).toHaveBeenCalledWith('pinned-1', undefined);

    commandBus.bringToFront('pinned-1');
    expect(mockState.actions.bringToFront).toHaveBeenCalledWith('pinned-1');

    commandBus.updateOffset('pinned-1', 50, 100);
    expect(mockState.actions.updateOffset).toHaveBeenCalledWith('pinned-1', 50, 100);
  });

  it('creates queryBus and commandBus via createCQRSBuses factory', () => {
    const mockState = createMockStoreState();
    const buses = createCQRSBuses(mockState as unknown as PopoverStore);

    expect(buses.queryBus).toBeInstanceOf(PopoverQueryBus);
    expect(buses.commandBus).toBeInstanceOf(PopoverCommandBus);
  });

  it('queries trail and floating entries via queryBus', () => {
    const mockState = createMockStoreState();
    const queryBus = new PopoverQueryBus(() => mockState as unknown as PopoverStore);

    expect(queryBus.trail).toHaveLength(1);
    expect(queryBus.floating).toHaveLength(1);
    expect(queryBus.getEntry('pinned-1')?.key).toBe('pinned-1');
    expect(queryBus.getEntry('missing-key')).toBeUndefined();
  });
});
