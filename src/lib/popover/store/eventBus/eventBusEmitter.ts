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

  if (
    options?.mirrorToGlobalBus !== false &&
    globalBus &&
    !Object.is(currentBus, globalBus)
  ) {
    globalBus.emit(type, payload);
  }

  return target.dispatchEvent(event);
}
