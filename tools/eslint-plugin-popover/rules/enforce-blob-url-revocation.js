/**
 * @fileoverview Require URL.revokeObjectURL cleanup after creating temporary object URLs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce URL.revokeObjectURL() cleanup to release memory after creating blob URLs.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireRevokeObjectURL:
        'Ensure URL.revokeObjectURL(url) is called to release blob URL memory.',
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
          node.callee.object.name === 'URL' &&
          node.callee.property &&
          node.callee.property.name === 'createObjectURL'
        ) {
          const scope = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (scope && !scope.includes('revokeObjectURL')) {
            context.report({
              node,
              messageId: 'requireRevokeObjectURL',
            });
          }
        }
      },
    };
  },
};
