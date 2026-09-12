/**
 * EventBus Capacity and Warning Monitor.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/eventBus/eventBusCapacity
 */

import { logger } from '../../utils/logger';

export function warnIfOverCapacity(size: number, maxListeners: number): void {
  if (size >= maxListeners) {
    logger.warn(
      `[popover-trail]: PopoverEventBus listener count (${size}) reached limit (${maxListeners}).`,
    );
  }
}
