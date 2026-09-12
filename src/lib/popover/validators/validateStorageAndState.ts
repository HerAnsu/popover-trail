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

/** PT-117: Validates history snapshot stack capacity. */
export function validateHistoryCapacity(maxHistory: number): void {
  if (!isDevEnv()) return;

  if (!isNumberInRange(maxHistory, 1, 500)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_HISTORY_CAPACITY,
      message: `Invalid maxHistory capacity of ${maxHistory}. Capacity must be a positive integer between 1 and 500.`,
    });
  }
}

/** PT-119: Validates SharedArrayBuffer worker support. */
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

/** PT-120: Validates hydration error states. */
export function validateHydrationError(key: string, error: unknown): void {
  if (!isDevEnv() || !error) return;

  warnDevDetails(true, {
    code: PopoverWarningCode.HYDRATION_ERROR,
    message: `Data resolution for popover key "${key}" rejected with error: ${toError(error).message}.`,
  });
}

/** PT-122: Validates snapshot manager storage keys. */
export function validateStorageKey(storageKey: string): void {
  if (!isDevEnv()) return;

  if (!isNonEmptyString(storageKey)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_STORAGE_KEY,
      message: 'PopoverSnapshotManager storageKey is empty or invalid.',
    });
  }
}

/** PT-124: Validates FSM transition event types. */
export function validateFSMTransitionEvent(eventType: string): void {
  if (!isDevEnv()) return;

  if (!isNonEmptyString(eventType)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_FSM_TRANSITION,
      message: 'FSM reducer received an invalid or undefined state transition event type.',
    });
  }
}
