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
 */
export function generateTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}
