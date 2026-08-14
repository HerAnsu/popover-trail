import { toError } from '../utils/storeHelpers';
import { isDevEnv, warnDevDetails } from './warningEngine';

/** PT-108: Validates schema key presence. */
export function validateSchemaKey(hasKey: boolean, key: string): void {
  if (!isDevEnv()) return;

  if (!hasKey || !key || typeof key !== 'string' || key.trim() === '') {
    warnDevDetails(true, {
      code: 'PT-108',
      message: `Attempted to resolve data for key "${key}" which is not defined in the schema.`,
    });
  }
}

/** PT-114: Validates drag offset coordinates. */
export function validateDragOffset(x: number, y: number): void {
  if (!isDevEnv()) return;

  if (Number.isNaN(x) || Number.isNaN(y) || Math.abs(x) > 10000 || Math.abs(y) > 10000) {
    warnDevDetails(true, {
      code: 'PT-114',
      message: `Invalid drag offset coordinates (${x}, ${y}) received. Offsets must be valid numbers within [-10000, 10000].`,
    });
  }
}

/** PT-116: Validates stack group filter string. */
export function validateStackGroup(stackGroup: string | null | undefined): void {
  if (!isDevEnv() || stackGroup === null || stackGroup === undefined) return;

  if (typeof stackGroup !== 'string' || stackGroup.trim() === '') {
    warnDevDetails(true, {
      code: 'PT-116',
      message: 'Stack group ID filter is an empty string or whitespace.',
    });
  }
}

/** PT-117: Validates history snapshot stack capacity. */
export function validateHistoryCapacity(maxHistory: number): void {
  if (!isDevEnv()) return;

  if (typeof maxHistory !== 'number' || maxHistory <= 0 || maxHistory > 500) {
    warnDevDetails(true, {
      code: 'PT-117',
      message: `Invalid maxHistory capacity of ${maxHistory}. Capacity must be a positive integer between 1 and 500.`,
    });
  }
}

/** PT-119: Validates SharedArrayBuffer worker support. */
export function validateSharedMemorySupport(useSharedMemory?: boolean): void {
  if (!isDevEnv() || !useSharedMemory) return;

  if (typeof SharedArrayBuffer === 'undefined') {
    warnDevDetails(true, {
      code: 'PT-119',
      message:
        'useSharedMemory was requested, but SharedArrayBuffer is not supported or cross-origin isolated in this browser environment.',
    });
  }
}

/** PT-120: Validates hydration error states. */
export function validateHydrationError(key: string, error: unknown): void {
  if (!isDevEnv() || !error) return;

  warnDevDetails(true, {
    code: 'PT-120',
    message: `Data resolution for popover key "${key}" rejected with error: ${toError(error).message}.`,
  });
}

/** PT-121: Validates pin drag state logic. */
export function validatePinDragState(isPinned: boolean, allowDragWhenUnpinned?: boolean): void {
  if (!isDevEnv()) return;

  if (!isPinned && allowDragWhenUnpinned === false) {
    warnDevDetails(true, {
      code: 'PT-121',
      message: 'Drag action attempted on an unpinned popover card that disables unpinned dragging.',
    });
  }
}

/** PT-122: Validates snapshot manager storage keys. */
export function validateStorageKey(storageKey: string): void {
  if (!isDevEnv()) return;

  if (!storageKey || typeof storageKey !== 'string' || storageKey.trim() === '') {
    warnDevDetails(true, {
      code: 'PT-122',
      message: 'PopoverSnapshotManager storageKey is empty or invalid.',
    });
  }
}

/** PT-123: Validates QuadTree spatial bounding box dimensions. */
export function validateQuadTreeBounds(width: number, height: number): void {
  if (!isDevEnv()) return;

  if (Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
    warnDevDetails(true, {
      code: 'PT-123',
      message: `QuadTree spatial index received invalid non-positive dimensions (${width}x${height}).`,
    });
  }
}

/** PT-124: Validates FSM transition event types. */
export function validateFSMTransitionEvent(eventType: string): void {
  if (!isDevEnv()) return;

  if (!eventType || typeof eventType !== 'string') {
    warnDevDetails(true, {
      code: 'PT-124',
      message: 'FSM reducer received an invalid or undefined state transition event type.',
    });
  }
}

/** PT-128: Validates schema circular child definitions. */
export function validateSchemaCircularChild(parentKey: string, childKey: string): void {
  if (!isDevEnv()) return;

  if (parentKey === childKey) {
    warnDevDetails(true, {
      code: 'PT-128',
      message: `Schema node "${parentKey}" declares itself as a direct child, which creates a circular render loop.`,
    });
  }
}

/** PT-129: Validates resolver timeout duration. */
export function validateResolverTimeout(durationMs: number, key: string): void {
  if (!isDevEnv()) return;

  if (durationMs > 5000) {
    warnDevDetails(true, {
      code: 'PT-129',
      message: `Resolver for key "${key}" has taken longer than ${durationMs}ms to resolve. Ensure AbortSignal is handled.`,
    });
  }
}
