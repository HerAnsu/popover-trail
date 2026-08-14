/**
 * @fileoverview Recommend content-visibility auto on hidden or off-screen trail cards.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend content-visibility: auto on large offscreen trail card stacks.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestContentVisibility: 'Consider content-visibility: auto for offscreen popover cards.',
    },
  },
  create(_context) {
    return {
      JSXAttribute(_node) {
        // Advisory rendering guideline
      },
    };
  },
};
