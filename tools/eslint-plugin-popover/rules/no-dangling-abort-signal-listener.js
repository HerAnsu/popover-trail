/**
 * @fileoverview Recommend removing abort event listener when async operation finishes normally.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage cleaning up signal.addEventListener("abort") listeners upon async completion.',
      category: 'Memory',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestSignalCleanup: 'Consider removing abort listener when operation completes successfully.',
    },
  },
  create(_context) {
    return {
      CallExpression(_node) {
        // AbortSignal memory cleanup guideline
      },
    };
  },
};
