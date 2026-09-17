/**
 * Lightweight Zero-Allocation className Concatenation Helper.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/clsx
 */

import { isUnsafeKey } from './safeKeys';

function appendRecordClasses(
  rec: Record<string, boolean | null | undefined>,
  classes: string[],
): void {
  for (const key in rec) {
    if (!isUnsafeKey(key) && rec[key]) classes.push(key);
  }
}

/**
 * Lightweight, zero-allocation className concatenation helper.
 * Filters out falsy values and handles conditional class dictionaries while skipping
 * prototype pollution keys (`__proto__`, `constructor`, `prototype`).
 *
 * @param inputs - Variable list of class names, boolean flags, or conditional class maps.
 * @returns Space-delimited concatenated class string.
 *
 * @example
 * ```typescript
 * clsx('popover-card', isActive && 'is-active', { 'is-pinned': isPinned });
 * // => 'popover-card is-active is-pinned'
 * ```
 */
export function clsx(
  ...inputs: Array<string | boolean | null | undefined | Record<string, boolean | null | undefined>>
): string {
  if (inputs.length === 1) {
    const first = inputs[0];
    if (typeof first === 'string') return first;
    if (!first) return '';
  } else if (inputs.length === 2) {
    const a = inputs[0];
    const b = inputs[1];
    if (typeof a === 'string' && typeof b === 'string') {
      if (a && b) return `${a} ${b}`;
      return a || b;
    }
  }

  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      appendRecordClasses(input, classes);
    }
  }
  return classes.join(' ');
}
