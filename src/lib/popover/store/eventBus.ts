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

export class PopoverCustomEvent<
  K extends PopoverEventType,
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

export class PopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  private target = new EventTarget();
  private listenerMap = new Map<
    (event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>) => void,
    EventListener
  >();

  public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean {
    const event = createPopoverEvent<K, TData, TPopoverKey>(type, payload);
    return this.target.dispatchEvent(event);
  }

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

  public once<K extends PopoverEventType>(
    type: K,
    listener: (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void,
  ): () => void {
    return this.on(type, listener, { once: true });
  }

  public get size(): number {
    return this.listenerMap.size;
  }

  public clear(): void {
    this.listenerMap.clear();
    this.target = new EventTarget();
  }

  public dispose(): void {
    this.clear();
  }
}

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
