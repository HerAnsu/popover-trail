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
 * Connects a `PopoverFSMRegistry` to a `PopoverEventBus` as a shadow invariant watchdog.
 *
 * Automatically translates high-level event bus events (`popover:open_root`, `popover:resolve_success`,
 * `popover:pin`, `popover:close`, etc.) into discrete FSM transitions on the corresponding card FSMs.
 * This bridges Layer 2 Headless State Management and ensures individual card lifecycles stay in sync
 * with global store operations.
 *
 * @template TData - Type of resolved data stored in FSM contexts.
 * @template TPopoverKey - String identifier type for popover keys.
 * @param fsmRegistry - Registry instance managing individual popover state machines.
 * @param eventBus - Event bus emitting reactive lifecycle events.
 * @returns An unbind cleanup function that detaches the event bus listener.
 *
 * @example
 * ```typescript
 * const unbind = bindFSMRegistryToEventBus(registry, eventBus);
 *
 * // Later during teardown:
 * unbind();
 * ```
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
