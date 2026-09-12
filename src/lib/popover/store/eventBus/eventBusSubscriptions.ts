/**
 * EventBus Subscription Helper Facade.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/eventBus/eventBusSubscriptions
 */

import type { EventBusRouter } from './eventBusRouter';
import type { EventBusSubscriptionManager } from './eventBusSubscriptionManager';
import type {
  PopoverEventType,
  PopoverEventListener,
  PopoverWildcardListener,
  PopoverSubscriptionToken,
} from './eventBusTypes';

export class EventBusSubscriptions<TData, TPopoverKey extends string> {
  public readonly maxListeners = 100;
  private readonly getTarget: () => EventTarget;
  private readonly subs: EventBusSubscriptionManager<TData, TPopoverKey>;
  private readonly router: EventBusRouter<TData, TPopoverKey>;
  private readonly checkCapacity: () => void;

  constructor(
    getTarget: () => EventTarget,
    subs: EventBusSubscriptionManager<TData, TPopoverKey>,
    router: EventBusRouter<TData, TPopoverKey>,
    checkCapacity: () => void,
  ) {
    this.getTarget = getTarget;
    this.subs = subs;
    this.router = router;
    this.checkCapacity = checkCapacity;
  }

  on<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    opts?: AddEventListenerOptions,
  ): PopoverSubscriptionToken {
    this.checkCapacity();
    // return () => unsubscribe handle
    return this.subs.subscribe(this.getTarget(), type, listener, opts);
  }

  onAny(listener: PopoverWildcardListener<TData, TPopoverKey>): PopoverSubscriptionToken {
    this.checkCapacity();
    return this.router.subscribeAny(listener);
  }

  onKey(key: TPopoverKey, listener: PopoverWildcardListener<TData, TPopoverKey>): PopoverSubscriptionToken {
    this.checkCapacity();
    return this.router.subscribeKey(key, listener);
  }

  once<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    opts?: Omit<AddEventListenerOptions, 'once'>,
  ): PopoverSubscriptionToken {
    return this.on(type, listener, { ...opts, once: true });
  }

  off<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    opts?: EventListenerOptions,
  ): void {
    this.subs.unsubscribe(this.getTarget(), type, listener, opts);
  }
}
