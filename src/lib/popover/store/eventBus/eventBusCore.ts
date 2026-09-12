/**
 * Core PopoverEventBus Engine with Multi-Channel Routing.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module eventBusCore
 */

import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { warnIfOverCapacity } from './eventBusCapacity';
import { dispatchEventWithMirror } from './eventBusEmitter';
import { EventBusSubscriptions } from './eventBusSubscriptions';
import type {
  PopoverEventPayloadMap,
  PopoverEventType,
  PopoverEventBusOptions,
} from './eventBusTypes';
import { EventBusRouter } from './eventBusRouter';
import { EventBusSubscriptionManager } from './eventBusSubscriptionManager';

export class PopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
> {
  public static defaultGlobalBus?: PopoverEventBus<unknown, string>;
  public readonly maxListeners = 100;
  private lazyTarget?: EventTarget;
  private readonly router = new EventBusRouter<TData, TPopoverKey>();
  private readonly subs = new EventBusSubscriptionManager<TData, TPopoverKey>();
  private readonly listeners = new EventBusSubscriptions(
    () => this.target,
    this.subs,
    this.router,
    () => this.checkCapacity(),
  );
  private readonly options?: PopoverEventBusOptions;

  constructor(options?: PopoverEventBusOptions) {
    this.options = options;
  }

  private get target(): EventTarget {
    return this.lazyTarget ?? (this.lazyTarget = new EventTarget());
  }

  public get size(): number {
    return this.router.wildcardListeners.size + this.subs.size;
  }

  private checkCapacity(): void {
    warnIfOverCapacity(this.size, this.maxListeners);
  }

  public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean {
    return dispatchEventWithMirror(
      this.target,
      this.router,
      type,
      payload,
      this.options,
      PopoverEventBus.defaultGlobalBus,
      this,
    );
  }

  public readonly on = this.listeners.on.bind(this.listeners);
  public readonly onAny = this.listeners.onAny.bind(this.listeners);
  public readonly onKey = this.listeners.onKey.bind(this.listeners);
  public readonly once = this.listeners.once.bind(this.listeners);
  public readonly off = this.listeners.off.bind(this.listeners);

  public clear(): void {
    if (this.lazyTarget) this.subs.clear(this.lazyTarget);
    this.router.clear();
  }

  public dispose(): void {
    this.clear();
  }
  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
  public [Symbol.dispose](): void {
    this.dispose();
  }
}
