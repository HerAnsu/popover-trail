/**
 * Store-Internal Protocol Constants for popover-trail.
 * Identifiers shared between slices, the resolver pipeline, and lifecycle services
 * that must never drift apart silently.
 *
 * @module store/constants
 */

/**
 * Synthetic controller key reserving the root AbortController slot,
 * kept out of the user popover-key namespace by its dunder prefix.
 */
export const ROOT_CONTROLLER_KEY = '__root__';

/** Fallback owner identifier when a resolver action is opened without an explicit owner. */
export const DEFAULT_OWNER_ID = 'default';

/** `Error.name` value produced when an operation is cancelled through its AbortSignal. */
export const ABORT_ERROR_NAME = 'AbortError';
