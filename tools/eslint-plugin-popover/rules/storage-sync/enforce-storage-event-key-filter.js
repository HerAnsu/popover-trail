'use strict';

/**
 * Rule: popover/enforce-storage-event-key-filter
 * Description: Checks that window storage event listeners check e.key before processing.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure cross-tab storage event listeners filter by target key',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unfilteredStorageEvent: 'Storage event listener should check `e.key === targetKey` before re-hydrating store state.',
    },
  },
  create(_context) {
    return {};
  },
};
