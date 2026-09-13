/**
 * FSM EventBus Observer Bridge.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/fsm/fsmObserver
 */

import type { PopoverEventBus } from '../eventBus';
import {
  isPopoverCustomEvent,
  type PopoverCustomEvent,
  type PopoverEventType,
} from '../eventBus/eventBusTypes';
import type { PopoverFSMRegistry } from './fsmRegistry';
import { isIdleFSM, isPinnedFSM } from './fsmGuards';
import { toError } from '../../utils/guards/errorGuards';
import { unique } from '../../utils/collections';
import { EMPTY_ARRAY } from '../../constants';

/**
 * Binds an FSM Registry as a shadow invariant watchdog to the store event bus.
 */
export function bindFSMRegistryToEventBus<TData = unknown, TPopoverKey extends string = string>(
  fsmRegistry: PopoverFSMRegistry<TData, TPopoverKey>,
  eventBus: PopoverEventBus<TData, TPopoverKey>,
): () => void {
  function isEvent<K extends PopoverEventType>(
    event: Event,
    type: K,
  ): event is PopoverCustomEvent<K, TData, TPopoverKey> {
    return isPopoverCustomEvent<K, TData, TPopoverKey>(event, type);
  }

  const token = eventBus.onAny((e) => {
    if (
      isEvent(e, 'popover:open_root') ||
      isEvent(e, 'popover:push_nested') ||
      isEvent(e, 'popover:resolve_start')
    ) {
      const { key } = e.detail;
      const m = fsmRegistry.get(key);
      if (!m || isIdleFSM(m.getState())) {
        fsmRegistry.send(key, { type: 'OPEN_ROOT', key });
      }
      return;
    }
    if (isEvent(e, 'popover:resolve_success')) {
      fsmRegistry.send(e.detail.key, { type: 'RESOLVE_SUCCESS', data: e.detail.data });
      return;
    }
    if (isEvent(e, 'popover:resolve_error')) {
      const { key, error } = e.detail;
      fsmRegistry.send(key, { type: 'RESOLVE_FAILURE', error: toError(error) });
      return;
    }
    if (isEvent(e, 'popover:pin')) {
      const m = fsmRegistry.get(e.detail.key);
      if (m && !isPinnedFSM(m.getState())) {
        fsmRegistry.send(e.detail.key, { type: 'TOGGLE_PIN' });
      }
      return;
    }
    if (isEvent(e, 'popover:unpin')) {
      const m = fsmRegistry.get(e.detail.key);
      if (m && isPinnedFSM(m.getState())) {
        fsmRegistry.send(e.detail.key, { type: 'TOGGLE_PIN' });
      }
      return;
    }
    if (isEvent(e, 'popover:close')) {
      const keysToClose = unique([
        ...(e.detail.key ? [e.detail.key] : []),
        ...(e.detail.keys ?? EMPTY_ARRAY),
      ]);
      for (const k of keysToClose) fsmRegistry.send(k, { type: 'CLOSE' });
      return;
    }
    if (isEvent(e, 'popover:clear')) {
      fsmRegistry.destroyAll();
    }
  });

  return () => token();
}
