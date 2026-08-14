/**
 * @fileoverview Recommend timeout safety guards in long-running data resolvers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend timeout option in asynchronous worker and card data resolvers.',
      category: 'Concurrency',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestResolverTimeout: 'Consider specifying a timeout limit for async data hydration resolvers.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Advisory timeout guideline
      },
    };
  },
};
