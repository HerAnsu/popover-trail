import { isNonNegativeFinite, isNumberInRange, isRecordObject } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/** PT-109: Validates cascade offset step. */
export function validateCascadeStep(step: number | undefined): void {
  if (isDevEnv() && step !== undefined && !isNumberInRange(step, 0, 200)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_CASCADE_OFFSET_STEP,
      message: `Cascade offset step of ${step}px is outside valid range (0px to 200px).`,
    });
  }
}

/** PT-110: Validates default offset gap. */
export function validateDefaultOffset(offset: number | undefined): void {
  if (isDevEnv() && offset !== undefined && !isNumberInRange(offset, 0, 500)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_DEFAULT_OFFSET,
      message: `Default offset gap of ${offset}px is outside valid range (0px to 500px).`,
    });
  }
}

/** PT-111: Validates base z-index. */
export function validateBaseZIndex(zIndex: number | undefined): void {
  if (isDevEnv() && zIndex !== undefined && !isNonNegativeFinite(zIndex)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_BASE_Z_INDEX,
      message: `Base z-index of ${zIndex} is invalid (must be a positive number).`,
    });
  }
}

/** PT-112: Validates exit transition duration. */
export function validateExitDuration(duration: number | undefined): void {
  if (isDevEnv() && duration !== undefined && !isNumberInRange(duration, 0, 10000)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_EXIT_TRANSITION_DURATION,
      message: `Exit transition duration of ${duration}ms is outside valid range (0ms to 10000ms).`,
    });
  }
}

/** PT-113: Validates provider resolver initialization. */
export function validateProviderResolver(hasResolver: boolean): void {
  if (isDevEnv() && !hasResolver) {
    warnDevDetails(true, {
      code: PopoverWarningCode.MISSING_RESOLVER_OR_SCHEMA,
      message:
        '<PopoverProvider> was instantiated without a "resolveData" callback or "schema" prop.',
    });
  }
}

/** PT-115: Validates maximum cascade depth. */
export function validateCascadeDepth(depth: number): void {
  if (isDevEnv() && depth > 10) {
    warnDevDetails(true, {
      code: PopoverWarningCode.CASCADE_DEPTH_EXCEEDED,
      message: `Deep popover cascade stack detected (depth = ${depth}). High cascade depth may impair UI usability.`,
    });
  }
}

/** PT-126: Validates createPopoverTrail factory placement. */
export function validateFactoryPlacement(isInsideRender?: boolean): void {
  if (isDevEnv() && isInsideRender) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_FACTORY_PLACEMENT,
      message:
        'createPopoverTrail() should be called at top-level module scope, not inside a React component render pass.',
    });
  }
}

/** PT-127: Validates store instance provided to createPopoverController. */
export function validateStoreControllerInstance(store: unknown): void {
  if (isDevEnv() && (!isRecordObject(store) || typeof store.getState !== 'function')) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_STORE_INSTANCE,
      message: 'createPopoverController() received an invalid or undefined Zustand store instance.',
    });
  }
}
