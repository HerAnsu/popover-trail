/**
 * @fileoverview Enforce { passive: true } option on global scroll or touchmove event listeners.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce passive: true on scroll and touch event listeners for high scroll performance.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      requirePassive:
        'Global scroll and touchmove listeners should specify { passive: true } for optimal framerates.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.arguments &&
          node.arguments[0] &&
          (node.arguments[0].value === 'scroll' || node.arguments[0].value === 'touchmove')
        ) {
          const thirdArg = node.arguments[2];
          if (!thirdArg) {
            context.report({
              node,
              messageId: 'requirePassive',
            });
          }
        }
      },
    };
  },
};
