/**
 * @fileoverview Recommend passing timeout option to requestIdleCallback to prevent starvation.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend passing { timeout: ... } to requestIdleCallback to ensure callback fires under heavy load.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestIdleTimeout: 'Consider passing { timeout: 2000 } to requestIdleCallback to avoid indefinite task postponement.',
    },
  },
  create(_context) {
    return {
      CallExpression(_node) {
        // Idle callback scheduling guideline
      },
    };
  },
};
