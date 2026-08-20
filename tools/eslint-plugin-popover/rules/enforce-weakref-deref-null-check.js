/**
 * @fileoverview Require checking if WeakRef.deref() returns undefined before property access.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce checking deref() result against undefined before accessing target fields.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      checkDerefResult:
        'Result of {{ name }}.deref() can be undefined after garbage collection; check before accessing properties.',
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
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === 'CallExpression' &&
          node.object.callee &&
          node.object.callee.property &&
          node.object.callee.property.name === 'deref' &&
          !node.optional
        ) {
          context.report({
            node,
            messageId: 'checkDerefResult',
            data: { name: node.object.callee.object?.name || 'weakRef' },
          });
        }
      },
    };
  },
};
