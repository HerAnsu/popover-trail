/**
 * EventBus Dispatch and Mirroring Pipeline.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/eventBus/eventBusEmitter
 */

import type { PopoverEventBus } from './eventBusCore';
import type { EventBusRouter } from './eventBusRouter';
import {
  type PopoverEventType,
  type PopoverEventPayloadMap,
  type PopoverEventBusOptions,
  createPopoverEvent,
} from './eventBusTypes';

/**
 * Dispatches an event through the target DOM EventTarget, wildcard routers, key-filtered routers,
 * and optionally mirrors the event to the global event bus.
 *
 * @template K - Target popover event type.
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param target - Underlying native `EventTarget` instance.
 * @param router - Router managing wildcard and key-scoped subscriptions.
 * @param type - Name of the event being emitted.
 * @param payload - Structured event payload.
 * @param options - Bus configuration options (e.g. `mirrorToGlobalBus`).
 * @param globalBus - Reference to the application-wide global bus.
 * @param currentBus - Reference to the issuing bus instance.
 * @returns `true` if the event was dispatched successfully and not cancelled.
 */
export function dispatchEventWithMirror<
  K extends PopoverEventType,
  TData,
  TPopoverKey extends string,
>(
  target: EventTarget,
  router: EventBusRouter<TData, TPopoverKey>,
  type: K,
  payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  options?: PopoverEventBusOptions,
  globalBus?: PopoverEventBus<unknown, string>,
  currentBus?: PopoverEventBus<TData, TPopoverKey>,
): boolean {
  const event = createPopoverEvent<K, TData, TPopoverKey>(type, payload);
  router.dispatchWildcards(event);
  router.dispatchKeys(event, payload);

  if (options?.mirrorToGlobalBus !== false && globalBus && !Object.is(currentBus, globalBus)) {
    globalBus.emit(type, payload);
  }

  return target.dispatchEvent(event);
}
