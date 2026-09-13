/**
 * Native EventTarget Listener Storage and Lifecycle Management.
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

export class EventBusSubscriptionManager<TData, TPopoverKey extends string = string> {
  public readonly maxListeners: number = 100;
  private readonly listenersByEvent = new Map<string, Map<unknown, EventListener>>();

  public get size(): number {
    let total = 0;
    for (const map of this.listenersByEvent.values()) total += map.size;
    return total;
  }

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

    const once = options?.once;
    const signal = options?.signal;
    const nativeOptions = options ? { capture: options.capture, passive: options.passive } : undefined;
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

  public clear(target: EventTarget): void {
    for (const [type, map] of this.listenersByEvent.entries()) {
      for (const handler of map.values()) target.removeEventListener(type, handler);
    }
    this.listenersByEvent.clear();
  }
}
