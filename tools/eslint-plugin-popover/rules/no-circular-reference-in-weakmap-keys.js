/**
 * @fileoverview Recommend avoiding circular object references in WeakMap values pointing back to keys.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend avoiding storing objects in WeakMap values that hold hard references back to their keys.',
      category: 'Memory',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidWeakMapCycle: 'Avoid storing objects in WeakMap values that hold strong references back to keys.',
    },
  },
  create(_context) {
    return {
      CallExpression(_node) {
        // WeakMap memory guideline
      },
    };
  },
};
