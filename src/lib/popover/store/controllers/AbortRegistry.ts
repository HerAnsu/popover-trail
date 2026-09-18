/**
 * AbortRegistry for network and async cancellation management.
 * Provides encapsulated AbortController tracking with [Symbol.dispose].
 */

function createAbortedController(): AbortController {
  const controller = new AbortController();
  controller.abort();
  return controller;
}

/**
 * Registry for managing and cancelling active `AbortController` instances keyed by popover identifiers.
 *
 * When a new controller is registered under an existing key, the prior controller is automatically aborted.
 * Implements standard RAII disposal to abort all active controllers upon store or component teardown.
 *
 * @template TPopoverKey - Key identifying the scope or popover entry.
 *
 * @example
 * ```typescript
 * const registry = new AbortRegistry<string>();
 * const controller = registry.register('card-1');
 *
 * fetch(url, { signal: controller.signal });
 *
 * // Later, cancel card-1's fetch:
 * registry.abortKey('card-1');
 *
 * // Or abort everything on unmount:
 * registry.dispose();
 * ```
 */
export class AbortRegistry<TPopoverKey extends string = string> {
  private readonly controllers = new Map<TPopoverKey, AbortController>();
  private disposed = false;

  /**
   * Indicates whether this registry has been permanently disposed.
   */
  public get isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Number of active, non-aborted controllers currently tracked.
   */
  public get size(): number {
    return this.controllers.size;
  }

  /**
   * Underlying Map of registered controllers.
   */
  public get controllerMap(): Map<TPopoverKey, AbortController> {
    return this.controllers;
  }

  /**
   * Registers a new `AbortController` for the given key, aborting any prior controller for that key.
   * If the registry is already disposed, returns an immediately aborted controller.
   *
   * @param key - Popover or resource key to register.
   * @returns Fresh `AbortController` (or pre-aborted controller if disposed).
   *
   * @example
   * ```typescript
   * const controller = registry.register('item-123');
   * ```
   */
  public register(key: TPopoverKey): AbortController {
    if (this.disposed) return createAbortedController();
    this.abortKey(key);
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  /**
   * Removes a controller from tracking without aborting it (e.g. upon normal completion).
   *
   * @param key - Registered key.
   * @param controller - Optional controller reference to ensure removal only if it matches.
   */
  public remove(key: TPopoverKey, controller?: AbortController): void {
    if (!controller || this.controllers.get(key) === controller) {
      this.controllers.delete(key);
    }
  }

  /**
   * Aborts the controller associated with the specified key and removes it from tracking.
   *
   * @param key - Key to abort.
   *
   * @example
   * ```typescript
   * registry.abortKey('item-123');
   * ```
   */
  public abortKey(key: TPopoverKey): void {
    this.controllers.get(key)?.abort();
    this.controllers.delete(key);
  }

  /**
   * Aborts all controllers associated with the provided sequence of keys.
   *
   * @param keys - Iterable collection of keys to abort.
   *
   * @example
   * ```typescript
   * registry.abortKeys(['card-1', 'card-2']);
   * ```
   */
  public abortKeys(keys?: Iterable<TPopoverKey> | null): void {
    if (!keys) return;
    for (const key of keys) this.abortKey(key);
  }

  /**
   * Aborts all currently tracked controllers and clears the registry.
   *
   * @example
   * ```typescript
   * registry.abortAll();
   * ```
   */
  public abortAll(): void {
    this.controllers.forEach((c) => c.abort());
    this.controllers.clear();
  }

  /**
   * Disposes the registry and aborts all active controllers.
   */
  public dispose(): void {
    this[Symbol.dispose]();
  }

  public [Symbol.dispose](): void {
    if (this.disposed) return;
    this.disposed = true;
    this.abortAll();
  }
}
