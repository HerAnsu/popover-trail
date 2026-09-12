/**
 * Middleware and Interceptor Type Definitions for popover-trail.
 *
 * @module types/middlewareTypes
 */

import type { PopoverStateData } from './storeStateTypes';

export type TypedMiddlewarePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Partial<PopoverStateData<TData, TContext, TPopoverKey>> & {
  targetKey?: TPopoverKey;
};

export type PopoverMiddleware<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = (
  patch: TypedMiddlewarePatch<TData, TContext, TPopoverKey>,
  state: PopoverStateData<TData, TContext, TPopoverKey>,
) => TypedMiddlewarePatch<TData, TContext, TPopoverKey> | false | void;
