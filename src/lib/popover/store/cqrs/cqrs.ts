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

export interface PopoverCQRSBuses<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
  TDataMap extends Record<string, unknown> = DefaultDataMap<TPopoverKey, TData>,
> {
  readonly query: PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>;
  readonly command: PopoverCommandBus<TData, TContext, TPopoverKey>;
  readonly queryBus: PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>;
  readonly commandBus: PopoverCommandBus<TData, TContext, TPopoverKey>;
  dispose: () => void;
  [DISPOSE_SYMBOL]: () => void;
  [Symbol.dispose]: () => void;
}

type StoreInput<TData, TContext, TPopoverKey extends string> =
  | PopoverStore<TData, TContext, TPopoverKey>
  | StoreApi<PopoverStore<TData, TContext, TPopoverKey>>
  | (() => PopoverStore<TData, TContext, TPopoverKey>);

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
