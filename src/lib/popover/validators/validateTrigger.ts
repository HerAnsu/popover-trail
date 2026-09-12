import type { PopoverPlacement } from '../types';
import { VALID_PLACEMENTS_SET } from '../constants';
import { isUnsafeKey } from '../utils/safeKeys';
import { isNonEmptyString, isNonNegativeFinite, isPopoverPlacement } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/** PT-101: Validates popover key format. */
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

/** PT-102: Validates placement string. */
export function validatePlacement(placement: PopoverPlacement | undefined): void {
  if (!isDevEnv() || !placement) return;

  if (!isPopoverPlacement(placement)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_PLACEMENT,
      message: `Invalid layout placement "${placement}" provided. Supported values are: ${[...VALID_PLACEMENTS_SET].join(', ')}.`,
    });
  }
}

/** PT-103 & PT-104: Validates hover delays. */
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

/** PT-105: Validates parent-child cascade loops. */
export function validateCascadeAncestry(popoverKey: string, parentKey: string | null): void {
  if (!isDevEnv() || !parentKey) return;

  if (popoverKey === parentKey) {
    warnDevDetails(true, {
      code: PopoverWarningCode.CIRCULAR_CASCADE_LOOP,
      message: `Circular cascade loop detected: popoverKey "${popoverKey}" cannot be identical to its parentKey "${parentKey}".`,
    });
  }
}

/** PT-118: Validates trigger action event handlers. */
export function validateTriggerEvent(hasEvent: boolean): void {
  if (!isDevEnv()) return;

  if (!hasEvent) {
    warnDevDetails(true, {
      code: PopoverWarningCode.MISSING_TRIGGER_EVENT,
      message: 'Popover action dispatch called without a valid DOM trigger anchor event.',
    });
  }
}
