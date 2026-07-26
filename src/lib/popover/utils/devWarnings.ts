import type { PopoverPlacement } from '../types';

export interface DevWarningDetails {
  /** Unique error code identifier. */
  code: string;
  /** Detailed error message describing what went wrong. */
  message: string;
}

const VALID_PLACEMENTS: ReadonlySet<string> = new Set([
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
  'auto',
]);

/**
 * Checks if the current environment is a development environment.
 */
export function isDevEnv(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV !== 'production'
  );
}

/**
 * Development guardrail warning logger.
 */
export function warnDev(condition: boolean, message: string): void {
  if (isDevEnv() && condition) {
    console.warn(`[popover-trail dev warning]: ${message}`);
  }
}

/**
 * Structured error logger with code and detailed message.
 */
export function warnDevDetails(condition: boolean, details: DevWarningDetails): void {
  if (isDevEnv() && condition) {
    console.warn(`[popover-trail warning ${details.code}]: ${details.message}`);
  }
}

/** PT-101: Validates popover key format. */
export function validatePopoverKey(key: string | undefined): void {
  if (!isDevEnv()) return;

  if (!key || typeof key !== 'string' || key.trim() === '') {
    warnDevDetails(true, {
      code: 'PT-101',
      message: 'Popover key is missing, null, or consists entirely of whitespace.',
    });
  }
}

/** PT-102: Validates placement string. */
export function validatePlacement(placement: PopoverPlacement | undefined): void {
  if (!isDevEnv() || !placement) return;

  if (!VALID_PLACEMENTS.has(placement)) {
    warnDevDetails(true, {
      code: 'PT-102',
      message: `Invalid layout placement "${placement}" provided. Supported values are: ${Array.from(VALID_PLACEMENTS).join(', ')}.`,
    });
  }
}

/** PT-103 & PT-104: Validates hover delays. */
export function validateHoverDelays(openDelay?: number, closeDelay?: number): void {
  if (!isDevEnv()) return;

  if (openDelay !== undefined && (openDelay < 0 || openDelay > 30000)) {
    warnDevDetails(true, {
      code: 'PT-103',
      message: `Hover openDelay of ${openDelay}ms is outside valid range (0ms to 30000ms).`,
    });
  }

  if (closeDelay !== undefined && (closeDelay < 0 || closeDelay > 30000)) {
    warnDevDetails(true, {
      code: 'PT-104',
      message: `Hover closeDelay of ${closeDelay}ms is outside valid range (0ms to 30000ms).`,
    });
  }
}

/** PT-105: Validates parent-child cascade loops. */
export function validateCascadeAncestry(popoverKey: string, parentKey: string | null): void {
  if (!isDevEnv() || !parentKey) return;

  if (popoverKey === parentKey) {
    warnDevDetails(true, {
      code: 'PT-105',
      message: `Circular cascade loop detected: popoverKey "${popoverKey}" cannot be identical to its parentKey "${parentKey}".`,
    });
  }
}

/** PT-106: Validates card sub-component context placement. */
export function validateCardSubComponentScope(hasContext: boolean, subComponentName: string): void {
  if (!isDevEnv()) return;

  if (!hasContext) {
    warnDevDetails(true, {
      code: 'PT-106',
      message: `<PopoverCard.${subComponentName}> was rendered outside of a <PopoverCard> container.`,
    });
  }
}

/** PT-107: Validates timeline sub-component context placement. */
export function validateTimelineSubComponentScope(
  hasContext: boolean,
  subComponentName: string,
): void {
  if (!isDevEnv()) return;

  if (!hasContext) {
    warnDevDetails(true, {
      code: 'PT-107',
      message: `<PopoverTimeline.${subComponentName}> was rendered outside of a <PopoverTimeline> container.`,
    });
  }
}

/** PT-108: Validates schema key presence. */
export function validateSchemaKey(hasKey: boolean, key: string): void {
  if (!isDevEnv()) return;

  if (!hasKey) {
    warnDevDetails(true, {
      code: 'PT-108',
      message: `Attempted to resolve data for key "${key}" which is not defined in the schema.`,
    });
  }
}

/** PT-109: Validates cascade offset step. */
export function validateCascadeStep(step: number | undefined): void {
  if (!isDevEnv() || step === undefined) return;

  if (typeof step !== 'number' || step < 0 || step > 200) {
    warnDevDetails(true, {
      code: 'PT-109',
      message: `Cascade offset step of ${step}px is outside valid range (0px to 200px).`,
    });
  }
}

/** PT-110: Validates default offset gap. */
export function validateDefaultOffset(offset: number | undefined): void {
  if (!isDevEnv() || offset === undefined) return;

  if (typeof offset !== 'number' || offset < 0 || offset > 500) {
    warnDevDetails(true, {
      code: 'PT-110',
      message: `Default offset gap of ${offset}px is outside valid range (0px to 500px).`,
    });
  }
}

/** PT-111: Validates base z-index. */
export function validateBaseZIndex(zIndex: number | undefined): void {
  if (!isDevEnv() || zIndex === undefined) return;

  if (typeof zIndex !== 'number' || zIndex < 0) {
    warnDevDetails(true, {
      code: 'PT-111',
      message: `Base z-index of ${zIndex} is invalid (must be a positive number).`,
    });
  }
}

/** PT-112: Validates exit transition duration. */
export function validateExitDuration(duration: number | undefined): void {
  if (!isDevEnv() || duration === undefined) return;

  if (typeof duration !== 'number' || duration < 0 || duration > 10000) {
    warnDevDetails(true, {
      code: 'PT-112',
      message: `Exit transition duration of ${duration}ms is outside valid range (0ms to 10000ms).`,
    });
  }
}

/** PT-113: Validates provider resolver initialization. */
export function validateProviderResolver(hasResolver: boolean): void {
  if (!isDevEnv()) return;

  if (!hasResolver) {
    warnDevDetails(true, {
      code: 'PT-113',
      message:
        '<PopoverProvider> was instantiated without a "resolveData" callback or "schema" prop.',
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

/** PT-115: Validates maximum cascade depth. */
export function validateCascadeDepth(depth: number): void {
  if (!isDevEnv()) return;

  if (depth > 10) {
    warnDevDetails(true, {
      code: 'PT-115',
      message: `Deep popover cascade stack detected (depth = ${depth}). High cascade depth may impair UI usability.`,
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

/** PT-118: Validates trigger action event handlers. */
export function validateTriggerEvent(hasEvent: boolean): void {
  if (!isDevEnv()) return;

  if (!hasEvent) {
    warnDevDetails(true, {
      code: 'PT-118',
      message: 'Popover action dispatch called without a valid DOM trigger anchor event.',
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
    message: `Data resolution for popover key "${key}" rejected with error: ${error instanceof Error ? error.message : String(error)}.`,
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

/** PT-125: Validates portal container DOM node existence. */
export function validatePortalContainer(container: Element | null): void {
  if (!isDevEnv()) return;

  if (!container) {
    warnDevDetails(true, {
      code: 'PT-125',
      message: '<PopoverPortal> target container DOM node is null or unmounted.',
    });
  }
}
