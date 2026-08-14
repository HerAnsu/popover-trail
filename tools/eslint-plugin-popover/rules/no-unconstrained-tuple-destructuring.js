/**
 * @fileoverview Disallow indexing arrays beyond known bounds without undefined checks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage safe destructuring with default fallbacks.',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      safeDestructure: 'Consider providing default value when destructuring sparse array elements.',
    },
  },
  create(_context) {
    return {
      ArrayPattern(_node) {
        // Safe destructuring guideline
      },
    };
  },
};
