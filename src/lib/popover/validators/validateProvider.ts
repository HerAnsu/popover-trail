import { isNonNegativeFinite, isNumberInRange, isRecordObject } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/**
 * Validates whether the cascade offset step falls within a reasonable pixel range (0 to 200px).
 * Emits dev warning `PT-109` if value is out of bounds.
 *
 * @param step - Cascade offset step in pixels.
 *
 * @example
 * ```typescript
 * validateCascadeStep(16); // Valid
 * validateCascadeStep(300); // Emits PT-109 warning in development
 * ```
 */
export function validateCascadeStep(step: number | undefined): void {
  if (isDevEnv() && step !== undefined && !isNumberInRange(step, 0, 200)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_CASCADE_OFFSET_STEP,
      message: `Cascade offset step of ${step}px is outside valid range (0px to 200px).`,
    });
  }
}

/**
 * Validates default offset gap between anchor trigger and popover (0 to 500px).
 * Emits dev warning `PT-110` if value is out of bounds.
 *
 * @param offset - Offset distance in pixels.
 *
 * @example
 * ```typescript
 * validateDefaultOffset(8); // Valid
 * validateDefaultOffset(-10); // Emits PT-110 warning in development
 * ```
 */
export function validateDefaultOffset(offset: number | undefined): void {
  if (isDevEnv() && offset !== undefined && !isNumberInRange(offset, 0, 500)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_DEFAULT_OFFSET,
      message: `Default offset gap of ${offset}px is outside valid range (0px to 500px).`,
    });
  }
}

/**
 * Validates base z-index stacking depth.
 * Emits dev warning `PT-111` if value is non-finite or negative.
 *
 * @param zIndex - Base stacking order number.
 *
 * @example
 * ```typescript
 * validateBaseZIndex(1000); // Valid
 * validateBaseZIndex(-5); // Emits PT-111 warning in development
 * ```
 */
export function validateBaseZIndex(zIndex: number | undefined): void {
  if (isDevEnv() && zIndex !== undefined && !isNonNegativeFinite(zIndex)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_BASE_Z_INDEX,
      message: `Base z-index of ${zIndex} is invalid (must be a positive number).`,
    });
  }
}

/**
 * Validates exit transition animation duration (0ms to 10000ms).
 * Emits dev warning `PT-112` if duration is out of range.
 *
 * @param duration - Duration in milliseconds.
 *
 * @example
 * ```typescript
 * validateExitDuration(200); // Valid
 * validateExitDuration(20000); // Emits PT-112 warning in development
 * ```
 */
export function validateExitDuration(duration: number | undefined): void {
  if (isDevEnv() && duration !== undefined && !isNumberInRange(duration, 0, 10000)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_EXIT_TRANSITION_DURATION,
      message: `Exit transition duration of ${duration}ms is outside valid range (0ms to 10000ms).`,
    });
  }
}

/**
 * Validates provider resolver initialization.
 * Emits dev warning `PT-113` if `<PopoverProvider>` lacks both `resolveData` and `schema`.
 *
 * @param hasResolver - Whether a data resolver or schema is configured.
 *
 * @example
 * ```typescript
 * validateProviderResolver(Boolean(props.resolveData || props.schema));
 * ```
 */
export function validateProviderResolver(hasResolver: boolean): void {
  if (isDevEnv() && !hasResolver) {
    warnDevDetails(true, {
      code: PopoverWarningCode.MISSING_RESOLVER_OR_SCHEMA,
      message:
        '<PopoverProvider> was instantiated without a "resolveData" callback or "schema" prop.',
    });
  }
}

/**
 * Validates current cascading stack depth against ergonomic limits (<= 10).
 * Emits dev warning `PT-115` if depth is excessively high.
 *
 * @param depth - Current nesting level depth integer.
 *
 * @example
 * ```typescript
 * validateCascadeDepth(currentDepth);
 * ```
 */
export function validateCascadeDepth(depth: number): void {
  if (isDevEnv() && depth > 10) {
    warnDevDetails(true, {
      code: PopoverWarningCode.CASCADE_DEPTH_EXCEEDED,
      message: `Deep popover cascade stack detected (depth = ${depth}). High cascade depth may impair UI usability.`,
    });
  }
}

/**
 * Validates that `createPopoverTrail()` is called at module level, not during a render pass.
 * Emits dev warning `PT-126` if called inside a React component render.
 *
 * @param isInsideRender - True if invoked during component execution.
 *
 * @example
 * ```typescript
 * validateFactoryPlacement(isInsideComponentRender);
 * ```
 */
export function validateFactoryPlacement(isInsideRender?: boolean): void {
  if (isDevEnv() && isInsideRender) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_FACTORY_PLACEMENT,
      message:
        'createPopoverTrail() should be called at top-level module scope, not inside a React component render pass.',
    });
  }
}

/**
 * Validates store instance passed to `createPopoverController`.
 * Emits dev warning `PT-127` if store is nullish or missing `.getState()`.
 *
 * @param store - Candidate store instance.
 *
 * @example
 * ```typescript
 * validateStoreControllerInstance(store);
 * ```
 */
export function validateStoreControllerInstance(store: unknown): void {
  if (isDevEnv() && (!isRecordObject(store) || typeof store.getState !== 'function')) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_STORE_INSTANCE,
      message: 'createPopoverController() received an invalid or undefined Zustand store instance.',
    });
  }
}

