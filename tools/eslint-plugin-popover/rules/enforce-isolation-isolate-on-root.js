/**
 * @fileoverview Recommend isolation: isolate on Portal root elements to contain stacking contexts.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend isolation: isolate on popover portal containers to prevent z-index leakage.',
      category: 'Layout',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestIsolation: 'Consider isolation: isolate on portal container to encapsulate layer stacking.',
    },
  },
  create(_context) {
    return {
      JSXElement(_node) {
        // Advisory portal stacking guideline
      },
    };
  },
};
