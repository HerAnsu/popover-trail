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

export const globalPopoverEventBus: PopoverEventBus = new PopoverEventBus({
  mirrorToGlobalBus: false,
});
PopoverEventBus.defaultGlobalBus = globalPopoverEventBus;

export function createPopoverEventBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(options?: PopoverEventBusOptions): PopoverEventBus<TData, TPopoverKey> {
  return new PopoverEventBus<TData, TPopoverKey>(options);
}
