/**
 * Unique Identifier & Session Generator Utility for popover-trail.
 *
 * @module utils/uuid
 */

/**
 * Generates a cryptographically strong UUID v4 or random fallback string
 * suitable for tab sessions and transient keys.
 *
 * @returns Unique tab/session ID string.
 *
 * @example
 * ```typescript
 * const tabId = generateTabId();
 * // => '3b241101-e2bb-4255-8caf-4136c566a964'
 * ```
 */
export function generateTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 9);
}
