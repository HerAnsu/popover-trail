/**
 * Fault-isolated User Callback Dispatcher for PopoverTrail effects.
 *
 * @module store/effects/effectCallbacks
 */

import type { TrailEntry } from '../../types';
import { safeCallback } from '../../utils/safeCallback';
import type { UserCallbackType } from './effectTypes';

/**
 * Dispatches a user lifecycle callback (`onClose`, `onPin`, `onOpen`) inside an isolated fault boundary.
 *
 * @example
 * ```ts
 * notifyUserCallback(entry, 'onClose', 'card-1');
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param entry - TrailEntry instance containing callback references.
 * @param type - Callback lifecycle type ('onClose' | 'onPin' | 'onOpen').
 * @param key - Identifier of the target popover.
 * @param payload - Optional callback argument payload.
 */
export function notifyUserCallback<TData, TPopoverKey extends string>(
  entry: TrailEntry<TData, TPopoverKey>,
  type: UserCallbackType,
  key: TPopoverKey,
  payload?: unknown,
): void {
  if (type === 'onClose') {
    safeCallback(entry.onClose, [key], { contextName: 'onClose' });
  } else if (type === 'onPin') {
    safeCallback(entry.onPin, [key, Boolean(payload)], { contextName: 'onPin' });
  } else if (type === 'onOpen') {
    safeCallback(entry.onOpen, [entry], { contextName: 'onOpen' });
  }
}
