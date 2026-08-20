/**
 * @fileoverview Disallow calling store.subscribe inside another store.subscribe listener callback.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow nested subscribe() calls to avoid subscriber proliferation.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noNestedSubscription:
        'Do not subscribe to store inside another subscriber callback; manage lifecycle in component or effect.',
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
        if (node.callee && node.callee.property && node.callee.property.name === 'subscribe') {
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'CallExpression' &&
              parent.callee &&
              parent.callee.property &&
              parent.callee.property.name === 'subscribe'
            ) {
              context.report({
                node,
                messageId: 'noNestedSubscription',
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },
    };
  },
};
