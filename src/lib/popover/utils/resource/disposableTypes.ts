/**
 * Resource Acquisition Is Initialization (RAII) Type Contracts.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/disposableTypes
 */

declare global {
  interface SymbolConstructor {
    readonly dispose: unique symbol;
    readonly asyncDispose: unique symbol;
  }
}

export interface ScopeDisposable {
  dispose: () => void;
}

export interface AsyncScopeDisposable {
  disposeAsync: () => Promise<void>;
}

export const DISPOSE_SYMBOL = (Symbol.dispose ??
  Symbol.for('Symbol.dispose')) as typeof Symbol.dispose;

export const ASYNC_DISPOSE_SYMBOL = (Symbol.asyncDispose ??
  Symbol.for('Symbol.asyncDispose')) as typeof Symbol.asyncDispose;

export type CleanupItem = ScopeDisposable | (() => void) | null | undefined;

export type AsyncCleanupItem =
  | AsyncScopeDisposable
  | ScopeDisposable
  | (() => Promise<void> | void)
  | null
  | undefined;

function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown> {
  return typeof val === 'object' && val !== null;
}

export function getDisposeMethod(d: unknown): (() => void) | undefined {
  if (!isObjectRecord(d)) return undefined;
  const disposeFn = d['dispose'];
  if (typeof disposeFn === 'function') {
    return () => {
      Reflect.apply(disposeFn, d, []);
    };
  }
  const symbolDisposeFn = d[DISPOSE_SYMBOL];
  if (typeof symbolDisposeFn === 'function') {
    return () => {
      Reflect.apply(symbolDisposeFn, d, []);
    };
  }
  return undefined;
}

export function getAsyncDisposeMethod(d: unknown): (() => Promise<void>) | undefined {
  if (!isObjectRecord(d)) return undefined;
  const asyncDisposeFn = d['disposeAsync'];
  if (typeof asyncDisposeFn === 'function') {
    return () => Promise.resolve(Reflect.apply(asyncDisposeFn, d, []));
  }
  const symbolAsyncDisposeFn = d[ASYNC_DISPOSE_SYMBOL];
  if (typeof symbolAsyncDisposeFn === 'function') {
    return () => Promise.resolve(Reflect.apply(symbolAsyncDisposeFn, d, []));
  }
  return undefined;
}
