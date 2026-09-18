/**
 * Routing and Multi-Channel Listener Management for PopoverEventBus.
 * Clean Architecture Layer 2: Headless State Management.
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

/**
 * Routes events to wildcard subscribers and key-filtered subscribers.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 *
 * @example
 * ```typescript
 * const router = new EventBusRouter();
 * const token = router.subscribeKey('card-1', (event) => {
 *   console.log('Key-scoped event:', event.type);
 * });
 * ```
 */
export class EventBusRouter<TData, TPopoverKey extends string = string> {
  /** Maximum listener capacity before triggering warning. */
  public readonly maxListeners = 100;
  /** Set of active wildcard listeners. */
  public readonly wildcardListeners = new Set<PopoverWildcardListener<TData, TPopoverKey>>();
  /** Map of key-scoped listener sets indexed by popover key. */
  public readonly listenersByKey = new Map<
    string,
    Set<PopoverWildcardListener<TData, TPopoverKey>>
  >();

  /**
   * Registers a wildcard listener invoked on all events.
   *
   * @param listener - Wildcard listener function.
   * @returns Subscription token to unsubscribe.
   *
   * @example
   * ```typescript
   * const token = router.subscribeAny((e) => console.log(e.type, e.detail));
   * ```
   */
  public subscribeAny(
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): PopoverSubscriptionToken {
    this.wildcardListeners.add(listener);
    return createSubscriptionToken(() => this.wildcardListeners.delete(listener));
  }

  /**
   * Registers a listener receiving events only when they target the specified key.
   *
   * @param targetKey - Key identifier to filter by.
   * @param listener - Callback invoked when an event matches the key.
   * @returns Subscription token to unsubscribe.
   *
   * @example
   * ```typescript
   * const token = router.subscribeKey('card-1', (e) => console.log('Card 1 event:', e.type));
   * ```
   */
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

  /**
   * Dispatches an event to all registered wildcard listeners with fault isolation.
   *
   * @param event - Custom popover event to dispatch.
   */
  public dispatchWildcards(event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>): void {
    for (const listener of this.wildcardListeners) {
      safeCallback(listener, [event], { contextName: 'EventBus:wildcard' });
    }
  }

  /**
   * Dispatches an event to key-scoped listeners matching either `payload.key` or `payload.keys`.
   *
   * @param event - Custom popover event to dispatch.
   * @param payload - Structured event payload containing key metadata.
   */
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

  /**
   * Clears all wildcard and key-scoped event listeners.
   */
  public clear(): void {
    this.wildcardListeners.clear();
    this.listenersByKey.clear();
  }
}
