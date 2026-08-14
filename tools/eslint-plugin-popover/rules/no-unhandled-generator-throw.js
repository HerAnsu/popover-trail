/**
 * @fileoverview Recommend try-catch inside generator loops to catch .throw() invocations gracefully.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend try-catch around yield statements in generator step iterators.',
      category: 'Concurrency',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestGeneratorTryCatch: 'Consider try-catch around yield expressions in generator functions.',
    },
  },
  create(_context) {
    return {
      YieldExpression(_node) {
        // Generator exception guideline
      },
    };
  },
};
