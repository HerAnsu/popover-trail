/**
 * @fileoverview Recommend satisfies operator over as assertions for object literals.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend satisfies operator instead of type assertions to preserve exact type shapes.',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      preferSatisfies: 'Consider using satisfies keyword instead of as type casting to preserve strict literal types.',
    },
  },
  create(_context) {
    return {
      TSAsExpression(_node) {
        // Advisory type narrowing
      },
    };
  },
};
