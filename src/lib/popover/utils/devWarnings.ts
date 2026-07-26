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
