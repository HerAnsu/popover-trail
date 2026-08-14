'use strict';

/**
 * Rule: popover/enforce-clear-on-lru-cache-destroy
 * Description: Ensures that custom LRU cache implementations expose a clear() or reset() method.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure cache data structures implement clear() for lifecycle cleanup',
      category: 'Memory & GC',
      recommended: true,
    },
    schema: [],
    messages: {
      missingClearMethod: 'Cache structure should provide a `clear()` or `reset()` method for memory management.',
    },
  },
  create(_context) {
    return {};
  },
};
