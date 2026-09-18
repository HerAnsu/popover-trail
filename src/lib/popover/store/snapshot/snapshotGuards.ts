/**
 * Snapshot and Multi-Tab Message Guards.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/snapshot/snapshotGuards
 */

import type { PopoverSnapshotData } from './snapshotManagerTypes';
import { isValidSnapshot } from './snapshotSanitizers';
import { isRecordObject } from '../../utils/guards/stringGuards';

export { isValidSnapshot };

export interface SnapshotRestoreMessage<TData = unknown> {
  readonly type: 'POP_RESTORE_SNAPSHOT';
  readonly snapshot: PopoverSnapshotData<TData>;
}

/** Validates whether an unknown payload is a POP_RESTORE_SNAPSHOT broadcast message. */
export function isSnapshotRestoreMessage<TData = unknown>(
  val: unknown,
): val is SnapshotRestoreMessage<TData> {
  if (!isRecordObject(val)) return false;
  return val.type === 'POP_RESTORE_SNAPSHOT' && isValidSnapshot<TData>(val.snapshot);
}
