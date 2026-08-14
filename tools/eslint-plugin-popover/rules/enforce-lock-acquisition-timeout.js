/**
 * @fileoverview Recommend timeout option when requesting Web Locks across browser tabs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend timeout or signal option when acquiring navigator.locks.',
      category: 'Concurrency',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestLockTimeout: 'Consider specifying a timeout or signal when acquiring navigator.locks.',
    },
  },
  create(_context) {
    return {
      CallExpression(_node) {
        // Lock acquisition guideline
      },
    };
  },
};
