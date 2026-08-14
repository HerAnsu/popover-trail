'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer WeakMap for associating metadata with DOM nodes to allow garbage collection',
      category: 'Memory & GC',
      recommended: true,
    },
    schema: [],
    messages: {
      useWeakMap: 'Consider using WeakMap instead of standard Map when storing DOM elements as keys to prevent GC leaks.',
    },
  },
  create(_context) {
    return {};
  },
};
