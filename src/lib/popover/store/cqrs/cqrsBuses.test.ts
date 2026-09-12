import { describe, it, expect, vi } from 'vitest';
import { PopoverCommandBus, PopoverQueryBus, createCQRSBuses } from './cqrs';
import type { PopoverActions, TrailEntry } from '../../types';
import { createMockStoreState } from '../../testing/createMockStoreState';
import { createPopoverStore } from '../../store';

function createMockCommandActions(): PopoverActions<unknown, unknown, string> {
  const noop = vi.fn();
  const asyncNoop = vi.fn(async () => {});
  const actions: Partial<PopoverActions<unknown, unknown, string>> = {
    openRoot: noop,
    pushNested: noop,
    openRootWithResolver: asyncNoop,
    openNestedWithResolver: asyncNoop,
    closeByKey: noop,
    closeTopmost: noop,
    clearTrail: noop,
    closeAll: noop,
    clear: noop,
    togglePin: noop,
    bringToFront: noop,
    updateOffset: noop,
    retryPopover: asyncNoop,
    prefetchPopover: vi.fn(async () => undefined),
    updateConfig: noop,
    undo: noop,
    redo: noop,
    batchUpdates: vi.fn((fn: (act: PopoverActions<unknown, unknown, string>) => void) =>
      fn(actions as PopoverActions<unknown, unknown, string>),
    ),
    destroy: noop,
  };
  return actions as PopoverActions<unknown, unknown, string>;
}

describe('CQRS buses module', () => {
  it('strictly separates command side mutation from query side evaluation', () => {
    const mockActions = createMockCommandActions();
    const mockState = createMockStoreState<string, unknown, string>({
      ownerId: 'cqrs-user',
      trail: [
        { key: 'root-card', isLoading: false, error: null, data: 'alpha' },
        { key: 'child-card', parentKey: 'root-card', isLoading: false, error: null, data: 'beta' },
      ],
      offsets: { 'root-card': { x: 12, y: 34 } },
      pinnedStates: { 'root-card': true },
      zIndexOrder: ['root-card', 'child-card'],
    });

    const commandBus = new PopoverCommandBus(mockActions);
    const queryBus = new PopoverQueryBus(() => mockState);

    // Command side triggers actions without exposing state reads
    const newEntry: TrailEntry<unknown, string> = { key: 'new-entry', isLoading: false, error: null };
    commandBus.openRoot('owner-2', newEntry);
    expect(mockActions.openRoot).toHaveBeenCalledWith('owner-2', newEntry);

    commandBus.updateOffset('root-card', 50, 75);
    expect(mockActions.updateOffset).toHaveBeenCalledWith('root-card', 50, 75);

    // Query side evaluates projections without modifying state
    expect(queryBus.ownerId).toBe('cqrs-user');
    expect(queryBus.isOpen('root-card')).toBe(true);
    expect(queryBus.isPinned('root-card')).toBe(true);
    expect(queryBus.getOffset('root-card')).toEqual({ x: 12, y: 34 });
    expect(queryBus.getParent('child-card')).toBe('root-card');
    expect(queryBus.getChildren('root-card')).toEqual(['child-card']);
    expect(queryBus.getBreadcrumbs('child-card')).toEqual(['root-card', 'child-card']);
    expect(queryBus.topmost?.key).toBe('child-card');
  });

  it('resolves command target across raw actions, store objects, and getter functions', () => {
    const actionsA = createMockCommandActions();
    const busA = new PopoverCommandBus(actionsA);
    busA.closeTopmost();
    expect(actionsA.closeTopmost).toHaveBeenCalledTimes(1);

    const actionsB = createMockCommandActions();
    const busB = new PopoverCommandBus({ actions: actionsB });
    busB.clearTrail();
    expect(actionsB.clearTrail).toHaveBeenCalledTimes(1);

    const actionsC = createMockCommandActions();
    const busC = new PopoverCommandBus(() => ({ actions: actionsC }));
    busC.undo();
    expect(actionsC.undo).toHaveBeenCalledTimes(1);
  });

  it('coordinates command and query buses via createCQRSBuses factory', () => {
    const store = createPopoverStore(async () => ({}));
    const buses = createCQRSBuses(store);

    expect(buses.query).toBeInstanceOf(PopoverQueryBus);
    expect(buses.command).toBeInstanceOf(PopoverCommandBus);
    expect(buses.queryBus).toBe(buses.query);
    expect(buses.commandBus).toBe(buses.command);

    expect(buses.query.isIdle).toBe(true);

    buses.command.openRoot('owner-1', { key: 'pin-test', isLoading: false, error: null });
    expect(buses.query.isOpen('pin-test')).toBe(true);

    buses.command.togglePin('pin-test');
    expect(buses.query.isPinned('pin-test')).toBe(true);

    // Monadic query operations
    const entryRes = buses.query.getEntryResult('pin-test');
    expect(entryRes.success).toBe(true);
    if (entryRes.success) {
      expect(entryRes.data.key).toBe('pin-test');
    }

    const missingRes = buses.query.getEntryResult('non-existent');
    expect(missingRes.success).toBe(false);
    if (!missingRes.success) {
      expect(missingRes.error.type).toBe('popover_not_found');
      expect(missingRes.error.key).toBe('non-existent');
    }

    // Monadic batch operations
    const batchRes = buses.command.batchResult((cmd) => {
      cmd.bringToFront('pin-test');
      return { success: true as const, data: 42 };
    });
    expect(batchRes.success).toBe(true);
    if (batchRes.success) {
      expect(batchRes.data).toBe(42);
    }

    expect(() => buses.dispose()).not.toThrow();
  });
});
