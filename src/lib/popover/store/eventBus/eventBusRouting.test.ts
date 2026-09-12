import { describe, it, expect, vi } from 'vitest';
import { EventBusRouter } from './eventBusRouter';
import { EventBusSubscriptionManager } from './eventBusSubscriptionManager';
import { createPopoverEvent } from './eventBusTypes';

describe('eventBusRouting module', () => {
  describe('EventBusRouter', () => {
    it('routes wildcard events to subscribeAny listeners and cleans up on unsubscription', () => {
      const router = new EventBusRouter<unknown, string>();
      const wildcardListener = vi.fn();

      const token = router.subscribeAny(wildcardListener);
      expect(router.wildcardListeners.size).toBe(1);

      const event = createPopoverEvent('popover:open', { key: 'card-1' });
      router.dispatchWildcards(event);
      expect(wildcardListener).toHaveBeenCalledWith(event);

      token();
      expect(router.wildcardListeners.size).toBe(0);

      router.dispatchWildcards(event);
      expect(wildcardListener).toHaveBeenCalledTimes(1);
    });

    it('routes targeted events by single key and key arrays with automatic key cleanup', () => {
      const router = new EventBusRouter<unknown, string>();
      const keyListenerA = vi.fn();
      const keyListenerB = vi.fn();

      const unsubA = router.subscribeKey('card-A', keyListenerA);
      const unsubB = router.subscribeKey('card-B', keyListenerB);

      const openA = createPopoverEvent('popover:open', { key: 'card-A' });
      router.dispatchKeys(openA, openA.detail);
      expect(keyListenerA).toHaveBeenCalledWith(openA);
      expect(keyListenerB).not.toHaveBeenCalled();

      const batchClose = createPopoverEvent('popover:batch_close', { keys: ['card-A', 'card-B'] });
      router.dispatchKeys(batchClose, batchClose.detail);
      expect(keyListenerA).toHaveBeenCalledTimes(2);
      expect(keyListenerB).toHaveBeenCalledTimes(1);

      unsubA();
      expect(router.listenersByKey.has('card-A')).toBe(false);
      expect(router.listenersByKey.has('card-B')).toBe(true);

      unsubB();
      expect(router.listenersByKey.has('card-B')).toBe(false);

      router.clear();
      expect(router.listenersByKey.size).toBe(0);
      expect(router.wildcardListeners.size).toBe(0);
    });
  });

  describe('EventBusSubscriptionManager', () => {
    it('manages EventTarget listeners, deduplicates registrations, and handles unsubscription', () => {
      const target = new EventTarget();
      const manager = new EventBusSubscriptionManager<unknown, string>();
      const listener = vi.fn();

      const token1 = manager.subscribe(target, 'popover:open', listener);
      expect(manager.size).toBe(1);

      // Re-subscribing same listener replaces previous registration without leaking
      const token2 = manager.subscribe(target, 'popover:open', listener);
      expect(manager.size).toBe(1);

      const event = createPopoverEvent('popover:open', { key: 'card-1' });
      target.dispatchEvent(event);
      expect(listener).toHaveBeenCalledTimes(1);

      token2();
      expect(manager.size).toBe(0);
      target.dispatchEvent(event);
      expect(listener).toHaveBeenCalledTimes(1);

      token1(); // Safe redundant call
    });

    it('supports once options and AbortSignal lifecycle cleanup', () => {
      const target = new EventTarget();
      const manager = new EventBusSubscriptionManager<unknown, string>();
      const onceListener = vi.fn();
      const signalListener = vi.fn();

      manager.subscribe(target, 'popover:pin', onceListener, { once: true });
      expect(manager.size).toBe(1);

      const pinEvent = createPopoverEvent('popover:pin', { key: 'card-pin' });
      target.dispatchEvent(pinEvent);
      expect(onceListener).toHaveBeenCalledTimes(1);
      expect(manager.size).toBe(0);

      const controller = new AbortController();
      manager.subscribe(target, 'popover:unpin', signalListener, { signal: controller.signal });
      expect(manager.size).toBe(1);

      controller.abort();
      expect(manager.size).toBe(0);

      const unpinEvent = createPopoverEvent('popover:unpin', { key: 'card-pin' });
      target.dispatchEvent(unpinEvent);
      expect(signalListener).not.toHaveBeenCalled();
    });

    it('clears all registered listeners across event types', () => {
      const target = new EventTarget();
      const manager = new EventBusSubscriptionManager<unknown, string>();
      const l1 = vi.fn();
      const l2 = vi.fn();

      manager.subscribe(target, 'popover:open', l1);
      manager.subscribe(target, 'popover:pin', l2);
      expect(manager.size).toBe(2);

      manager.clear(target);
      expect(manager.size).toBe(0);

      target.dispatchEvent(createPopoverEvent('popover:open', { key: 'c1' }));
      target.dispatchEvent(createPopoverEvent('popover:pin', { key: 'c1' }));
      expect(l1).not.toHaveBeenCalled();
      expect(l2).not.toHaveBeenCalled();
    });
  });
});
