import { toError } from '../utils/storeHelpers';
import { isNonEmptyString, isNumberInRange } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

export {
  validateDragOffset,
  validateStackGroup,
  validatePinDragState,
  validateQuadTreeBounds,
} from './validateSpatial';

export {
  validateSchemaKey,
  validateSchemaCircularChild,
  validateResolverTimeout,
} from './validateSchema';

/**
 * Validates history undo/redo capacity limit.
 * Emits dev warning `PT-117` if `maxHistory` is not an integer between 1 and 500.
 *
 * @param maxHistory - Maximum number of historical snapshots retained.
 *
 * @example
 * ```typescript
 * validateHistoryCapacity(50); // Valid
 * validateHistoryCapacity(1000); // Emits PT-117 warning in development
 * ```
 */
export function validateHistoryCapacity(maxHistory: number): void {
  if (!isDevEnv()) return;

  if (!isNumberInRange(maxHistory, 1, 500)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_HISTORY_CAPACITY,
      message: `Invalid maxHistory capacity of ${maxHistory}. Capacity must be a positive integer between 1 and 500.`,
    });
  }
}

/**
 * Validates browser runtime support for `SharedArrayBuffer` when shared memory mode is enabled.
 * Emits dev warning `PT-119` if `SharedArrayBuffer` is undefined or not cross-origin isolated.
 *
 * @param useSharedMemory - Whether shared memory worker mode was requested.
 *
 * @example
 * ```typescript
 * validateSharedMemorySupport(options.useSharedMemory);
 * ```
 */
export function validateSharedMemorySupport(useSharedMemory?: boolean): void {
  if (!isDevEnv() || !useSharedMemory) return;

  if (typeof SharedArrayBuffer === 'undefined') {
    warnDevDetails(true, {
      code: PopoverWarningCode.SHARED_MEMORY_UNSUPPORTED,
      message:
        'useSharedMemory was requested, but SharedArrayBuffer is not supported or cross-origin isolated in this browser environment.',
    });
  }
}

/**
 * Validates and logs errors encountered during popover data hydration.
 * Emits dev warning `PT-120` with formatted error message.
 *
 * @param key - Popover identifier that failed hydration.
 * @param error - Error object or rejection reason.
 *
 * @example
 * ```typescript
 * validateHydrationError('user-card', new Error('Network timeout'));
 * ```
 */
export function validateHydrationError(key: string, error: unknown): void {
  if (!isDevEnv() || !error) return;

  warnDevDetails(true, {
    code: PopoverWarningCode.HYDRATION_ERROR,
    message: `Data resolution for popover key "${key}" rejected with error: ${toError(error).message}.`,
  });
}

/**
 * Validates persistence storage key identifier string.
 * Emits dev warning `PT-122` if storageKey is empty or whitespace.
 *
 * @param storageKey - Storage identifier for snapshot manager.
 *
 * @example
 * ```typescript
 * validateStorageKey('popover-history-v1'); // Valid
 * validateStorageKey(''); // Emits PT-122 warning in development
 * ```
 */
export function validateStorageKey(storageKey: string): void {
  if (!isDevEnv()) return;

  if (!isNonEmptyString(storageKey)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_STORAGE_KEY,
      message: 'PopoverSnapshotManager storageKey is empty or invalid.',
    });
  }
}

/**
 * Validates FSM transition event type string.
 * Emits dev warning `PT-124` if eventType is empty or non-string.
 *
 * @param eventType - Transition action type name.
 *
 * @example
 * ```typescript
 * validateFSMTransitionEvent('OPEN'); // Valid
 * validateFSMTransitionEvent(''); // Emits PT-124 warning in development
 * ```
 */
export function validateFSMTransitionEvent(eventType: string): void {
  if (!isDevEnv()) return;

  if (!isNonEmptyString(eventType)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_FSM_TRANSITION,
      message: 'FSM reducer received an invalid or undefined state transition event type.',
    });
  }
}
