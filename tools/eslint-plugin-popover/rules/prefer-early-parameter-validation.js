/**
 * @fileoverview Recommend early parameter sanity validation in public entrypoints.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage validating mandatory arguments at the beginning of exported library functions.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      validateParamsEarly: 'Validate required parameters at top of exported function.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Parameter validation guideline
      },
    };
  },
};
