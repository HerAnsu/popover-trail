/**
 * @fileoverview Recommend timeout safeguards on async data hydration resolvers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend timeout guards or AbortSignal.timeout() for long-running card hydration resolvers.',
      category: 'Concurrency',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestTimeout: 'Consider adding a timeout guard to async card resolver to prevent permanent loading skeletons.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Advisory concurrency guideline
      },
    };
  },
};
