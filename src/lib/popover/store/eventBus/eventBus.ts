/**
 * Extensible, Zero-Any, Future-Proof EventBus Engine for PopoverTrail.
 * Built on the native EventTarget standard with Declaration Merging support.
 *
 * @module eventBus
 */

import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { PopoverEventBus } from './eventBusCore';
import type { PopoverEventBusOptions } from './eventBusTypes';

export * from './eventBusTypes';
export * from './eventBusDispatch';
export { PopoverEventBus } from './eventBusCore';

/**
 * Global singleton event bus instance used for cross-tree and application-wide event mirroring.
 */
export const globalPopoverEventBus: PopoverEventBus = new PopoverEventBus({
  mirrorToGlobalBus: false,
});
PopoverEventBus.defaultGlobalBus = globalPopoverEventBus;

/**
 * Creates an isolated `PopoverEventBus` instance for handling store lifecycle events.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param options - Configuration options such as whether to mirror events to the global bus.
 * @returns Initialized `PopoverEventBus` instance.
 *
 * @example
 * ```typescript
 * const bus = createPopoverEventBus();
 *
 * const unsubscribe = bus.on('popover:open_root', (e) => {
 *   console.log('Root popover opened:', e.detail.key);
 * });
 * ```
 */
export function createPopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(options?: PopoverEventBusOptions): PopoverEventBus<TData, TPopoverKey> {
  return new PopoverEventBus<TData, TPopoverKey>(options);
}
