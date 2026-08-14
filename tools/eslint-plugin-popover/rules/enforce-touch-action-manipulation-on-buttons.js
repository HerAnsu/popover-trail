/**
 * @fileoverview Recommend touch-action: manipulation on buttons to eliminate mobile tap delay.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend touch-action: manipulation on interactive pin and close buttons.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestTouchManipulation: 'Consider touchAction: "manipulation" on button to eliminate mobile tap delay.',
    },
  },
  create(_context) {
    return {
      JSXElement(_node) {
        // Mobile tap performance guideline
      },
    };
  },
};
