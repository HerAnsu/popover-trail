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

/**
 * Custom event wrapper for all popover-trail lifecycle and state events.
 * Extends the standard DOM `Event` class with a typed `detail` payload property.
 *
 * @template K - Specific popover event type.
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 */
export class PopoverCustomEvent<
  K extends PopoverEventType = PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> extends Event {
  /** Event payload detail. */
  public readonly detail: PopoverEventPayloadMap<TData, TPopoverKey>[K];

  constructor(type: K, detail: PopoverEventPayloadMap<TData, TPopoverKey>[K]) {
    super(type, { bubbles: false, cancelable: true });
    this.detail = detail;
  }
}

/**
 * Type guard verifying whether an event is an instance of `PopoverCustomEvent`.
 * Optionally checks if the event matches a specific event type `K`.
 *
 * @template K - Expected event type string.
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param e - Event to check.
 * @param type - Optional event type name to match.
 * @returns `true` if `e` is a matching `PopoverCustomEvent`.
 *
 * @example
 * ```typescript
 * if (isPopoverCustomEvent(e, 'popover:open_root')) {
 *   console.log('Opened key:', e.detail.key);
 * }
 * ```
 */
export function isPopoverCustomEvent<
  K extends PopoverEventType,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(e: Event, type?: K): e is PopoverCustomEvent<K, TData, TPopoverKey> {
  return e instanceof PopoverCustomEvent && (type === undefined || e.type === type);
}

/**
 * Factory function creating a new `PopoverCustomEvent` instance.
 *
 * @template K - Specific popover event type.
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param type - Event type name (e.g. `'popover:close'`).
 * @param detail - Event payload detail conforming to `PopoverEventPayloadMap`.
 * @returns A typed `PopoverCustomEvent` instance.
 *
 * @example
 * ```typescript
 * const event = createPopoverEvent('popover:pin', { key: 'card-1' });
 * ```
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

/**
 * Subscription cleanup token function that also implements `[Symbol.dispose]`
 * for explicit resource management via `using` statements.
 */
export interface PopoverSubscriptionToken {
  /** Unsubscribes the listener when invoked as a function. */
  (): void;
  /** RAII disposal hook. */
  [Symbol.dispose](): void;
}

/**
 * Wraps an unsubscribe callback into a `PopoverSubscriptionToken`.
 *
 * @param unsubscribe - Raw unsubscribe function.
 * @returns A callable token implementing `[Symbol.dispose]`.
 *
 * @example
 * ```typescript
 * const token = createSubscriptionToken(() => listenerSet.delete(fn));
 * token(); // Unsubscribes
 * ```
 */
export function createSubscriptionToken(unsubscribe: () => void): PopoverSubscriptionToken {
  const token = () => unsubscribe();
  token[Symbol.dispose] = token;
  return token;
}
