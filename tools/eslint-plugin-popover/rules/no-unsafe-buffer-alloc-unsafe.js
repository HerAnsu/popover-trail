/**
 * @fileoverview Disallow uninitialized Buffer.allocUnsafe allocations.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Buffer.allocUnsafe() without immediate zero-filling; prefer Buffer.alloc().',
      category: 'Security',
      recommended: true,
    },
    schema: [],
    messages: {
      noAllocUnsafe:
        'Avoid Buffer.allocUnsafe() as uninitialized memory may leak sensitive data; use Buffer.alloc().',
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
          node.callee.object &&
          node.callee.object.name === 'Buffer' &&
          node.callee.property &&
          node.callee.property.name === 'allocUnsafe'
        ) {
          context.report({
            node,
            messageId: 'noAllocUnsafe',
          });
        }
      },
    };
  },
};
