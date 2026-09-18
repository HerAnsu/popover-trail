/**
 * FSM Registry & Shadow Invariant Watchdog.
 * Tracks discrete card lifecycles and detects illegal race conditions in dev mode.
 *
 * @module store/fsm/fsmRegistry
 */

import { PopoverCardFSM, createPopoverFSM } from './PopoverCardFSM';
import type { PopoverFSMEvent, PopoverStateValue, FSMRegistryOptions } from './fsmTypes';
import { logger } from '../../utils/logger';

export type { FSMRegistryOptions } from './fsmTypes';

/**
 * Registry managing the lifecycle of finite state machines across all active popovers.
 *
 * Acts as a centralized manager and dev-mode invariant watchdog. Guarantees that each
 * popover card has at most one associated `PopoverCardFSM` instance, dispatches events,
 * and reports illegal state transitions (such as unhandled events or invalid transitions).
 *
 * @template TData - Type of resolved data stored in FSM contexts.
 * @template TPopoverKey - String identifier type for popover keys.
 *
 * @example
 * ```typescript
 * const registry = new PopoverFSMRegistry({
 *   isDev: true,
 *   onIllegalTransition: (key, from, event) => {
 *     console.warn(`Illegal transition on ${key}: ${from} -> ${event.type}`);
 *   },
 * });
 *
 * registry.send('card-1', { type: 'OPEN_ROOT', key: 'card-1' });
 * ```
 */
export class PopoverFSMRegistry<TData = unknown, TPopoverKey extends string = string> {
  private readonly machines = new Map<TPopoverKey, PopoverCardFSM<TData, TPopoverKey>>();
  private readonly options?: FSMRegistryOptions<TData, TPopoverKey>;
  private isDisposed = false;

  /**
   * Creates a new `PopoverFSMRegistry` instance.
   *
   * @param options - Optional registry configuration including dev-mode validation hooks.
   */
  constructor(options?: FSMRegistryOptions<TData, TPopoverKey>) {
    this.options = options;
  }

  /**
   * Total number of currently registered popover state machines.
   */
  public get size(): number {
    return this.machines.size;
  }

  /**
   * Retrieves an existing FSM for the specified key or instantiates a new one in `Idle` state.
   *
   * @param key - Unique popover card identifier.
   * @returns The corresponding `PopoverCardFSM` instance.
   *
   * @example
   * ```typescript
   * const fsm = registry.getOrCreate('user-popover');
   * console.log(fsm.getState().value); // 'Idle'
   * ```
   */
  public getOrCreate(key: TPopoverKey): PopoverCardFSM<TData, TPopoverKey> {
    const existing = this.machines.get(key);
    if (existing) return existing;
    const fsm = createPopoverFSM<TData, TPopoverKey>(key);
    this.machines.set(key, fsm);
    return fsm;
  }

  /**
   * Returns the registered state machine for the key, or `undefined` if none exists.
   *
   * @param key - Popover key to look up.
   * @returns The active FSM instance or `undefined`.
   */
  public get(key: TPopoverKey): PopoverCardFSM<TData, TPopoverKey> | undefined {
    return this.machines.get(key);
  }

  /**
   * Dispatches a lifecycle event to the FSM corresponding to the specified key.
   *
   * If the event produces no state change (illegal or unhandled transition),
   * an illegal transition warning is triggered in dev mode.
   *
   * @param key - Popover key whose FSM should receive the event.
   * @param event - Lifecycle event to dispatch.
   *
   * @example
   * ```typescript
   * registry.send('card-1', { type: 'RESOLVE_SUCCESS', data: { id: 42 } });
   * ```
   */
  public send(key: TPopoverKey, event: PopoverFSMEvent<TData, TPopoverKey>): void {
    if (this.isDisposed) return;
    const fsm = this.getOrCreate(key);
    const prev = fsm.getState().value;
    fsm.send(event);
    const next = fsm.getState().value;
    if (prev === next) this.notifyIllegalTransition(key, prev, event);
  }

  /**
   * Returns the numeric bitmask status flag for the specified popover key (or 0 if absent).
   *
   * @param key - Popover key to inspect.
   * @returns Bitmask representing the current FSM state.
   */
  public getStatusBit(key: TPopoverKey): number {
    return this.machines.get(key)?.getStatusBit() ?? 0;
  }

  /**
   * Disposes and unregisters the state machine for the specified key.
   *
   * @param key - Popover key to destroy.
   */
  public destroy(key: TPopoverKey): void {
    this.machines.get(key)?.dispose();
    this.machines.delete(key);
  }

  /**
   * Disposes and unregisters all active state machines in the registry.
   */
  public destroyAll(): void {
    this.machines.forEach((fsm) => fsm.dispose());
    this.machines.clear();
  }

  /**
   * Explicit resource disposal contract ([Symbol.dispose]).
   */
  public [Symbol.dispose](): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.destroyAll();
  }

  private notifyIllegalTransition(
    key: TPopoverKey,
    from: PopoverStateValue,
    event: PopoverFSMEvent<TData, TPopoverKey>,
  ): void {
    const { isDev, onIllegalTransition } = this.options ?? {};
    if (!isDev && !onIllegalTransition) return;
    logger.warn(
      `[FSMRegistry] Ignored or illegal transition for key "${key}": from "${from}" with event "${event.type}"`,
    );
    onIllegalTransition?.(key, from, event);
  }
}

/**
 * Creates a new popover FSM registry instance.
 *
 * @template TData - Type of resolved data stored in FSM contexts.
 * @template TPopoverKey - String identifier type for popover keys.
 * @param options - Optional configuration options including dev invariant warnings.
 * @returns Initialized `PopoverFSMRegistry` instance.
 *
 * @example
 * ```typescript
 * const registry = createPopoverFSMRegistry({ isDev: true });
 * ```
 */
export function createPopoverFSMRegistry<TData = unknown, TPopoverKey extends string = string>(
  options?: FSMRegistryOptions<TData, TPopoverKey>,
): PopoverFSMRegistry<TData, TPopoverKey> {
  return new PopoverFSMRegistry<TData, TPopoverKey>(options);
}
