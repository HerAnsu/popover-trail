import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from '../store';
import { QuadTree } from '../utils/quadTree';
import { ObjectPool } from '../utils/objectPool';
import { createBroadcastSync } from '../utils/broadcastSync';
import { createPopoverFSM } from './fsm';
import { getPopoverStyles } from '../utils/styles';
import { fastClone } from '../utils/clone';

describe('Store Exotic Edge-Cases & Chaos Stress Suite', () => {
  it('handles re-entrant store updates inside middleware safely', () => {
    const resolver = vi.fn(async (key: string) => ({ id: key }));
    const store = createPopoverStore(resolver);

    let reentrantCalled = false;
    store.getState().actions.useMiddleware((patch) => {
      // Re-entrant mutation triggered while applying patch
      if (patch.debug && !reentrantCalled) {
        reentrantCalled = true;
        store.getState().actions.setCascadeOffsetStep(24);
      }
      return patch;
    });

    store.getState().actions.setDebug(true);
    expect(store.getState().debug).toBe(true);
    expect(store.getState().cascadeOffsetStep).toBe(24);
  });

  it('survives chaos dragging with extreme numbers, subnormals and negative zeros', () => {
    const store = createPopoverStore(async (key) => ({ key }));
    const actions = store.getState().actions;

    actions.openRoot('root', { key: 'extreme-card' });

    // Extreme floating-point values
    actions.updateOffset('extreme-card', 0, 0);
    expect(store.getState().offsets['extreme-card']).toEqual({ x: 0, y: 0 });

    actions.updateOffset('extreme-card', Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
    expect(store.getState().offsets['extreme-card']?.x).toBe(Number.MAX_SAFE_INTEGER);
    expect(store.getState().offsets['extreme-card']?.y).toBe(Number.MIN_SAFE_INTEGER);

    actions.updateOffset('extreme-card', Number.EPSILON, 1e-300);
    expect(store.getState().offsets['extreme-card']?.x).toBe(Number.EPSILON);
    expect(store.getState().offsets['extreme-card']?.y).toBe(1e-300);

    // Style generation resilience against extreme numbers
    const styles = getPopoverStyles({
      finalLayoutPos: { top: Number.MAX_SAFE_INTEGER, left: Number.MIN_SAFE_INTEGER },
      offset: store.getState().offsets['extreme-card'],
      dragX: 0,
      dragY: 0,
      rotation: 720000,
      rotationX: -360000,
      rotationY: 180000,
      zIndex: 999999999,
    });

    expect(styles.position).toBe('absolute');
    expect(typeof styles.transform).toBe('string');
  });

  it('resists deep cascading DAG tree with 100 nested popovers and unmounts cleanly', () => {
    const store = createPopoverStore(async (key) => ({ key }));
    const actions = store.getState().actions;

    actions.openRoot('owner-1', { key: 'node-0', isLoading: false, error: null });

    for (let i = 1; i <= 100; i++) {
      actions.pushNested(i - 1, { key: `node-${i}`, isLoading: false, error: null });
    }

    expect(store.getState().trail.length).toBe(101);
    expect(store.getState().trail[100]?.key).toBe('node-100');

    // Close from middle node (node-50)
    actions.closeByKey('node-50');
    expect(store.getState().trail.length).toBe(50);
    expect(store.getState().trail[49]?.key).toBe('node-49');

    // Close remaining from root
    actions.closeAll();
    expect(store.getState().trail.length).toBe(0);
    expect(store.getState().ownerId).toBeNull();
  });

  it('handles subscribers throwing non-Error primitive exceptions without halting notification loop', () => {
    const store = createPopoverStore(async (k) => ({ k }));
    const received: string[] = [];

    // Listener 1 throws a string
    store.getState().actions.subscribeEvent(() => {
      throw 'string exception';
    });

    // Listener 2 throws null
    store.getState().actions.subscribeEvent(() => {
      throw null;
    });

    // Listener 3 throws circular object
    store.getState().actions.subscribeEvent(() => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      throw circular;
    });

    // Listener 4 succeeds
    store.getState().actions.subscribeEvent((event) => {
      received.push(event.type);
    });

    store.getState().actions.openRoot('owner', { key: 'card-1' });
    expect(received).toContain('open_root');
  });

  it('executes deeply nested re-entrant batchUpdates with inner errors and outer success', () => {
    const store = createPopoverStore(async (k) => ({ k }));
    const actions = store.getState().actions;

    const subscriber = vi.fn();
    store.subscribe(subscriber);

    actions.batchUpdates(() => {
      actions.setDebug(true);

      actions.batchUpdates(() => {
        actions.setCascadeOffsetStep(32);

        expect(() => {
          actions.batchUpdates(() => {
            actions.setDefaultOffset(64);
            throw new Error('Inner batch boom');
          });
        }).toThrow('Inner batch boom');
      });

      actions.setAllowDragWhenPinned(false);
    });

    const state = store.getState();
    expect(state.debug).toBe(true);
    expect(state.cascadeOffsetStep).toBe(32);
    expect(state.defaultOffset).toBe(64);
    expect(state.allowDragWhenPinned).toBe(false);
  });

  it('stress tests rapid time-travel history undo and redo with interleaved mutations', () => {
    const store = createPopoverStore(async (k) => ({ k }));
    const actions = store.getState().actions;

    actions.openRoot('owner', { key: 'c0', isLoading: false, error: null });

    for (let i = 1; i <= 20; i++) {
      actions.pushNested(i - 1, { key: `c${i}`, isLoading: false, error: null });
      if (i % 3 === 0) {
        actions.togglePin(`c${i}`);
      }
    }

    const totalActive = store.getState().trail.length + store.getState().floating.length;
    expect(totalActive).toBe(21);

    // Rapidly undo 10 times
    for (let i = 0; i < 10; i++) {
      if (actions.canUndo()) {
        actions.undo();
      }
    }

    const midCount = store.getState().trail.length + store.getState().floating.length;
    expect(midCount).toBeLessThan(21);

    // Rapidly redo 5 times
    for (let i = 0; i < 5; i++) {
      if (actions.canRedo()) {
        actions.redo();
      }
    }

    const redoCount = store.getState().trail.length + store.getState().floating.length;
    expect(redoCount).toBeGreaterThan(midCount);
  });

  it('survives rapid multi-tab broadcast sync packet storm with conflicting states', () => {
    const channelName = `sync-storm-${Math.random()}`;
    const syncA = createBroadcastSync(channelName);
    const syncB = createBroadcastSync(channelName);

    const messagesReceivedB: unknown[] = [];
    syncB.subscribe((msg) => messagesReceivedB.push(msg));

    // Send 50 rapid conflicting broadcast messages
    for (let i = 0; i < 50; i++) {
      syncA.broadcast(i % 2 === 0 ? 'OPEN' : 'PIN', `k-${i}`);
    }

    syncA.dispose();
    syncB.dispose();
  });

  it('QuadTree handles extreme boundary items, exact edge overlaps, and zero-dimension points', () => {
    const bounds = { x: 0, y: 0, width: 1000, height: 1000 };
    const qt = new QuadTree(bounds);

    // Insert zero-dimension point items
    for (let i = 0; i < 50; i++) {
      qt.insert({
        id: `point-${i}`,
        bounds: { x: i * 10, y: i * 10, width: 0, height: 0 },
      });
    }

    // Insert items on the exact boundary lines
    qt.insert({ id: 'edge-1', bounds: { x: 0, y: 0, width: 1000, height: 0 } });
    qt.insert({ id: 'edge-2', bounds: { x: 0, y: 0, width: 0, height: 1000 } });

    const results = qt.retrieve([], { x: 0, y: 0, width: 100, height: 100 });
    expect(results.length).toBeGreaterThan(0);

    qt.clear();
    expect(qt.retrieve([], bounds).length).toBe(0);
    qt.dispose();
  });

  it('ObjectPool handles high-frequency acquire and release cycles without memory leak', () => {
    const pool = new ObjectPool<{ x: number; y: number }>(
      () => ({ x: 0, y: 0 }),
      (obj) => {
        obj.x = 0;
        obj.y = 0;
      },
      0,
      100,
    );

    const items: { x: number; y: number }[] = [];

    // High frequency acquire
    for (let i = 0; i < 200; i++) {
      const item = pool.acquire();
      item.x = i;
      item.y = i * 2;
      items.push(item);
    }

    // High frequency release
    for (const item of items) {
      pool.release(item);
    }

    expect(pool.size).toBe(100); // capped at max 100
    pool.clear();
    expect(pool.size).toBe(0);
  });

  it('FSM handles non-existent event types and transitions gracefully', () => {
    const fsm = createPopoverFSM('test-card');
    expect(fsm.getState().value).toBe('Idle');

    // @ts-expect-error Dispatching unknown event
    const res = fsm.send({ type: 'UNKNOWN_CHAOS_EVENT' });
    expect(res.value).toBe('Idle');

    // Transitions from idle to hydrating
    fsm.send({ type: 'OPEN_ROOT', key: 'test-card' });
    expect(fsm.getState().value).toBe('Hydrating');

    fsm.send({ type: 'RESOLVE_SUCCESS', data: { hello: 'world' } });
    expect(fsm.getState().value).toBe('Resolved.Trailing');

    fsm.send({ type: 'TOGGLE_PIN' });
    expect(fsm.getState().value).toBe('Resolved.Pinned');

    fsm.send({ type: 'TOGGLE_PIN' });
    expect(fsm.getState().value).toBe('Resolved.Trailing');

    fsm.send({ type: 'CLOSE' });
    expect(fsm.getState().value).toBe('Unmounting');

    fsm.send({ type: 'TRANSITION_END' });
    expect(fsm.getState().value).toBe('Idle');
  });

  it('fastClone clones complex circular-like deeply nested graphs safely', () => {
    const graph: Record<string, unknown> = {
      level1: {
        level2: {
          level3: {
            arr: [1, 2, { date: new Date(1700000000000), regex: /abc/g }],
            map: new Map([['key', new Set(['a', 'b'])]]),
          },
        },
      },
    };

    const cloned = fastClone(graph);
    expect(cloned).toEqual(graph);
    expect(cloned).not.toBe(graph);
  });
});
