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

/**
 * Subscription routing facade encapsulating listener registration on EventTarget and EventBusRouter.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 *
 * @example
 * ```typescript
 * const subscriptions = new EventBusSubscriptions(getTarget, subs, router, checkCapacity);
 * const token = subscriptions.on('popover:pin', (e) => console.log(e.detail.key));
 * ```
 */
export class EventBusSubscriptions<TData, TPopoverKey extends string> {
  /** Maximum listener capacity threshold before warning. */
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

  /**
   * Subscribes a listener to a specific event type.
   *
   * @template K - Event type name.
   * @param type - Name of the event to listen for.
   * @param listener - Callback invoked when the event is emitted.
   * @param opts - Standard AddEventListenerOptions.
   * @returns Subscription token to unsubscribe.
   */
  public on<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    opts?: AddEventListenerOptions,
  ): PopoverSubscriptionToken {
    this.checkCapacity();
    // return () => unsubscribe handle
    return this.subs.subscribe(this.getTarget(), type, listener, opts);
  }

  /**
   * Subscribes a wildcard listener invoked on all emitted events.
   *
   * @param listener - Callback receiving all custom events.
   * @returns Subscription token to unsubscribe.
   */
  public onAny(listener: PopoverWildcardListener<TData, TPopoverKey>): PopoverSubscriptionToken {
    this.checkCapacity();
    return this.router.subscribeAny(listener);
  }

  /**
   * Subscribes a listener receiving events only when they match the given popover key.
   *
   * @param key - Popover key to filter events by.
   * @param listener - Callback receiving matching events.
   * @returns Subscription token to unsubscribe.
   */
  public onKey(
    key: TPopoverKey,
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): PopoverSubscriptionToken {
    this.checkCapacity();
    return this.router.subscribeKey(key, listener);
  }

  /**
   * Subscribes a one-time listener that auto-unsubscribes after its first invocation.
   *
   * @template K - Event type name.
   * @param type - Name of the event.
   * @param listener - Callback invoked once.
   * @param opts - Standard AddEventListenerOptions without `once`.
   * @returns Subscription token to unsubscribe early.
   */
  public once<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    opts?: Omit<AddEventListenerOptions, 'once'>,
  ): PopoverSubscriptionToken {
    return this.on(type, listener, { ...opts, once: true });
  }

  /**
   * Unsubscribes a listener from a specific event type.
   *
   * @template K - Event type name.
   * @param type - Event type name.
   * @param listener - Callback to remove.
   * @param opts - Standard EventListenerOptions.
   */
  public off<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    opts?: EventListenerOptions,
  ): void {
    this.subs.unsubscribe(this.getTarget(), type, listener, opts);
  }
}
