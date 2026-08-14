export interface DevWarningDetails {
  /** Unique error code identifier. */
  code: string;
  /** Detailed error message describing what went wrong. */
  message: string;
}

declare const process: { env?: Record<string, string | undefined> } | undefined;

const IS_DEV = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

export function isDevEnv(): boolean {
  return IS_DEV;
}

/** Single Source of Truth for logging warnings to console in dev mode */
function emitDevWarning(code: string, message: string): void {
  console.warn(`[popover-trail warning ${code}]: ${message}`);
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
    emitDevWarning(details.code, details.message);
  }
}
