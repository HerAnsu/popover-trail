/**
 * Display Options and Interaction Flag Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/displayOptions
 */

import type { OpenRootOptions, OpenNestedOptions, TrailEntry } from '../types';
import { pickKeys } from './cleanObject';

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
const DISPLAY_OPTION_KEYS_SET: ReadonlySet<DisplayOptionKey> = new Set(DISPLAY_OPTION_KEYS);

/**
 * Checks whether a given string is a valid display option key.
 *
 * @param key - Candidate string key.
 * @returns True if `key` is a known display option property name.
 *
 * @example
 * ```typescript
 * isDisplayOptionKey('placement'); // => true
 * isDisplayOptionKey('unknownProp'); // => false
 * ```
 */
export function isDisplayOptionKey(key: string): key is DisplayOptionKey {
  return DISPLAY_OPTION_KEYS_SET.has(key as DisplayOptionKey);
}

/**
 * Extracts pure display and styling options from a trail entry or raw dictionary.
 * Filters out metadata, internal state, and non-display properties.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param entry - Candidate trail entry or partial options record.
 * @returns Pure display options dictionary.
 *
 * @example
 * ```typescript
 * const options = extractDisplayOptions(trailEntry);
 * console.log(options.placement, options.offset);
 * ```
 */
export function extractDisplayOptions<TData = unknown, TPopoverKey extends string = string>(
  entry?:
    | Partial<TrailEntry<TData, TPopoverKey>>
    | Partial<Record<DisplayOptionKey, unknown>>
    | null,
): OpenRootOptions & OpenNestedOptions {
  if (!entry) return {};
  return pickKeys(
    entry as Partial<Record<DisplayOptionKey, unknown>>,
    DISPLAY_OPTION_KEYS_SET,
  ) as OpenRootOptions & OpenNestedOptions;
}

/**
 * Merges a base display configuration with optional overrides.
 *
 * @param base - Default base display options.
 * @param overrides - Optional overriding options.
 * @returns Consolidated display options.
 *
 * @example
 * ```typescript
 * const merged = mergeDisplayOptions(defaultOptions, { placement: 'bottom-start' });
 * ```
 */
export function mergeDisplayOptions(
  base: OpenRootOptions & OpenNestedOptions,
  overrides?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): OpenRootOptions & OpenNestedOptions {
  if (!overrides) return { ...base };
  return { ...base, ...extractDisplayOptions(overrides) };
}

/**
 * Evaluates shallow value equality between two display options records.
 *
 * @param a - First display options record.
 * @param b - Second display options record.
 * @returns True if all display option properties are strictly equal.
 *
 * @example
 * ```typescript
 * if (!areDisplayOptionsEqual(prevOptions, nextOptions)) {
 *   recomputeLayout();
 * }
 * ```
 */
export function areDisplayOptionsEqual(
  a?: Partial<OpenRootOptions & OpenNestedOptions> | null,
  b?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  for (const key of DISPLAY_OPTION_KEYS) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}
