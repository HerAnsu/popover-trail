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

export function formatPopoverErrorMessage(
  code: PopoverErrorCode,
  message: string,
  remediationHint?: string,
): string {
  return remediationHint
    ? `[popover-trail:${code}] ${message}\n  💡 Remediation Hint: ${remediationHint}`
    : `[popover-trail:${code}] ${message}`;
}
