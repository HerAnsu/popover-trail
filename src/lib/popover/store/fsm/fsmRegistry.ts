/**
 * FSM Registry & Shadow Invariant Watchdog.
 * Tracks discrete card lifecycles and detects illegal race conditions in dev mode.
 *
 * @module store/fsm/fsmRegistry
 */

import { PopoverCardFSM, createPopoverCardFSM } from './PopoverCardFSM';
import type { PopoverFSMEvent, PopoverStateValue, FSMRegistryOptions } from './fsmTypes';
import { logger } from '../../utils/logger';

export type { FSMRegistryOptions } from './fsmTypes';

export class PopoverFSMRegistry<TData = unknown, TPopoverKey extends string = string> {
  private readonly machines = new Map<TPopoverKey, PopoverCardFSM<TData, TPopoverKey>>();
  private readonly options?: FSMRegistryOptions<TData, TPopoverKey>;
  private isDisposed = false;

  constructor(options?: FSMRegistryOptions<TData, TPopoverKey>) {
    this.options = options;
  }

  public get size(): number {
    return this.machines.size;
  }

  public getOrCreate(key: TPopoverKey): PopoverCardFSM<TData, TPopoverKey> {
    const existing = this.machines.get(key);
    if (existing) return existing;
    const fsm = createPopoverCardFSM<TData, TPopoverKey>(key);
    this.machines.set(key, fsm);
    return fsm;
  }

  public get(key: TPopoverKey): PopoverCardFSM<TData, TPopoverKey> | undefined {
    return this.machines.get(key);
  }

  public send(key: TPopoverKey, event: PopoverFSMEvent<TData, TPopoverKey>): void {
    if (this.isDisposed) return;
    const fsm = this.getOrCreate(key);
    const prev = fsm.getState().value;
    fsm.send(event);
    const next = fsm.getState().value;
    if (prev === next) this.notifyIllegalTransition(key, prev, event);
  }

  public getStatusBit(key: TPopoverKey): number {
    return this.machines.get(key)?.getStatusBit() ?? 0;
  }

  public destroy(key: TPopoverKey): void {
    this.machines.get(key)?.dispose();
    this.machines.delete(key);
  }

  public destroyAll(): void {
    this.machines.forEach((fsm) => fsm.dispose());
    this.machines.clear();
  }

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

export function createPopoverFSMRegistry<TData = unknown, TPopoverKey extends string = string>(
  options?: FSMRegistryOptions<TData, TPopoverKey>,
): PopoverFSMRegistry<TData, TPopoverKey> {
  return new PopoverFSMRegistry<TData, TPopoverKey>(options);
}
