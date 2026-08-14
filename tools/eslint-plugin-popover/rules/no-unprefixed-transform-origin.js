/**
 * @fileoverview Recommend explicit coordinate alignment for transform-origin CSS properties.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage explicit transformOrigin values in animated card styles.',
      category: 'Layout',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestTransformOrigin: 'Specify explicit transformOrigin alignment in card animation style.',
    },
  },
  create(_context) {
    return {
      Property(_node) {
        // Layout style convention
      },
    };
  },
};
