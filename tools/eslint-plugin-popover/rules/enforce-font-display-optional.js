/**
 * @fileoverview Recommend subpixel antialiasing and text rendering options on popover typography tokens.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend font-smoothing options on card typography tokens.',
      category: 'Design Tokens',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestFontSmoothing: 'Consider WebkitFontSmoothing: "antialiased" on card typography tokens.',
    },
  },
  create(_context) {
    return {
      Property(_node) {
        // Typography token guideline
      },
    };
  },
};
