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
import { and } from '../functional';

const TRANSITION_STATUSES: ReadonlySet<string> = new Set<string>(POPOVER_TRANSITION_STATUSES);

const checkTransitionStatus = and(
  (val: unknown) => typeof val === 'string',
  (val: unknown) => TRANSITION_STATUSES.has(val as string),
);

/** Validates whether an unknown value is a valid PopoverTransitionStatus. */
export function isTransitionStatus(val: unknown): val is PopoverTransitionStatus {
  return checkTransitionStatus(val);
}

/** Checks whether a popover entry is currently in the mounted transition state. */
export function isMountedEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T & { transitionStatus: 'mounted' } {
  return entry?.transitionStatus === 'mounted';
}

/** Checks whether a popover entry is currently in the unmounting exit transition state. */
export function isUnmountingEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T & { transitionStatus: 'unmounting' } {
  return entry?.transitionStatus === 'unmounting';
}

/** Checks whether a popover entry is currently in the mounting initial transition state. */
export function isMountingEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T & { transitionStatus: 'mounting' } {
  return entry?.transitionStatus === 'mounting';
}
