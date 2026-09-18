import type { PopoverPlacement } from '../types';
import { VALID_PLACEMENTS_SET } from '../constants';
import { isUnsafeKey } from '../utils/safeKeys';
import { isNonEmptyString, isNonNegativeFinite, isPopoverPlacement } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/**
 * Validates a popover key format and guards against prototype pollution / unsafe property names.
 * Emits dev warning `PT-101` if key is missing, empty, or an unsafe JS identifier (e.g. `__proto__`, `constructor`).
 *
 * @param key - Popover key to validate.
 *
 * @example
 * ```typescript
 * validatePopoverKey('user-card'); // Valid
 * validatePopoverKey('__proto__'); // Emits PT-101 warning in development
 * validatePopoverKey(''); // Emits PT-101 warning in development
 * ```
 */
export function validatePopoverKey(key: string | undefined): void {
  if (!isDevEnv()) return;

  if (!isNonEmptyString(key)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_POPOVER_KEY,
      message: 'Popover key is missing, null, or consists entirely of whitespace.',
    });
    return;
  }

  if (isUnsafeKey(key)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_POPOVER_KEY,
      message: `Unsafe JavaScript property name "${key}" cannot be used as a popover key.`,
    });
  }
}

/**
 * Validates whether the given placement string is a recognized Floating UI placement.
 * Emits dev warning `PT-102` if placement is invalid.
 *
 * @param placement - Placement string to check (e.g. 'bottom-start', 'top').
 *
 * @example
 * ```typescript
 * validatePlacement('bottom-start'); // Valid
 * validatePlacement('center' as any); // Emits PT-102 warning in development
 * ```
 */
export function validatePlacement(placement: PopoverPlacement | undefined): void {
  if (!isDevEnv() || !placement) return;

  if (!isPopoverPlacement(placement)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_PLACEMENT,
      message: `Invalid layout placement "${placement}" provided. Supported values are: ${[...VALID_PLACEMENTS_SET].join(', ')}.`,
    });
  }
}

/**
 * Validates hover open and close delay durations in milliseconds.
 * Emits dev warnings `PT-103` (open delay) and `PT-104` (close delay) if non-finite or exceeding 30,000ms.
 *
 * @param openDelay - Delay in ms before opening on hover.
 * @param closeDelay - Delay in ms before closing on hover leave.
 *
 * @example
 * ```typescript
 * validateHoverDelays(200, 300); // Valid
 * validateHoverDelays(-10, 50000); // Emits PT-103 and PT-104 warnings in development
 * ```
 */
export function validateHoverDelays(openDelay?: number, closeDelay?: number): void {
  if (!isDevEnv()) return;

  if (openDelay !== undefined && (!isNonNegativeFinite(openDelay) || openDelay > 30000)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_HOVER_OPEN_DELAY,
      message: `Hover openDelay of ${openDelay}ms is outside valid range (0ms to 30000ms).`,
    });
  }

  if (closeDelay !== undefined && (!isNonNegativeFinite(closeDelay) || closeDelay > 30000)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_HOVER_CLOSE_DELAY,
      message: `Hover closeDelay of ${closeDelay}ms is outside valid range (0ms to 30000ms).`,
    });
  }
}

/**
 * Validates that a popover does not declare itself as its own parent, avoiding circular cascade recursion.
 * Emits dev warning `PT-105` if `popoverKey` matches `parentKey`.
 *
 * @param popoverKey - Current popover identifier.
 * @param parentKey - Parent popover identifier, or null if root.
 *
 * @example
 * ```typescript
 * validateCascadeAncestry('child-popover', 'root-popover'); // Valid
 * validateCascadeAncestry('popover-1', 'popover-1'); // Emits PT-105 warning in development
 * ```
 */
export function validateCascadeAncestry(popoverKey: string, parentKey: string | null): void {
  if (!isDevEnv() || !parentKey) return;

  if (popoverKey === parentKey) {
    warnDevDetails(true, {
      code: PopoverWarningCode.CIRCULAR_CASCADE_LOOP,
      message: `Circular cascade loop detected: popoverKey "${popoverKey}" cannot be identical to its parentKey "${parentKey}".`,
    });
  }
}

/**
 * Validates that a popover trigger action handler was dispatched with a valid DOM event.
 * Emits dev warning `PT-118` if trigger event is missing.
 *
 * @param hasEvent - Whether a trigger event was supplied.
 *
 * @example
 * ```typescript
 * validateTriggerEvent(Boolean(event));
 * ```
 */
export function validateTriggerEvent(hasEvent: boolean): void {
  if (!isDevEnv()) return;

  if (!hasEvent) {
    warnDevDetails(true, {
      code: PopoverWarningCode.MISSING_TRIGGER_EVENT,
      message: 'Popover action dispatch called without a valid DOM trigger anchor event.',
    });
  }
}
