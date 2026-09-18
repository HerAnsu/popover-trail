/**
 * Type Guards for Store Action Command Payloads.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/guards/actionGuards
 */

import {
  type StoreActionPayload,
  type StoreActionType,
  STORE_ACTION_TYPES,
} from '../../types/actions/actionPayloads';
import { isPlainObject } from '../../utils/guards/objectGuards';

const ACTION_TYPES: ReadonlySet<string> = new Set<string>(STORE_ACTION_TYPES);

const CLOSE_TYPES: ReadonlySet<string> = new Set<string>([
  'CLOSE_BY_KEY',
  'CLOSE_FROM',
  'CLOSE_TOPMOST',
  'CLOSE_ALL',
  'CLEAR_TRAIL',
]);

const RESOLVE_TYPES: ReadonlySet<string> = new Set<string>([
  'RESOLVE_START',
  'RESOLVE_SUCCESS',
  'RESOLVE_ERROR',
]);

/** Validates that an unknown candidate is a well-formed StoreActionPayload. */
export function isStoreActionPayload(val: unknown): val is StoreActionPayload {
  return isPlainObject(val) && typeof val.type === 'string' && ACTION_TYPES.has(val.type);
}

/** Internal predicate matching a StoreActionPayload against an action type. */
function matchesStoreAction<T extends StoreActionType>(
  action: unknown,
  type: T,
): action is Extract<StoreActionPayload, { type: T }> {
  return isStoreActionPayload(action) && action.type === type;
}

/** Type guard for OPEN_ROOT action. */
export function isOpenRootAction(
  action: unknown,
): action is Extract<StoreActionPayload, { type: 'OPEN_ROOT' }> {
  return matchesStoreAction(action, 'OPEN_ROOT');
}

/** Type guard for PUSH_NESTED action. */
export function isPushNestedAction(
  action: unknown,
): action is Extract<StoreActionPayload, { type: 'PUSH_NESTED' }> {
  return matchesStoreAction(action, 'PUSH_NESTED');
}

/** Type guard for any closing/clearing action variant. */
export function isCloseAction(
  action: unknown,
): action is Extract<
  StoreActionPayload,
  { type: 'CLOSE_BY_KEY' | 'CLOSE_FROM' | 'CLOSE_TOPMOST' | 'CLOSE_ALL' | 'CLEAR_TRAIL' }
> {
  return isStoreActionPayload(action) && CLOSE_TYPES.has(action.type);
}

/** Type guard for TOGGLE_PIN action. */
export function isTogglePinAction(
  action: unknown,
): action is Extract<StoreActionPayload, { type: 'TOGGLE_PIN' }> {
  return matchesStoreAction(action, 'TOGGLE_PIN');
}

/** Type guard for UPDATE_OFFSET action. */
export function isUpdateOffsetAction(
  action: unknown,
): action is Extract<StoreActionPayload, { type: 'UPDATE_OFFSET' }> {
  return matchesStoreAction(action, 'UPDATE_OFFSET');
}

/** Type guard for any resolution lifecycle action. */
export function isResolveAction(
  action: unknown,
): action is Extract<
  StoreActionPayload,
  { type: 'RESOLVE_START' | 'RESOLVE_SUCCESS' | 'RESOLVE_ERROR' }
> {
  return isStoreActionPayload(action) && RESOLVE_TYPES.has(action.type);
}
