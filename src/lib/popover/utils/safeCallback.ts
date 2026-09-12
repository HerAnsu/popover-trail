import { logger } from './logger';

export interface SafeCallbackOptions {
  readonly contextName?: string;
  readonly onError?: (error: unknown) => void;
}

/**
 * Fault-isolated callback executor.
 * Protects state machines, batching loops, and subscribers from throwing unhandled consumer exceptions.
 */
export function safeCallback<TArgs extends unknown[], TReturn>(
  fn: ((...args: TArgs) => TReturn) | null | undefined,
  args: TArgs,
  options?: SafeCallbackOptions,
): TReturn | undefined {
  if (typeof fn !== 'function') {
    return undefined;
  }

  try {
    return fn(...args);
  } catch (error) {
    const context = options?.contextName ? `[${options.contextName}]` : '[safeCallback]';
    logger.error(`${context} Unhandled exception in user callback:`, error);
    if (options?.onError) {
      try {
        options.onError(error);
      } catch (nestedError) {
        logger.error(`${context} Exception in onError handler:`, nestedError);
      }
    }
    return undefined;
  }
}
