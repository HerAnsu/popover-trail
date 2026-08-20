/**
 * Centralized Display Options and Interaction Flag Utilities for popover-trail.
 * Eliminates quadruple code duplication across domain action slices and store reducers.
 *
 * @module utils/displayOptions
 */

import type { OpenRootOptions, OpenNestedOptions, TrailEntry } from '../types';

/**
 * Immutable tuple of all 27 display and interaction option keys.
 */
export const DISPLAY_OPTION_KEYS = [
  'collision',
  'hover',
  'ariaDescribedby',
  'allowDragWhenUnpinned',
  'allowDragWhenPinned',
  'placement',
  'offset',
  'exitTransitionDuration',
  'baseZIndex',
  'cascadeOffsetStep',
  'cascadeOffsetDirection',
  'enableTilt',
  'maxTiltAngle',
  'tiltSensitivity',
  'dragAxis',
  'tiltFriction',
  'tiltDecay',
  'mountingClassName',
  'unmountingClassName',
  'mountedClassName',
  'stackGroup',
  'layoutStrategy',
  'keyboardShortcuts',
  'focusLockOptions',
  'buttonControls',
  'responsiveMode',
  'onOpen',
  'onClose',
  'onPin',
  'onError',
] as const;

export type DisplayOptionKey = (typeof DISPLAY_OPTION_KEYS)[number];

const DISPLAY_OPTION_KEYS_SET = new Set<string>(DISPLAY_OPTION_KEYS);

/**
 * Checks whether a given string is a valid display option key.
 *
 * @param key - Property key to check.
 * @returns True if key is a member of DISPLAY_OPTION_KEYS.
 */
export function isDisplayOptionKey(key: string): key is DisplayOptionKey {
  return DISPLAY_OPTION_KEYS_SET.has(key);
}

/**
 * Extracts defined display options from a TrailEntry or options container without extra undefined keys.
 *
 * @template TData - Entry data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param entry - Target entry or options bag.
 * @returns Clean, typed OpenRootOptions & OpenNestedOptions dictionary.
 */
export function extractDisplayOptions<TData, TPopoverKey extends string = string>(
  entry?: Partial<TrailEntry<TData, TPopoverKey>> | null,
): OpenRootOptions & OpenNestedOptions {
  if (!entry) return {};

  const extracted: Partial<OpenRootOptions & OpenNestedOptions> = {};

  for (const key of DISPLAY_OPTION_KEYS) {
    if (Object.hasOwn(entry, key)) {
      const val = entry[key];
      if (val !== undefined) {
        Object.assign(extracted, { [key]: val });
      }
    }
  }

  return extracted;
}

/**
 * Immutably merges base and overriding display options.
 *
 * @param base - Base display options.
 * @param overrides - Optional overriding options.
 * @returns Merged display options object.
 */
export function mergeDisplayOptions(
  base: OpenRootOptions & OpenNestedOptions,
  overrides?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): OpenRootOptions & OpenNestedOptions {
  if (!overrides) return { ...base };
  return {
    ...base,
    ...extractDisplayOptions(overrides),
  };
}

/**
 * Shallow equality comparison between two sets of display options to skip redundant allocations.
 *
 * @param a - First display options set.
 * @param b - Second display options set.
 * @returns True if both options sets are structurally identical.
 */
export function areDisplayOptionsEqual(
  a?: Partial<OpenRootOptions & OpenNestedOptions> | null,
  b?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  for (const key of DISPLAY_OPTION_KEYS) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
