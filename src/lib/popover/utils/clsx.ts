/**
 * Lightweight zero-dependency className concatenation helper.
 *
 * @module utils/clsx
 */

export function clsx(
  ...inputs: Array<string | boolean | null | undefined | Record<string, boolean | null | undefined>>
): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        if (input[key]) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}
