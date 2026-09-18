import { isNonEmptyString } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/**
 * Validates that a requested key is present in the schema definition.
 * Emits dev warning `PT-108` if the key is missing or not a non-empty string.
 *
 * @param hasKey - True if schema contains the node definition.
 * @param key - Popover key being resolved.
 *
 * @example
 * ```typescript
 * validateSchemaKey(schema.has('profile'), 'profile');
 * ```
 */
export function validateSchemaKey(hasKey: boolean, key: string): void {
  if (!isDevEnv()) return;

  if (!hasKey || !isNonEmptyString(key)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.UNDEFINED_SCHEMA_KEY,
      message: `Attempted to resolve data for key "${key}" which is not defined in the schema.`,
    });
  }
}

/**
 * Validates that a schema node does not declare itself as its own direct child.
 * Emits dev warning `PT-128` if `parentKey` equals `childKey`.
 *
 * @param parentKey - Current schema node identifier.
 * @param childKey - Child node identifier.
 *
 * @example
 * ```typescript
 * validateSchemaCircularChild('profile', 'settings'); // Valid
 * validateSchemaCircularChild('profile', 'profile'); // Emits PT-128 warning in development
 * ```
 */
export function validateSchemaCircularChild(parentKey: string, childKey: string): void {
  if (!isDevEnv()) return;

  if (parentKey === childKey) {
    warnDevDetails(true, {
      code: PopoverWarningCode.SCHEMA_CIRCULAR_CHILD,
      message: `Schema node "${parentKey}" declares itself as a direct child, which creates a circular render loop.`,
    });
  }
}

/**
 * Validates that asynchronous data resolution completes within expected bounds (<= 5000ms).
 * Emits dev warning `PT-129` if resolution duration exceeds 5000ms.
 *
 * @param durationMs - Resolution duration in milliseconds.
 * @param key - Popover key whose data was resolved.
 *
 * @example
 * ```typescript
 * validateResolverTimeout(6200, 'heavy-data'); // Emits PT-129 warning in development
 * ```
 */
export function validateResolverTimeout(durationMs: number, key: string): void {
  if (!isDevEnv()) return;

  if (durationMs > 5000) {
    warnDevDetails(true, {
      code: PopoverWarningCode.RESOLVER_TIMEOUT,
      message: `Resolver for key "${key}" has taken longer than ${durationMs}ms to resolve. Ensure AbortSignal is handled.`,
    });
  }
}
