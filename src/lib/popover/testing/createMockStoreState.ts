/**
 * Mock Store State Factory for Unit and Integration Testing in popover-trail.
 * Eliminates double type assertions (`as unknown as PopoverStateData`) in test suites.
 *
 * @module testing/createMockStoreState
 */

import type { PopoverStateData, PopoverResolver } from '../types';
import { getInitialStoreState } from '../store/storeDefaults';

/**
 * Creates a fully initialized, type-safe PopoverStateData fixture with customizable overrides.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param overrides - Partial state properties to override default fixture values.
 * @returns Fully typed, valid PopoverStateData object.
 */
export function createMockStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  overrides?: Partial<PopoverStateData<TData, TContext, TPopoverKey>>,
): PopoverStateData<TData, TContext, TPopoverKey> {
  const defaultResolveData: PopoverResolver<TData, TContext> = () => Promise.resolve({} as TData);
  const base = getInitialStoreState<TData, TContext, TPopoverKey>(defaultResolveData);
  return {
    ...base,
    ...overrides,
  };
}
