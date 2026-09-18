import { logger } from './logger';

export interface SafeCallbackOptions {
  readonly contextName?: string;
  readonly onError?: (error: unknown) => void;
}

/**
 * Fault-isolated callback executor.
 * Protects state machines, batching loops, and subscribers from throwing unhandled consumer exceptions.
 * Catches errors, logs diagnostics, and optionally dispatches to an error handler.
 *
 * @template TArgs - Argument tuple type.
 * @template TReturn - Callback return value type.
 * @param fn - Consumer callback function (safely handles null/undefined).
 * @param args - Arguments to pass into the callback.
 * @param options - Configuration including contextName for logging and custom onError hook.
 * @returns Resulting return value, or `undefined` if execution failed or fn is not a function.
 *
 * @example
 * ```typescript
 * const result = safeCallback(onOpenChange, [true], {
 *   contextName: 'usePopoverCard',
 *   onError: (err) => console.error('Listener failed', err),
 * });
 * ```
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
