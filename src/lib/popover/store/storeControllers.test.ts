import { describe, it, expect } from 'vitest';
import { createControllerManager } from './storeControllers';

describe('storeControllers module', () => {
  it('registers and aborts previous AbortController for key', () => {
    const manager = createControllerManager();

    const c1 = manager.registerController('card-1');
    expect(c1.signal.aborted).toBe(false);

    const c2 = manager.registerController('card-1');
    expect(c1.signal.aborted).toBe(true);
    expect(c2.signal.aborted).toBe(false);
  });

  it('aborts controllers for a set of keys', () => {
    const manager = createControllerManager();
    const c1 = manager.registerController('k1');
    const c2 = manager.registerController('k2');

    manager.abortControllersForKeys(['k1']);
    expect(c1.signal.aborted).toBe(true);
    expect(c2.signal.aborted).toBe(false);
  });

  it('aborts all registered controllers', () => {
    const manager = createControllerManager();
    const c1 = manager.registerController('k1');
    const c2 = manager.registerController('k2');

    manager.abortAllControllers();
    expect(c1.signal.aborted).toBe(true);
    expect(c2.signal.aborted).toBe(true);
    expect(manager.activeControllers.size).toBe(0);
  });
});
