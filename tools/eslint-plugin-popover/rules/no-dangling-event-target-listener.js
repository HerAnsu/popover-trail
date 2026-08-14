/**
 * @fileoverview Require retaining a reference or cleanup for custom EventTarget listeners.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce cleanup for listeners attached to custom EventTarget objects.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireListenerCleanup: 'Ensure removeEventListener is called for listener attached to {{ target }}.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.callee.object &&
          node.callee.object.name === 'customTarget'
        ) {
          context.report({
            node,
            messageId: 'requireListenerCleanup',
            data: { target: 'customTarget' },
          });
        }
      },
    };
  },
};
