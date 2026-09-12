/**
 * Routing and Multi-Channel Listener Management for PopoverEventBus.
 *
 * @module eventBusRouter
 */

import { safeCallback } from '../../utils/safeCallback';
import { isArray } from '../../utils/guards/arrayGuards';
import {
  type PopoverEventType,
  type PopoverCustomEvent,
  type PopoverWildcardListener,
  type PopoverSubscriptionToken,
  createSubscriptionToken,
} from './eventBusTypes';

interface EventDetailWithKey<TPopoverKey> {
  key?: TPopoverKey;
  keys?: readonly TPopoverKey[];
}

function isDetailWithKey<TPopoverKey>(val: unknown): val is EventDetailWithKey<TPopoverKey> {
  return typeof val === 'object' && val !== null && ('key' in val || 'keys' in val);
}

export class EventBusRouter<TData, TPopoverKey extends string = string> {
  public readonly maxListeners = 100;
  public readonly wildcardListeners = new Set<PopoverWildcardListener<TData, TPopoverKey>>();
  public readonly listenersByKey = new Map<string, Set<PopoverWildcardListener<TData, TPopoverKey>>>();

  public subscribeAny(
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): PopoverSubscriptionToken {
    this.wildcardListeners.add(listener);
    return createSubscriptionToken(() => this.wildcardListeners.delete(listener));
  }

  public subscribeKey(
    targetKey: TPopoverKey,
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): PopoverSubscriptionToken {
    let keySet = this.listenersByKey.get(targetKey);
    if (!keySet) {
      keySet = new Set();
      this.listenersByKey.set(targetKey, keySet);
    }
    keySet.add(listener);

    return createSubscriptionToken(() => {
      const current = this.listenersByKey.get(targetKey);
      if (current) {
        current.delete(listener);
        if (current.size === 0) this.listenersByKey.delete(targetKey);
      }
    });
  }

  public dispatchWildcards(event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>): void {
    for (const listener of this.wildcardListeners) {
      safeCallback(listener, [event], { contextName: 'EventBus:wildcard' });
    }
  }

  public dispatchKeys(
    event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>,
    payload: unknown,
  ): void {
    if (this.listenersByKey.size === 0 || !isDetailWithKey<TPopoverKey>(payload)) return;
    if (payload.key) this.dispatchSingleKey(payload.key, event);
    if (payload.keys && isArray(payload.keys)) {
      for (const k of payload.keys) this.dispatchSingleKey(k, event);
    }
  }

  private dispatchSingleKey(
    key: TPopoverKey,
    event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>,
  ): void {
    const keyListeners = this.listenersByKey.get(key);
    if (!keyListeners) return;
    for (const listener of keyListeners) {
      safeCallback(listener, [event], { contextName: 'EventBus:key' });
    }
  }

  public clear(): void {
    this.wildcardListeners.clear(); this.listenersByKey.clear();
  }
}
