import { isNonEmptyString } from '../utils/typeGuards';
import { isDevEnv, warnDevDetails, PopoverWarningCode } from './warningEngine';

/** PT-108: Validates schema key presence. */
export function validateSchemaKey(hasKey: boolean, key: string): void {
  if (!isDevEnv()) return;

  if (!hasKey || !isNonEmptyString(key)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.UNDEFINED_SCHEMA_KEY,
      message: `Attempted to resolve data for key "${key}" which is not defined in the schema.`,
    });
  }
}

/** PT-128: Validates schema circular child definitions. */
export function validateSchemaCircularChild(parentKey: string, childKey: string): void {
  if (!isDevEnv()) return;

  if (parentKey === childKey) {
    warnDevDetails(true, {
      code: PopoverWarningCode.SCHEMA_CIRCULAR_CHILD,
      message: `Schema node "${parentKey}" declares itself as a direct child, which creates a circular render loop.`,
    });
  }
}

/** PT-129: Validates resolver timeout duration. */
export function validateResolverTimeout(durationMs: number, key: string): void {
  if (!isDevEnv()) return;

  if (durationMs > 5000) {
    warnDevDetails(true, {
      code: PopoverWarningCode.RESOLVER_TIMEOUT,
      message: `Resolver for key "${key}" has taken longer than ${durationMs}ms to resolve. Ensure AbortSignal is handled.`,
    });
  }
}
