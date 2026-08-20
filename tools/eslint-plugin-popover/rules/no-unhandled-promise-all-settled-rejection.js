/**
 * @fileoverview Recommend inspecting rejected outcomes when using Promise.allSettled.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend checking item.status === "rejected" when processing Promise.allSettled results.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      checkSettledRejection:
        'Results of Promise.allSettled in {{ name }} should filter or log rejected items.',
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
          node.callee.property.name === 'allSettled' &&
          node.callee.object &&
          node.callee.object.name === 'Promise'
        ) {
          let parent = node.parent;
          while (
            parent &&
            parent.type !== 'FunctionDeclaration' &&
            parent.type !== 'ArrowFunctionExpression'
          ) {
            parent = parent.parent;
          }
          if (parent) {
            const body = context.getSourceCode ? context.getSourceCode().getText(parent) : '';
            if (!body.includes('rejected') && !body.includes('.status')) {
              context.report({
                node,
                messageId: 'checkSettledRejection',
                data: { name: parent.id?.name || 'function' },
              });
            }
          }
        }
      },
    };
  },
};
