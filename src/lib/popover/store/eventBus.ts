/**
 * Strongly typed EventBus for PopoverTrail lifecycle and state events.
 * Built on native EventTarget for maximum performance and zero memory leaks.
 */

import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import type { PopoverStoreEvent } from '../types/eventTypes';

export type PopoverEventType =
  | 'popover:open'
  | 'popover:close'
  | 'popover:pin'
  | 'popover:unpin'
  | 'popover:drag_start'
  | 'popover:drag_end'
  | 'popover:resolved';

export interface PopoverEventPayloadMap<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  'popover:open': { key: TPopoverKey; parentKey?: TPopoverKey | null };
  'popover:close': { key: TPopoverKey };
  'popover:pin': { key: TPopoverKey };
  'popover:unpin': { key: TPopoverKey };
  'popover:drag_start': { key: TPopoverKey; x: number; y: number };
  'popover:drag_end': { key: TPopoverKey; x: number; y: number };
  'popover:resolved': { key: TPopoverKey; data: TData };
}

/**
 * Strongly typed CustomEvent wrapper carrying typed event detail payloads.
 *
 * @template K - Popover event name literal.
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export class PopoverCustomEvent<
  K extends PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> extends Event {
  /** Event payload details. */
  public readonly detail: PopoverEventPayloadMap<TData, TPopoverKey>[K];

  constructor(type: K, detail: PopoverEventPayloadMap<TData, TPopoverKey>[K]) {
    super(type, { bubbles: false, cancelable: true });
    this.detail = detail;
  }
}

/**
 * Type predicate narrowing generic DOM Events to typed PopoverCustomEvent instances.
 */
export function isPopoverCustomEvent<
  K extends PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(e: Event, type?: K): e is PopoverCustomEvent<K, TData, TPopoverKey> {
  return e instanceof PopoverCustomEvent && (type === undefined || e.type === type);
}

/**
 * Factory helper creating a typed PopoverCustomEvent instance.
 */
export function createPopoverEvent<
  K extends PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(
  type: K,
  detail: PopoverEventPayloadMap<TData, TPopoverKey>[K],
): PopoverCustomEvent<K, TData, TPopoverKey> {
  return new PopoverCustomEvent(type, detail);
}

/**
 * High-performance, strongly typed EventBus built on the native EventTarget standard.
 * Provides decoupled pub/sub event broadcasting for analytics, logging, and external integrations.
 *
 * @remarks
 * Uses native browser `EventTarget` primitives under the hood to ensure zero memory leaks
 * and automatic cleanup.
 *
 * @example
 * ```typescript
 * const bus = new PopoverEventBus();
 *
 * // Subscribe to open events
 * const unsubscribe = bus.on('popover:open', (e) => {
 *   console.log('Opened popover:', e.detail.key);
 * });
 *
 * // Emit event
 * bus.emit('popover:open', { key: 'user-card' });
 * ```
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export class PopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  public readonly maxListeners = 100;
  private target = new EventTarget();
  private listenerMap = new Map<
    (event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>) => void,
    EventListener
  >();

  /**
   * Emits a typed lifecycle event to all subscribed listeners.
   *
   * @param type - Event type name.
   * @param payload - Strongly typed event detail payload.
   * @returns True if event was dispatched without preventDefault cancellation.
   */
  public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean {
    const event = createPopoverEvent<K, TData, TPopoverKey>(type, payload);
    return this.target.dispatchEvent(event);
  }

  /**
   * Subscribes a listener callback to a specific event type.
   *
   * @param type - Event type name to listen for.
   * @param listener - Callback function receiving typed event object.
   * @param options - Standard DOM AddEventListenerOptions.
   * @returns Unsubscribe function.
   */
  public on<K extends PopoverEventType>(
    type: K,
    listener: (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void,
    options?: AddEventListenerOptions,
  ): () => void {
    const handler = ((e: Event) => {
      if (isPopoverCustomEvent<K, TData, TPopoverKey>(e, type)) {
        try {
          listener(e);
        } catch (err) {
          console.error(`[PopoverEventBus] Listener error for "${type}":`, err);
        }
      }
    }) as EventListener;

    this.listenerMap.set(
      listener as unknown as (
        event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>,
      ) => void,
      handler,
    );
    this.target.addEventListener(type, handler, options);

    return () => {
      this.off(type, listener);
    };
  }

  /**
   * Unsubscribes a previously registered listener callback.
   *
   * @param type - Event type name.
   * @param listener - Target listener callback to remove.
   * @param options - Standard DOM EventListenerOptions.
   */
  public off<K extends PopoverEventType>(
    type: K,
    listener: (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void,
    options?: EventListenerOptions,
  ): void {
    const handlerKey = listener as unknown as (
      event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>,
    ) => void;
    const handler = this.listenerMap.get(handlerKey);
    if (handler) {
      this.target.removeEventListener(type, handler, options);
      this.listenerMap.delete(handlerKey);
    }
  }

  /**
   * Subscribes a one-time listener callback that automatically unregisters after first trigger.
   *
   * @param type - Event type name.
   * @param listener - One-shot callback function.
   * @returns Unsubscribe function.
   */
  public once<K extends PopoverEventType>(
    type: K,
    listener: (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void,
  ): () => void {
    return this.on(type, listener, { once: true });
  }

  /** Total count of active listener subscriptions. */
  public get size(): number {
    return this.listenerMap.size;
  }

  /** Clears all registered event listeners and resets target. */
  public clear(): void {
    this.listenerMap.clear();
    this.target = new EventTarget();
  }

  /** Disposable cleanup handle. */
  public dispose(): void {
    this.clear();
  }
}

/** Global default event bus singleton instance. */
export const globalPopoverEventBus = new PopoverEventBus();

/**
 * Safely dispatches a store event to all registered listener callbacks with error boundary isolation.
 */
export function dispatchStoreEvent<TData>(
  listeners: ReadonlySet<(event: PopoverStoreEvent<TData>) => void> | undefined,
  event: PopoverStoreEvent<TData>,
): void {
  if (!listeners) return;
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      console.error('[popover-trail]: Exception in store event listener:', err);
    }
  }
}
