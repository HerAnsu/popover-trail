/**
 * Platform Storage Adapters for Snapshot Manager.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module snapshotStorageAdapter
 */

import { wrapResult, isOk, fromThrowable, unwrapOr } from '../../utils/result';
import { logger } from '../../utils/logger';
import { toError } from '../../utils/guards/errorGuards';
import { isServer } from '../../utils/guards/envGuards';
import type { PopoverSnapshotData } from './snapshotManagerTypes';
import { isValidSnapshot } from './snapshotGuards';

export {
  initSnapshotChannel,
  closeSnapshotChannel,
  type SnapshotChannelHandle,
} from './snapshotChannel';

function getStorage(type: 'localStorage' | 'sessionStorage' | 'none'): Storage | null {
  if (type === 'none' || isServer()) return null;
  return unwrapOr(fromThrowable(() => window[type]), null);
}

export function saveSnapshotToPlatform<TData>(
  storageType: 'localStorage' | 'sessionStorage' | 'none',
  storageKey: string,
  snapshot: PopoverSnapshotData<TData>,
  broadcastChannel: BroadcastChannel | null,
  serializer?: (data: PopoverSnapshotData<TData>) => string,
): void {
  const serialized = serializer ? serializer(snapshot) : JSON.stringify(snapshot);
  const storage = getStorage(storageType);
  if (storage) {
    const res = wrapResult(() => storage.setItem(storageKey, serialized));
    if (!isOk(res)) {
      logger.error(`[popover-trail]: Failed to save snapshot to ${storageType}:`, res.error);
    }
  }
  if (broadcastChannel) {
    wrapResult(() => broadcastChannel.postMessage({ type: 'POP_RESTORE_SNAPSHOT', snapshot }));
  }
}

export function loadSnapshotFromPlatform<TData>(
  storageType: 'localStorage' | 'sessionStorage' | 'none',
  storageKey: string,
  deserializer?: (raw: string) => PopoverSnapshotData<TData>,
): PopoverSnapshotData<TData> | null {
  const storage = getStorage(storageType);
  if (!storage) return null;
  const raw = storage.getItem(storageKey);
  if (!raw) return null;
  try {
    const parsed: unknown = deserializer ? deserializer(raw) : JSON.parse(raw);
    return isValidSnapshot<TData>(parsed) ? parsed : null;
  } catch (err) {
    logger.error(
      `[popover-trail]: Failed to parse snapshot from ${storageType}:`,
      toError(err),
    );
    return null;
  }

}

export function removeSnapshotFromPlatform(
  storageType: 'localStorage' | 'sessionStorage' | 'none',
  storageKey: string,
): void {
  const storage = getStorage(storageType);
  if (storage) fromThrowable(() => storage.removeItem(storageKey));
}

