/**
 * Error Formatting Utilities for PopoverTrail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/errorFormatting
 */

export const PopoverErrorCode = {
  RESOLVER_TIMEOUT: 'ERR_RESOLVER_TIMEOUT',
  WORKER_CRASHED: 'ERR_WORKER_CRASHED',
  PERSIST_FAILED: 'ERR_PERSIST_FAILED',
  INVALID_TRANSITION: 'ERR_INVALID_TRANSITION',
  CIRCULAR_CASCADE: 'ERR_CIRCULAR_CASCADE',
  UNMOUNTED: 'ERR_UNMOUNTED',
} as const;

export type PopoverErrorCode = (typeof PopoverErrorCode)[keyof typeof PopoverErrorCode];

/**
 * Formats a standardized domain error message string containing error code and optional remediation advice.
 *
 * @param code - Standardized PopoverErrorCode constant.
 * @param message - Descriptive failure message.
 * @param remediationHint - Optional actionable advice on how to resolve the issue.
 * @returns Formatted error string.
 *
 * @example
 * ```typescript
 * formatPopoverErrorMessage(
 *   PopoverErrorCode.CIRCULAR_CASCADE,
 *   'Cycle detected between card-A and card-B',
 *   'Ensure child popover does not open its parent node.',
 * );
 * ```
 */
export function formatPopoverErrorMessage(
  code: PopoverErrorCode,
  message: string,
  remediationHint?: string,
): string {
  return remediationHint
    ? `[popover-trail:${code}] ${message}\n  💡 Remediation Hint: ${remediationHint}`
    : `[popover-trail:${code}] ${message}`;
}
