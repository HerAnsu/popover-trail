import type { PopoverPlacement } from '../types';

export interface DevWarningDetails {
  /** Unique warning code for quick reference. */
  code: string;
  /** Detailed description of what failed or was misused. */
  issue: string;
  /** Actionable, step-by-step guidance on how to resolve the issue. */
  solution: string;
  /** Optional documentation link. */
  docRef?: string;
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
 * Basic development guardrail warning logger.
 */
export function warnDev(condition: boolean, message: string): void {
  if (isDevEnv() && condition) {
    console.warn(`[popover-trail dev warning]: ${message}`);
  }
}

/**
 * Structured development guardrail warning logger with actionable solutions and doc references.
 */
export function warnDevDetails(condition: boolean, details: DevWarningDetails): void {
  if (isDevEnv() && condition) {
    console.warn(
      `[popover-trail warning ${details.code}]: ${details.issue}\n` +
        `  💡 Solution: ${details.solution}` +
        (details.docRef ? `\n  🔗 Docs: ${details.docRef}` : ''),
    );
  }
}

/**
 * Validates a popover key for empty strings or invalid whitespace.
 */
export function validatePopoverKey(key: string | undefined): void {
  if (!isDevEnv()) return;

  if (!key || typeof key !== 'string' || key.trim() === '') {
    warnDevDetails(true, {
      code: 'PT-101',
      issue: 'A popover trigger or card received an empty or invalid "popoverKey" prop.',
      solution:
        'Provide a non-empty string identifier (e.g. key="user-profile") or use typed schema keys with createPopoverSchema.',
    });
  }
}

/**
 * Validates layout placement string against Floating-UI / Popover allowed placements.
 */
export function validatePlacement(placement: PopoverPlacement | undefined): void {
  if (!isDevEnv() || !placement) return;

  if (!VALID_PLACEMENTS.has(placement)) {
    warnDevDetails(true, {
      code: 'PT-102',
      issue: `Invalid placement value "${placement}" provided.`,
      solution: `Use one of the supported placements: ${Array.from(VALID_PLACEMENTS).join(', ')}.`,
    });
  }
}

/**
 * Validates hover delay configuration values.
 */
export function validateHoverDelays(openDelay?: number, closeDelay?: number): void {
  if (!isDevEnv()) return;

  if (openDelay !== undefined && (openDelay < 0 || openDelay > 30000)) {
    warnDevDetails(true, {
      code: 'PT-103',
      issue: `Unusual hover openDelay of ${openDelay}ms configured.`,
      solution: 'Configure openDelay between 0ms and 5000ms for optimal user responsiveness.',
    });
  }

  if (closeDelay !== undefined && (closeDelay < 0 || closeDelay > 30000)) {
    warnDevDetails(true, {
      code: 'PT-104',
      issue: `Unusual hover closeDelay of ${closeDelay}ms configured.`,
      solution: 'Configure closeDelay between 0ms and 5000ms to prevent sticky popup trails.',
    });
  }
}

/**
 * Validates parent-child cascade ancestry to prevent circular recursion.
 */
export function validateCascadeAncestry(popoverKey: string, parentKey: string | null): void {
  if (!isDevEnv() || !parentKey) return;

  if (popoverKey === parentKey) {
    warnDevDetails(true, {
      code: 'PT-105',
      issue: `Circular cascade loop detected: popoverKey "${popoverKey}" matches parentKey "${parentKey}".`,
      solution:
        'Ensure nested popovers open a distinct key different from their immediate parent container.',
    });
  }
}
