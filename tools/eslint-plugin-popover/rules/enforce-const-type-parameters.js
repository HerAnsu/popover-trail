/**
 * @fileoverview Recommend const type parameters or as const for static enum-like tuple configs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage as const assertions on static tuple definitions.',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestAsConst: 'Consider adding "as const" to preserve exact literal types on constant arrays.',
    },
  },
  create(_context) {
    return {
      VariableDeclarator(_node) {
        // Type narrowing guideline
      },
    };
  },
};
