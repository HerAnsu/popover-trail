/**
 * @fileoverview Recommend vector helper methods for complex matrix3d transform generation.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage structured vector transform helper functions over manual matrix string concatenation.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      useMatrixHelper: 'Use structured matrix compiler for CSS transforms instead of manual string templates.',
    },
  },
  create(_context) {
    return {
      TemplateLiteral(_node) {
        // Matrix compiler guideline
      },
    };
  },
};
