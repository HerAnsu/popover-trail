/**
 * Event Types, Payload Maps, and Custom Event Classes for EventBus.
 *
 * @module eventBusTypes
 */

import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';

import type { PopoverPayloadAction, PopoverEventPayloadDefinitions } from '../../types/eventTypes';

export interface PopoverEventRegistry {}

export type BuiltinPopoverEventPayloadMap<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> = {
  [K in PopoverPayloadAction as `popover:${K}`]: PopoverEventPayloadDefinitions<
    TData,
    TPopoverKey
  >[K];
} & {
  'popover:clear': undefined | Record<string, never> | { type?: string };
  'popover:open': { key: TPopoverKey; parentKey?: TPopoverKey | null; ownerId?: string };
  'popover:resolved': { key: TPopoverKey; data: TData };
  'popover:batch_close': { keys: readonly TPopoverKey[] };
};

export type PopoverEventPayloadMap<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> = BuiltinPopoverEventPayloadMap<TData, TPopoverKey> & PopoverEventRegistry;

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

export interface PopoverEventBusOptions {
  readonly mirrorToGlobalBus?: boolean;
}

export interface PopoverSubscriptionToken {
  (): void;
  [Symbol.dispose](): void;
}

export function createSubscriptionToken(unsubscribe: () => void): PopoverSubscriptionToken {
  const token = () => unsubscribe();
  token[Symbol.dispose] = token;
  return token;
}
