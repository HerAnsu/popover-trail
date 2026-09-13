/**
 * Pure String Manipulation and Case Conversion Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/stringUtils
 */

/**
 * Converts camelCase, PascalCase, or snake_case string to kebab-case.
 *
 * @param str - Input string.
 * @returns Kebab-cased string.
 */
export function kebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z0-9])/g, '$1-$2')
    .replace(/[_/]/g, '-')
    .toLowerCase();
}

/**
 * Converts kebab-case or snake_case string to camelCase.
 *
 * @param str - Input string.
 * @returns CamelCased string.
 */
export function camelCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/^[-_]+/, '')
    .replace(/[-_]+(.)/g, (_, c: string) => c.toUpperCase());
}

/**
 * Capitalizes the first character of a string.
 *
 * @param str - Input string.
 * @returns String with first letter capitalized.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Guarantees that a string begins with the specified prefix.
 *
 * @param str - Target string.
 * @param prefix - Desired prefix.
 * @returns String with prefix prepended if not already present.
 */
export function ensurePrefix(str: string, prefix: string): string {
  if (!str) return prefix;
  if (!prefix) return str;
  return str.startsWith(prefix) ? str : `${prefix}${str}`;
}

/**
 * Guarantees that a string terminates with the specified suffix.
 *
 * @param str - Target string.
 * @param suffix - Desired suffix.
 * @returns String with suffix appended if not already present.
 */
export function ensureSuffix(str: string, suffix: string): string {
  if (!str) return suffix;
  if (!suffix) return str;
  return str.endsWith(suffix) ? str : `${str}${suffix}`;
}

/**
 * Truncates a string to maxLength, appending a suffix if truncation occurs.
 *
 * @param str - Input string.
 * @param maxLength - Maximum allowed length.
 * @param suffix - Ellipsis or marker (defaults to '...').
 * @returns Truncated string.
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str || maxLength <= 0) return '';
  if (str.length <= maxLength) return str;
  const safeLength = Math.max(0, maxLength - suffix.length);
  return `${str.slice(0, safeLength)}${suffix}`;
}
