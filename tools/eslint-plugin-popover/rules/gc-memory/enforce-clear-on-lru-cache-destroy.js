'use strict';
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
