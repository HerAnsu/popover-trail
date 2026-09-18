/**
 * EventBus Capacity and Warning Monitor.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/eventBus/eventBusCapacity
 */

import { logger } from '../../utils/logger';

/**
 * Emits a diagnostic warning if the current number of registered listeners reaches or exceeds the threshold.
 *
 * @param size - Current count of registered listeners.
 * @param maxListeners - Maximum listener threshold before warning.
 */
export function warnIfOverCapacity(size: number, maxListeners: number): void {
  if (size >= maxListeners) {
    logger.warn(
      `[popover-trail]: PopoverEventBus listener count (${size}) reached limit (${maxListeners}).`,
    );
  }
}
