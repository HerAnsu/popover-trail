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

  it('safely handles in-flight promises and null keys', () => {
    const manager = createControllerManager<string>();
    const promise = Promise.resolve('test');
    manager.setInFlight('k1', promise);
    expect(manager.hasInFlight('k1')).toBe(true);
    expect(manager.getInFlight('k1')).toBe(promise);

    manager.removeInFlight('k1');
    expect(manager.hasInFlight('k1')).toBe(false);

    // Null safety check
    expect(() => manager.abortControllersForKeys(null as never)).not.toThrow();
  });
});
