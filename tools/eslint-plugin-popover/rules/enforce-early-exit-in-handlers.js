/**
 * @fileoverview Recommend early return guards at the top of keyboard and event handlers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend early return guard checks at the top of event handler functions.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      preferEarlyExit: 'Consider using early return guards instead of deeply nested if-statements.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Clean control flow guideline
      },
    };
  },
};
