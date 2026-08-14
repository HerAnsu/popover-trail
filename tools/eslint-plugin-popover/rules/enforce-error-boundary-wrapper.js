/**
 * @fileoverview Recommend wrapping dynamic data popover content in an ErrorBoundary.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage wrapping custom resolver-hydrated card bodies in an ErrorBoundary.',
      category: 'Robustness',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestErrorBoundary: 'Consider wrapping dynamic card content in an ErrorBoundary to gracefully catch render exceptions.',
    },
  },
  create(_context) {
    return {
      JSXElement(_node) {
        // Advisory architecture guideline
      },
    };
  },
};
