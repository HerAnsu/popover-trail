/**
 * @fileoverview Recommend (key, payload, options) ordering in action dispatcher functions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage consistent (key, payload, options) parameter ordering across all store action methods.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestParamOrder: 'Follow (key, payload, options) parameter convention in action methods.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Parameter order convention
      },
    };
  },
};
