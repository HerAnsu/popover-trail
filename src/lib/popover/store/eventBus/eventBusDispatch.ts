/**
 * Store Event to EventBus Dispatch Translation Engine.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module eventBusDispatch
 */

import type { PopoverStoreEvent } from '../../types/eventTypes';
import { safeCallback } from '../../utils/safeCallback';
import type { PopoverEventBus } from './eventBusCore';
import {
  type PopoverEventType,
  type PopoverEventPayloadMap,
  createPopoverEvent,
} from './eventBusTypes';

export function defineCustomEvent<
  K extends PopoverEventType,
  TData = unknown,
  TPopoverKey extends string = string,
>(type: K) {
  return {
    type,
    create: (payload: PopoverEventPayloadMap<TData, TPopoverKey>[K]) =>
      createPopoverEvent<K, TData, TPopoverKey>(type, payload),
  };
}

export function emitStoreEventToBus<TData, TPopoverKey extends string = string>(
  eventBus: PopoverEventBus<TData, TPopoverKey>,
  event: PopoverStoreEvent<TData, TPopoverKey>,
): void {
  switch (event.type) {
    case 'open_root':
    case 'popover:open_root':
      eventBus.emit('popover:open_root', { key: event.key, ownerId: event.ownerId });
      break;
    case 'push_nested':
    case 'popover:push_nested':
      eventBus.emit('popover:push_nested', { key: event.key, parentKey: event.parentKey });
      break;
    case 'close':
    case 'popover:close':
      eventBus.emit('popover:close', { keys: event.keys, key: event.key });
      break;
    case 'pin':
    case 'popover:pin':
      eventBus.emit('popover:pin', { key: event.key });
      break;
    case 'unpin':
    case 'popover:unpin':
      eventBus.emit('popover:unpin', { key: event.key });
      break;
    case 'resolve_start':
    case 'popover:resolve_start':
      eventBus.emit('popover:resolve_start', { key: event.key });
      break;
    case 'resolve_success':
    case 'popover:resolve_success':
      eventBus.emit('popover:resolve_success', { key: event.key, data: event.data });
      break;
    case 'resolve_error':
    case 'popover:resolve_error':
      eventBus.emit('popover:resolve_error', { key: event.key, error: event.error });
      break;
    case 'resolve_perf':
    case 'popover:resolve_perf':
      eventBus.emit('popover:resolve_perf', { metric: event.metric });
      break;
    case 'clear':
    case 'popover:clear':
      eventBus.emit('popover:clear', event);
      break;
    case 'drag_start':
    case 'popover:drag_start':
      eventBus.emit('popover:drag_start', { key: event.key, x: event.x, y: event.y });
      break;
    case 'drag_end':
    case 'popover:drag_end':
      eventBus.emit('popover:drag_end', { key: event.key, x: event.x, y: event.y });
      break;
    case 'dag_edge_added':
    case 'popover:dag_edge_added':
      eventBus.emit('popover:dag_edge_added', {
        parentKey: event.parentKey,
        childKey: event.childKey,
      });
      break;
    case 'dag_edge_removed':
    case 'popover:dag_edge_removed':
      eventBus.emit('popover:dag_edge_removed', {
        parentKey: event.parentKey,
        childKey: event.childKey,
      });
      break;
    default:
      break;
  }
}

export function dispatchStoreEvent<TData, TPopoverKey extends string = string>(
  eventListeners: Iterable<(event: PopoverStoreEvent<TData, TPopoverKey>) => void> | undefined,
  event: PopoverStoreEvent<TData, TPopoverKey>,
  eventBus?: PopoverEventBus<TData, TPopoverKey>,
): void {
  if (eventListeners) {
    for (const listener of eventListeners) {
      safeCallback(listener, [event], { contextName: 'storeEventListener' });
    }
  }
  if (eventBus) emitStoreEventToBus(eventBus, event);
}
