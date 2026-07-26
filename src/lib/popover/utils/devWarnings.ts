/**
 * Development guardrail warning utility.
 * Logs friendly developer guidance warnings in non-production environments.
 *
 * @param condition - If true, issues the console warning.
 * @param message - The descriptive warning message detailing the issue and solution.
 */
export function warnDev(condition: boolean, message: string): void {
  const isDev =
    typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV !== 'production';

  if (isDev && condition) {
    console.warn(`[popover-trail dev warning]: ${message}`);
  }
}
