/**
 * Functional Scoped Resource Lifecycle Runners.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/resourceScope
 */

import {
  getDisposeMethod,
  getAsyncDisposeMethod,
  type ScopeDisposable,
  type AsyncScopeDisposable,
} from './disposableTypes';
import { isDisposable } from './disposableGuards';

function disposeResource(r: ScopeDisposable): void {
  try {
    const fn = getDisposeMethod(r);
    fn?.();
  } catch {
    /* isolated */
  }
}

async function disposeResourceAsync(r: AsyncScopeDisposable | ScopeDisposable): Promise<void> {
  try {
    const asyncFn = getAsyncDisposeMethod(r);
    if (asyncFn) {
      await asyncFn();
    } else if (isDisposable(r)) {
      disposeResource(r);
    }
  } catch {
    /* isolated */
  }
}

export function using<TResource extends ScopeDisposable, TReturn>(
  resource: TResource,
  fn: (res: TResource) => TReturn,
): TReturn {
  try {
    return fn(resource);
  } finally {
    disposeResource(resource);
  }
}

export async function usingAsync<
  TResource extends AsyncScopeDisposable | ScopeDisposable,
  TReturn,
>(
  resource: TResource,
  fn: (res: TResource) => Promise<TReturn>,
): Promise<TReturn> {
  try {
    return await fn(resource);
  } finally {
    await disposeResourceAsync(resource);
  }
}
