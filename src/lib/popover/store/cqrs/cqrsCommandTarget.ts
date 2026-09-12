/**
 * Target Resolution and Contract for CQRS Command Bus.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/cqrs/cqrsCommandTarget
 */

import type { PopoverActions } from '../../types';

export type CommandBusTarget<TData, TContext, TPopoverKey extends string> =
  | PopoverActions<TData, TContext, TPopoverKey>
  | (() => PopoverActions<TData, TContext, TPopoverKey>)
  | { readonly actions: PopoverActions<TData, TContext, TPopoverKey> }
  | (() => { readonly actions: PopoverActions<TData, TContext, TPopoverKey> });

export function resolveCommandActions<TData, TContext, TPopoverKey extends string>(
  target: CommandBusTarget<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey> {
  const unwrapped = typeof target === 'function' ? target() : target;
  return 'actions' in unwrapped ? unwrapped.actions : unwrapped;
}
