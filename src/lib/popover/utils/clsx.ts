/**
 * Lightweight zero-dependency className concatenation helper.
 *
 * @module utils/clsx
 */

function appendRecordClasses(
  rec: Record<string, boolean | null | undefined>,
  classes: string[],
): void {
  for (const key in rec) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype' && rec[key]) {
      classes.push(key);
    }
  }
}

export function clsx(
  ...inputs: Array<string | boolean | null | undefined | Record<string, boolean | null | undefined>>
): string {
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
