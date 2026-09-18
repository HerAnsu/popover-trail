/**
 * Core PopoverEventBus Engine with Multi-Channel Routing.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module eventBusCore
 */

import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { warnIfOverCapacity } from './eventBusCapacity';
import { dispatchEventWithMirror } from './eventBusEmitter';
import { EventBusSubscriptions } from './eventBusSubscriptions';
import type {
  PopoverEventPayloadMap,
  PopoverEventType,
  PopoverEventBusOptions,
} from './eventBusTypes';
import { EventBusRouter } from './eventBusRouter';
import { EventBusSubscriptionManager } from './eventBusSubscriptionManager';

/**
 * Event bus engine for popover lifecycle orchestration and external observability.
 * Built on top of the standard `EventTarget` API with multi-channel routing, key filtering,
 * and wildcard event handling.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 *
 * @example
 * ```typescript
 * const bus = new PopoverEventBus();
 *
 * // Subscribe to specific event:
 * bus.on('popover:open_root', (e) => {
 *   console.log('Opened root:', e.detail.key);
 * });
 *
 * // Subscribe to all events on a specific popover key:
 * bus.onKey('profile-card', (e) => {
 *   console.log('Card event:', e.type);
 * });
 * ```
 */
export class PopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  /** Default global event bus instance for cross-instance mirroring. */
  public static defaultGlobalBus?: PopoverEventBus<unknown, string>;
  /** Maximum listener capacity before triggering a diagnostic leak warning. */
  public readonly maxListeners = 100;
  private lazyTarget?: EventTarget;
  private readonly router = new EventBusRouter<TData, TPopoverKey>();
  private readonly subs = new EventBusSubscriptionManager<TData, TPopoverKey>();
  private readonly listeners = new EventBusSubscriptions(
    () => this.target,
    this.subs,
    this.router,
    () => this.checkCapacity(),
  );
  private readonly options?: PopoverEventBusOptions;

  /**
   * Initializes a new PopoverEventBus.
   *
   * @param options - Optional configuration flags (e.g. `mirrorToGlobalBus`).
   */
  constructor(options?: PopoverEventBusOptions) {
    this.options = options;
  }

  private get target(): EventTarget {
    return this.lazyTarget ?? (this.lazyTarget = new EventTarget());
  }

  /**
   * Returns the total count of active registered listeners across all channels.
   */
  public get size(): number {
    return this.router.wildcardListeners.size + this.subs.size;
  }

  private checkCapacity(): void {
    warnIfOverCapacity(this.size, this.maxListeners);
  }

  /**
   * Emits a typed event to all matching listeners (specific type, key-scoped, and wildcard).
   *
   * @template K - Popover event type name.
   * @param type - Name of the event to emit.
   * @param payload - Structured event detail payload.
   * @returns `true` if the event was dispatched without being cancelled.
   *
   * @example
   * ```typescript
   * bus.emit('popover:pin', { key: 'card-1' });
   * ```
   */
  public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean {
    return dispatchEventWithMirror(
      this.target,
      this.router,
      type,
      payload,
      this.options,
      PopoverEventBus.defaultGlobalBus,
      this,
    );
  }

  /**
   * Subscribes a listener to a specific event type.
   */
  public readonly on = this.listeners.on.bind(this.listeners);

  /**
   * Subscribes a wildcard listener invoked on every emitted event.
   */
  public readonly onAny = this.listeners.onAny.bind(this.listeners);

  /**
   * Subscribes a listener that receives only events targeting the specified popover key.
   */
  public readonly onKey = this.listeners.onKey.bind(this.listeners);

  /**
   * Subscribes a one-time listener that auto-unsubscribes after its first invocation.
   */
  public readonly once = this.listeners.once.bind(this.listeners);

  /**
   * Removes a previously registered event listener.
   */
  public readonly off = this.listeners.off.bind(this.listeners);

  /**
   * Clears all registered listeners and resets router maps.
   */
  public clear(): void {
    if (this.lazyTarget) this.subs.clear(this.lazyTarget);
    this.router.clear();
  }

  /**
   * Explicit disposal method destroying all listeners and resources.
   */
  public dispose(): void {
    this.clear();
  }
  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
  public [Symbol.dispose](): void {
    this.dispose();
  }
}
