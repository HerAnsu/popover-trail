/**
 * Native EventTarget Listener Storage and Lifecycle Management.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module eventBusSubscriptionManager
 */

import { safeCallback } from '../../utils/safeCallback';
import {
  type PopoverEventType,
  type PopoverEventListener,
  type PopoverSubscriptionToken,
  createSubscriptionToken,
  isPopoverCustomEvent,
} from './eventBusTypes';

/**
 * Manages native `EventTarget` listeners and wraps them into typed subscription tokens.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 *
 * @example
 * ```typescript
 * const manager = new EventBusSubscriptionManager();
 * const token = manager.subscribe(target, 'popover:pin', (e) => {
 *   console.log(e.detail.key);
 * });
 * token(); // Unsubscribes
 * ```
 */
export class EventBusSubscriptionManager<TData, TPopoverKey extends string = string> {
  /** Maximum listener capacity threshold before warning. */
  public readonly maxListeners: number = 100;
  private readonly listenersByEvent = new Map<string, Map<unknown, EventListener>>();

  /**
   * Total number of active registered event listeners.
   */
  public get size(): number {
    let total = 0;
    for (const map of this.listenersByEvent.values()) total += map.size;
    return total;
  }

  /**
   * Subscribes a typed listener to an event type on a target EventTarget.
   *
   * @template K - Specific event type name.
   * @param target - Target DOM EventTarget.
   * @param type - Event type name.
   * @param listener - Callback function receiving the custom event.
   * @param options - Standard AddEventListenerOptions (e.g. `once`, `signal`, `capture`, `passive`).
   * @returns Subscription token implementing callable unsubscribe and `[Symbol.dispose]`.
   *
   * @example
   * ```typescript
   * const token = manager.subscribe(target, 'popover:open_root', listener, { once: true });
   * ```
   */
  public subscribe<K extends PopoverEventType>(
    target: EventTarget,
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    options?: AddEventListenerOptions,
  ): PopoverSubscriptionToken {
    let subscribers = this.listenersByEvent.get(type);
    if (!subscribers) {
      subscribers = new Map();
      this.listenersByEvent.set(type, subscribers);
    }

    const existing = subscribers.get(listener);
    if (existing) target.removeEventListener(type, existing);

    const { once, signal, capture, passive } = options ?? {};
    const nativeOptions = options ? { capture, passive } : undefined;
    const handler: EventListener = (e: Event) => {
      if (!isPopoverCustomEvent<K, TData, TPopoverKey>(e, type)) return;
      if (once) this.unsubscribe(target, type, listener, options);
      safeCallback(listener, [e], { contextName: `EventBus:${type}` });
    };

    subscribers.set(listener, handler);
    target.addEventListener(type, handler, nativeOptions);

    if (signal) {
      signal.addEventListener('abort', () => this.unsubscribe(target, type, listener, options), {
        once: true,
      });
    }

    // return () => unsubscribe handle
    return createSubscriptionToken(() => this.unsubscribe(target, type, listener, options));
  }

  /**
   * Unsubscribes a listener from the given event type.
   *
   * @template K - Event type name.
   * @param target - Target DOM EventTarget.
   * @param type - Event type name.
   * @param listener - Callback function to remove.
   * @param options - Standard EventListenerOptions.
   */
  public unsubscribe<K extends PopoverEventType>(
    target: EventTarget,
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    options?: EventListenerOptions,
  ): void {
    const subscribers = this.listenersByEvent.get(type);
    if (!subscribers) return;
    const handler = subscribers.get(listener);
    if (handler) {
      target.removeEventListener(type, handler, options);
      subscribers.delete(listener);
      if (subscribers.size === 0) this.listenersByEvent.delete(type);
    }
  }

  /**
   * Clears all registered event listeners from the target EventTarget.
   *
   * @param target - Target DOM EventTarget to detach from.
   */
  public clear(target: EventTarget): void {
    for (const [type, map] of this.listenersByEvent.entries()) {
      for (const handler of map.values()) target.removeEventListener(type, handler);
    }
    this.listenersByEvent.clear();
  }
}
