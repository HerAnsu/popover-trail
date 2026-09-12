/**
 * Definition Factories and Identity Helpers for Configurations and Resolvers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/configDefinitions
 */

import type { PopoverDisplayOptions } from '../types/configTypes';
import type { PopoverResolver } from '../types/storeStateTypes';
import type { PopoverMiddleware } from '../types/middlewareTypes';
import { createBrand, type PopoverKey } from '../types/branded';

/**
 * Constructs a nominal `PopoverKey` branded string identifier.
 */
export function createPopoverKey<T extends string>(key: T): PopoverKey<T> {
  return createBrand<T, 'PopoverKey'>(key);
}

/**
 * Identity helper for defining a `PopoverResolver` with full generic type inference.
 */
export function definePopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return resolver;
}

/** Alias for `definePopoverResolver` for backward compatibility. */
export function createPopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return definePopoverResolver(resolver);
}

/**
 * Identity helper for defining a `PopoverDisplayOptions` configuration object with full autocompletion.
 */
export function definePopoverConfig<T extends PopoverDisplayOptions>(config: T): T {
  return config;
}

/**
 * Identity helper for defining a `PopoverMiddleware` interceptor function with full typing.
 */
export function definePopoverMiddleware<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  middleware: PopoverMiddleware<TData, TContext, TPopoverKey>,
): PopoverMiddleware<TData, TContext, TPopoverKey> {
  return middleware;
}
