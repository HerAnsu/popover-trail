/**
 * Cross-Tab Broadcast Synchronization Message Validation Guards.
 *
 * @module utils/guards/syncGuards
 */

import type { TabId } from '../../types/storeTypes';
import { isNonEmptyString, isRecordObject } from './stringGuards';
import { isFiniteNumber } from './numberGuards';

export type PopoverSyncActionType = 'OPEN' | 'CLOSE' | 'PIN' | 'UNPIN' | 'RESET';

export interface PopoverSyncMessage {
  type: PopoverSyncActionType;
  key?: string;
  timestamp: number;
  tabId: string | TabId;
}

const VALID_SYNC_ACTIONS = new Set<string>(['OPEN', 'CLOSE', 'PIN', 'UNPIN', 'RESET']);

/**
 * Type guard verifying if an action string is a valid PopoverSyncActionType.
 */
export function isPopoverSyncActionType(type: unknown): type is PopoverSyncActionType {
  return typeof type === 'string' && VALID_SYNC_ACTIONS.has(type);
}

/**
 * Type guard validating that an untrusted incoming broadcast message conforms
 * to the PopoverSyncMessage envelope schema and is immune to prototype pollution.
 */
export function isPopoverSyncMessage(data: unknown): data is PopoverSyncMessage {
  if (!isRecordObject(data)) return false;

  const { type, key, timestamp, tabId } = data;

  if (!isPopoverSyncActionType(type)) return false;
  if (key !== undefined && !isNonEmptyString(key)) return false;
  if (!isFiniteNumber(timestamp)) return false;
  return isNonEmptyString(tabId);
}
