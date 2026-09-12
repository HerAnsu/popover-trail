/**
 * AbortRegistry for network and async cancellation management.
 * Provides encapsulated AbortController tracking with [Symbol.dispose].
 */

function createAbortedController(): AbortController {
  const controller = new AbortController();
  controller.abort();
  return controller;
}

export class AbortRegistry<TPopoverKey extends string = string> {
  private readonly controllers = new Map<TPopoverKey, AbortController>();
  private disposed = false;

  public get isDisposed(): boolean {
    return this.disposed;
  }

  public get size(): number {
    return this.controllers.size;
  }

  public get controllerMap(): Map<TPopoverKey, AbortController> {
    return this.controllers;
  }

  public register(key: TPopoverKey): AbortController {
    if (this.disposed) return createAbortedController();
    this.abortKey(key);
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  public remove(key: TPopoverKey, controller?: AbortController): void {
    if (!controller || this.controllers.get(key) === controller) {
      this.controllers.delete(key);
    }
  }

  public abortKey(key: TPopoverKey): void {
    this.controllers.get(key)?.abort();
    this.controllers.delete(key);
  }

  public abortKeys(keys?: Iterable<TPopoverKey> | null): void {
    if (!keys) return;
    for (const key of keys) this.abortKey(key);
  }

  public abortAll(): void {
    this.controllers.forEach((c) => c.abort());
    this.controllers.clear();
  }

  public dispose(): void {
    this[Symbol.dispose]();
  }

  public [Symbol.dispose](): void {
    if (this.disposed) return;
    this.disposed = true;
    this.abortAll();
  }
}
