/**
 * Extensible, Zero-Any, Future-Proof EventBus Engine for PopoverTrail.
 * Built on the native EventTarget standard with Declaration Merging support.
 *
 * @module eventBus
 */

import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import type { PopoverStoreEvent } from '../types/eventTypes';
import { wrapResult, isErr } from '../utils/result';
import { DISPOSE_SYMBOL } from '../utils/disposable';

declare const process: { env?: Record<string, string | undefined> } | undefined;

/**
 * Open interface for TypeScript declaration merging.
 * Augment this interface to register custom application events on the popover event bus.
 *
 * @example
 * ```typescript
 * declare module 'popover-trail' {
 *   interface PopoverEventRegistry {
 *     'analytics:track': { eventName: string; key: string };
 *   }
 * }
 * ```
 */
export interface PopoverEventRegistry {}

/**
 * Built-in event types and their associated payload structures emitted by the popover trail store.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export interface BuiltinPopoverEventPayloadMap<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  /** Fired when a new root popover card is opened. */
  'popover:open_root': { key: TPopoverKey; ownerId: string };
  /** Fired when a child popover card is appended to the cascade. */
  'popover:push_nested': { key: TPopoverKey; parentKey?: TPopoverKey };
  /** Fired when one or more popovers close. */
  'popover:close': { keys: TPopoverKey[]; key?: TPopoverKey };
  /** Fired when a popover card is pinned/detached. */
  'popover:pin': { key: TPopoverKey };
  /** Fired when a pinned popover card is unpinned. */
  'popover:unpin': { key: TPopoverKey };
  /** Fired when a card drag gesture begins. */
  'popover:drag_start': { key: TPopoverKey; x: number; y: number };
  /** Fired when a card drag gesture ends. */
  'popover:drag_end': { key: TPopoverKey; x: number; y: number };
  /** Fired when async data resolution starts. */
  'popover:resolve_start': { key: TPopoverKey };
  /** Fired when async data resolution finishes successfully. */
  'popover:resolve_success': { key: TPopoverKey; data: TData };
  /** Fired when async data resolution encounters an error. */
  'popover:resolve_error': { key: TPopoverKey; error: Error };
  /** Fired when the entire trail and floating stack is cleared. */
  'popover:clear': undefined | Record<string, never>;

  // Convenience Aliases
  /** Alias for popover open event. */
  'popover:open': { key: TPopoverKey; parentKey?: TPopoverKey | null; ownerId?: string };
  /** Alias for popover data resolution success. */
  'popover:resolved': { key: TPopoverKey; data: TData };
}

/**
 * Combined map of all available event types and their payloads (built-in + custom registered).
 */
export type PopoverEventPayloadMap<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> = BuiltinPopoverEventPayloadMap<TData, TPopoverKey> & PopoverEventRegistry;

/**
 * Union of all valid event type names supported by the event bus.
 */
export type PopoverEventType = Extract<keyof PopoverEventPayloadMap, string>;

export class PopoverCustomEvent<
  K extends PopoverEventType = PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> extends Event {
  public readonly detail: PopoverEventPayloadMap<TData, TPopoverKey>[K];

  constructor(type: K, detail: PopoverEventPayloadMap<TData, TPopoverKey>[K]) {
    super(type, { bubbles: false, cancelable: true });
    this.detail = detail;
  }
}

export function isPopoverCustomEvent<
  K extends PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(e: Event, type?: K): e is PopoverCustomEvent<K, TData, TPopoverKey> {
  return e instanceof PopoverCustomEvent && (type === undefined || e.type === type);
}

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

export type PopoverEventListener<
  K extends PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> = (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void;

export type PopoverWildcardListener<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> = (event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>) => void;

interface EventDetailWithKey<TPopoverKey> {
  key?: TPopoverKey;
  keys?: readonly TPopoverKey[];
}

function isDetailWithKey<TPopoverKey>(val: unknown): val is EventDetailWithKey<TPopoverKey> {
  return typeof val === 'object' && val !== null && ('key' in val || 'keys' in val);
}

export class PopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  public readonly maxListeners = 100;

  private target = new EventTarget();
  private readonly listenersByEvent = new Map<string, Map<unknown, EventListener>>();
  private readonly wildcardListeners = new Set<PopoverWildcardListener<TData, TPopoverKey>>();

  private warnIfOverCapacity(): void {
    if (
      this.size >= this.maxListeners &&
      process !== undefined &&
      process?.env?.NODE_ENV !== 'production'
    ) {
      console.warn(
        `[popover-trail]: PopoverEventBus listener count (${this.size}) reached limit (${this.maxListeners}). Ensure listeners are unsubscribed on unmount.`,
      );
    }
  }

  public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean {
    const event = createPopoverEvent<K, TData, TPopoverKey>(type, payload);

    if (this.wildcardListeners.size > 0) {
      const genericEvent: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey> = event;
      for (const listener of this.wildcardListeners) {
        const result = wrapResult(() => listener(genericEvent));
        if (isErr(result)) {
          console.error('[popover-trail]: Exception in wildcard EventBus listener:', result.error);
        }
      }
    }

    return this.target.dispatchEvent(event);
  }

  public on<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    options?: AddEventListenerOptions,
  ): () => void {
    let subscribersForType = this.listenersByEvent.get(type);
    if (!subscribersForType) {
      subscribersForType = new Map();
      this.listenersByEvent.set(type, subscribersForType);
    }

    this.warnIfOverCapacity();

    // Re-registering an existing listener must replace its native handler.
    // Otherwise the previous handler stays attached to the EventTarget and
    // keeps firing after the Map entry (and any later off()) is gone.
    const existingHandler = subscribersForType.get(listener);
    if (existingHandler) {
      this.target.removeEventListener(type, existingHandler);
    }

    const { once, ...nativeOptions } = options ?? {};

    const handler: EventListener = (e: Event) => {
      if (!isPopoverCustomEvent<K, TData, TPopoverKey>(e, type)) return;

      // Native `once` removes only the DOM listener; clean the registry entry
      // too so `size` stays accurate and closed-over handlers are released.
      if (once) {
        this.off(type, listener);
      }

      const result = wrapResult(() => listener(e));
      if (isErr(result)) {
        console.error(
          `[popover-trail]: Exception in EventBus listener for "${type}":`,
          result.error,
        );
      }
    };

    subscribersForType.set(listener, handler);
    this.target.addEventListener(type, handler, nativeOptions);

    return () => {
      this.off(type, listener, options);
    };
  }

  public onAny(listener: PopoverWildcardListener<TData, TPopoverKey>): () => void {
    this.wildcardListeners.add(listener);
    this.warnIfOverCapacity();
    return () => {
      this.wildcardListeners.delete(listener);
    };
  }

  public onKey(
    targetKey: TPopoverKey,
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): () => void {
    return this.onAny((event) => {
      const detail = event.detail;
      const isTarget =
        isDetailWithKey<TPopoverKey>(detail) &&
        (detail.key === targetKey ||
          (Array.isArray(detail.keys) && detail.keys.includes(targetKey)));

      if (isTarget) {
        listener(event);
      }
    });
  }

  public off<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    options?: EventListenerOptions,
  ): void {
    const subscribersForType = this.listenersByEvent.get(type);
    if (!subscribersForType) return;

    const handler = subscribersForType.get(listener);
    if (handler) {
      this.target.removeEventListener(type, handler, options);
      subscribersForType.delete(listener);
      if (subscribersForType.size === 0) {
        this.listenersByEvent.delete(type);
      }
    }
  }

  public once<K extends PopoverEventType>(
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
  ): () => void {
    return this.on(type, listener, { once: true });
  }

  public get size(): number {
    let total = this.wildcardListeners.size;
    for (const subscribers of this.listenersByEvent.values()) {
      total += subscribers.size;
    }
    return total;
  }

  public clear(): void {
    for (const [type, subscribers] of this.listenersByEvent.entries()) {
      for (const handler of subscribers.values()) {
        this.target.removeEventListener(type, handler);
      }
    }
    this.listenersByEvent.clear();
    this.wildcardListeners.clear();
    this.target = new EventTarget();
  }

  public dispose(): void {
    this.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}

export const globalPopoverEventBus: PopoverEventBus = new PopoverEventBus();

const ALIAS_PROJECTIONS: Readonly<Record<string, readonly PopoverEventType[]>> = Object.freeze({
  open_root: ['popover:open_root', 'popover:open'],
  'popover:open_root': ['popover:open_root', 'popover:open'],
  push_nested: ['popover:push_nested', 'popover:open'],
  'popover:push_nested': ['popover:push_nested', 'popover:open'],
  resolve_success: ['popover:resolve_success', 'popover:resolved'],
  'popover:resolve_success': ['popover:resolve_success', 'popover:resolved'],
});

function extractEventPayload<TData, TPopoverKey extends string>(
  event: PopoverStoreEvent<TData>,
): PopoverEventPayloadMap<TData, TPopoverKey>[PopoverEventType] {
  const { type: _type, ...payload } = event;
  return payload as PopoverEventPayloadMap<TData, TPopoverKey>[PopoverEventType];
}

export function dispatchStoreEvent<TData, TPopoverKey extends string = string>(
  listeners: ReadonlySet<(event: PopoverStoreEvent<TData>) => void> | undefined,
  event: PopoverStoreEvent<TData>,
  localEventBus?: PopoverEventBus<TData, TPopoverKey>,
): void {
  if (listeners) {
    for (const listener of listeners) {
      const listenerResult = wrapResult(() => listener(event));
      if (isErr(listenerResult)) {
        console.error('[popover-trail]: Exception in store event listener:', listenerResult.error);
      }
    }
  }

  wrapResult(() => {
    const rawType = event.type;
    const canonicalType = (
      rawType.startsWith('popover:') ? rawType : `popover:${rawType}`
    ) as PopoverEventType;

    const payload = extractEventPayload<TData, TPopoverKey>(event);

    globalPopoverEventBus.emit(canonicalType, payload as PopoverEventPayloadMap[PopoverEventType]);
    localEventBus?.emit(
      canonicalType,
      payload as PopoverEventPayloadMap<TData, TPopoverKey>[PopoverEventType],
    );

    const aliases = ALIAS_PROJECTIONS[rawType];
    if (aliases) {
      for (const alias of aliases) {
        if (alias !== canonicalType) {
          globalPopoverEventBus.emit(alias, payload as PopoverEventPayloadMap[PopoverEventType]);
          localEventBus?.emit(
            alias,
            payload as PopoverEventPayloadMap<TData, TPopoverKey>[PopoverEventType],
          );
        }
      }
    }
  });
}
