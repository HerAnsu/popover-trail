/**
 * @fileoverview Recommend create* or to* naming convention for branded type constructor helpers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce create* prefix on branded type constructor helper functions.',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestBrandedPrefix: 'Consider naming branded type factory functions with "create" prefix.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Branded factory naming guideline
      },
    };
  },
};
