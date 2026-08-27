import type { PopoverPlacement } from '../types';
import { VALID_PLACEMENTS_SET } from '../constants';
import { isUnsafeKey } from '../utils/safeKeys';
import { isDevEnv, warnDevDetails } from './warningEngine';

/** PT-101: Validates popover key format. */
export function validatePopoverKey(key: string | undefined): void {
  if (!isDevEnv()) return;

  if (!key || typeof key !== 'string' || key.trim() === '') {
    warnDevDetails(true, {
      code: 'PT-101',
      message: 'Popover key is missing, null, or consists entirely of whitespace.',
    });
    return;
  }

  if (isUnsafeKey(key)) {
    warnDevDetails(true, {
      code: 'PT-101',
      message: `Unsafe JavaScript property name "${key}" cannot be used as a popover key.`,
    });
  }
}

/** PT-102: Validates placement string. */
export function validatePlacement(placement: PopoverPlacement | undefined): void {
  if (!isDevEnv() || !placement) return;

  if (!VALID_PLACEMENTS_SET.has(placement)) {
    warnDevDetails(true, {
      code: 'PT-102',
      message: `Invalid layout placement "${placement}" provided. Supported values are: ${[...VALID_PLACEMENTS_SET].join(', ')}.`,
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
