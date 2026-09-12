/**
 * Fault-isolated User Callback Dispatcher for PopoverTrail effects.
 *
 * @module store/effects/effectCallbacks
 */

import type { TrailEntry } from '../../types';
import { safeCallback } from '../../utils/safeCallback';
import type { UserCallbackType } from './effectTypes';

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
