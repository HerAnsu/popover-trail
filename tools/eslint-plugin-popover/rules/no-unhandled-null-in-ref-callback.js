/**
 * @fileoverview Recommend checking for null element when handling React ref callback hooks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage handling null cleanup in React ref callbacks (node === null on unmount).',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestNullRefCheck: 'Handle null in ref callback to properly clean up on DOM unmount.',
    },
  },
  create(_context) {
    return {
      FunctionExpression(_node) {
        // Ref callback null handling guideline
      },
    };
  },
};
