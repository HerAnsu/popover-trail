/**
 * @fileoverview Recommend safe area inset awareness in mobile responsive boundary clamping.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage safe area padding consideration on mobile viewports.',
      category: 'Responsive',
      recommended: false,
    },
    schema: [],
    messages: {
      safeAreaSuggestion: 'Consider mobile notch safe areas when clamping fullscreen or mobile popover sheets.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Advisory responsive guideline
      },
    };
  },
};
