/**
 * @fileoverview Require passive: true option when listening to scroll or touchstart events.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce { passive: true } for scroll and touch listeners to avoid blocking main thread compositor.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      requirePassiveListener:
        'Add { passive: true } option to "{{ event }}" event listener for 60fps scrolling.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          (node.arguments[0].value === 'scroll' || node.arguments[0].value === 'touchstart')
        ) {
          const opts = node.arguments[2];
          if (!opts) {
            context.report({
              node,
              messageId: 'requirePassiveListener',
              data: { event: String(node.arguments[0].value) },
            });
          }
        }
      },
    };
  },
};
