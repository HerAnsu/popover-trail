/**
 * CQRS Architecture Buses for popover-trail store.
 * Coordinates queries and commands through dedicated bus instances.
 *
 * @module cqrs
 */

import type { DefaultDataMap, PopoverStore } from '../../types';
import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import type { StoreApi } from 'zustand/vanilla';
import { PopoverQueryBus } from './cqrsQueryBus';
import { PopoverCommandBus } from './cqrsCommandBus';
import { DISPOSE_SYMBOL } from '../../utils/disposable';

export * from './cqrsCommandBus';
export * from './cqrsQueryBus';

/**
 * Paired CQRS Bus interfaces providing separated query inspection and command mutation channels.
 *
 * @template TData - Default popover payload data.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @template TDataMap - Type registry mapping specific keys to specific data types.
 */
export interface PopoverCQRSBuses<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
  TDataMap extends Record<string, unknown> = DefaultDataMap<TPopoverKey, TData>,
> {
  /** Query bus for non-mutating state queries and selectors. */
  readonly query: PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>;
  /** Command bus for dispatching popover state mutations. */
  readonly command: PopoverCommandBus<TData, TContext, TPopoverKey>;
  /** Query bus alias. */
  readonly queryBus: PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>;
  /** Command bus alias. */
  readonly commandBus: PopoverCommandBus<TData, TContext, TPopoverKey>;
  /** Disposes both buses and frees resources. */
  dispose: () => void;
  /** RAII disposal symbol. */
  [DISPOSE_SYMBOL]: () => void;
  /** Explicit resource disposal symbol. */
  [Symbol.dispose]: () => void;
}

type StoreInput<TData, TContext, TPopoverKey extends string> =
  | PopoverStore<TData, TContext, TPopoverKey>
  | StoreApi<PopoverStore<TData, TContext, TPopoverKey>>
  | (() => PopoverStore<TData, TContext, TPopoverKey>);

/**
 * Creates paired `query` and `command` buses for the given popover store instance.
 *
 * @template TData - Default popover payload data.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @template TDataMap - Type registry mapping specific keys to specific data types.
 * @param store - Popover store instance, Zustand StoreApi, or state accessor function.
 * @returns Initialized `PopoverCQRSBuses` instance containing query and command buses.
 *
 * @example
 * ```typescript
 * const { query, command } = createCQRSBuses(store);
 *
 * // Query state without triggering mutations:
 * const openCount = query.totalCount;
 *
 * // Dispatch state mutations via command bus:
 * command.clearAll();
 * ```
 */
export function createCQRSBuses<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
  TDataMap extends Record<string, unknown> = DefaultDataMap<TPopoverKey, TData>,
>(
  store: StoreInput<TData, TContext, TPopoverKey>,
): PopoverCQRSBuses<TData, TContext, TPopoverKey, TDataMap> {
  const getStore: () => PopoverStore<TData, TContext, TPopoverKey> =
    typeof store === 'function'
      ? store
      : 'getState' in store
        ? () => store.getState()
        : () => store;
  const query = new PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>(getStore);
  const command = new PopoverCommandBus<TData, TContext, TPopoverKey>(getStore);

  const dispose = (): void => {
    query.dispose();
    command.dispose();
  };

  return {
    query,
    command,
    queryBus: query,
    commandBus: command,
    dispose,
    [DISPOSE_SYMBOL]: dispose,
    [Symbol.dispose]: dispose,
  };
}
