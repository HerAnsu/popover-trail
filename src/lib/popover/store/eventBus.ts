/**
 * Strongly typed EventBus for PopoverTrail lifecycle and state events.
 * Built on native EventTarget for maximum performance and zero memory leaks.
 */

import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';

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

export class PopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  private target = new EventTarget();

  public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean {
    const event = new PopoverCustomEvent<K, TData, TPopoverKey>(type, payload);
    return this.target.dispatchEvent(event);
  }

  public on<K extends PopoverEventType>(
    type: K,
    listener: (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void,
    options?: AddEventListenerOptions,
  ): () => void {
    const handler = (e: Event) => {
      if (isPopoverCustomEvent<K, TData, TPopoverKey>(e, type)) {
        listener(e);
      }
    };
    this.target.addEventListener(type, handler, options);
    return () => {
      this.target.removeEventListener(type, handler, options);
    };
  }

  public once<K extends PopoverEventType>(
    type: K,
    listener: (event: PopoverCustomEvent<K, TData, TPopoverKey>) => void,
  ): () => void {
    return this.on(type, listener, { once: true });
  }
}

export const globalPopoverEventBus = new PopoverEventBus();
