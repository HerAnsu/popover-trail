/**
 * Popover Lifecycle & Transition Status Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/lifecycleGuards
 */

import {
  type PopoverTransitionStatus,
  type TrailEntryBase,
  POPOVER_TRANSITION_STATUSES,
} from '../../types/entry';

const TRANSITION_STATUSES: ReadonlySet<string> = new Set<string>(POPOVER_TRANSITION_STATUSES);

/**
 * Validates whether an unknown value is a valid PopoverTransitionStatus.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is 'idle', 'mounting', 'mounted', or 'unmounting'.
 *
 * @example
 * ```typescript
 * isTransitionStatus('mounted'); // => true
 * isTransitionStatus('unknown'); // => false
 * ```
 */
export function isTransitionStatus(val: unknown): val is PopoverTransitionStatus {
  return typeof val === 'string' && TRANSITION_STATUSES.has(val);
}

/**
 * Checks whether a popover entry is currently in the mounted transition state.
 *
 * @template T - Entry type extending TrailEntryBase.
 * @param entry - Candidate entry object.
 * @returns True if `entry.transitionStatus === 'mounted'`.
 *
 * @example
 * ```typescript
 * if (isMountedEntry(entry)) {
 *   // Safe to trigger child cascades or interactive animations
 * }
 * ```
 */
export function isMountedEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T & { transitionStatus: 'mounted' } {
  return entry?.transitionStatus === 'mounted';
}

/**
 * Checks whether a popover entry is currently in the unmounting exit transition state.
 *
 * @template T - Entry type extending TrailEntryBase.
 * @param entry - Candidate entry object.
 * @returns True if `entry.transitionStatus === 'unmounting'`.
 *
 * @example
 * ```typescript
 * if (isUnmountingEntry(entry)) {
 *   // Entry is currently playing exit animation
 * }
 * ```
 */
export function isUnmountingEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T & { transitionStatus: 'unmounting' } {
  return entry?.transitionStatus === 'unmounting';
}

/**
 * Checks whether a popover entry is currently in the mounting initial transition state.
 *
 * @template T - Entry type extending TrailEntryBase.
 * @param entry - Candidate entry object.
 * @returns True if `entry.transitionStatus === 'mounting'`.
 *
 * @example
 * ```typescript
 * if (isMountingEntry(entry)) {
 *   // Entry is mounting and measuring DOM bounds
 * }
 * ```
 */
export function isMountingEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T & { transitionStatus: 'mounting' } {
  return entry?.transitionStatus === 'mounting';
}
