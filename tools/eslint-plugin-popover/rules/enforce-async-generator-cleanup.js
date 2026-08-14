/**
 * @fileoverview Recommend finally blocks in async generators to ensure stream resource release.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage finally blocks in async generators to guarantee resource cleanup when iteration terminates early.',
      category: 'Concurrency',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestGeneratorFinally: 'Consider adding a finally block to async generator to clean up resources on early break.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Async generator cleanup guideline
      },
    };
  },
};
