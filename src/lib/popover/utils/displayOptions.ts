/**
 * Display Options and Interaction Flag Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/displayOptions
 */

import type { OpenRootOptions, OpenNestedOptions, TrailEntry } from '../types';
import { pickRecordKeys } from './cleanObject';

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

export function isDisplayOptionKey(key: string): key is DisplayOptionKey {
  return DISPLAY_OPTION_KEYS_SET.has(key as DisplayOptionKey);
}

export function extractDisplayOptions<TData = unknown, TPopoverKey extends string = string>(
  entry?:
    | Partial<TrailEntry<TData, TPopoverKey>>
    | Partial<Record<DisplayOptionKey, unknown>>
    | null,
): OpenRootOptions & OpenNestedOptions {
  if (!entry) return {};
  return pickRecordKeys(
    entry as Partial<Record<DisplayOptionKey, unknown>>,
    DISPLAY_OPTION_KEYS_SET,
  ) as OpenRootOptions & OpenNestedOptions;
}

export function mergeDisplayOptions(
  base: OpenRootOptions & OpenNestedOptions,
  overrides?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): OpenRootOptions & OpenNestedOptions {
  if (!overrides) return { ...base };
  return { ...base, ...extractDisplayOptions(overrides) };
}

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
