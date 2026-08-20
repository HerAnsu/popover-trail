/**
 * @fileoverview Recommend returning empty array or null fallback instead of undefined in store selectors.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend fallback value in state selectors to prevent undefined propagation.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestSelectorFallback:
        'Selector {{ name }} accesses optional state slice without default fallback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('Selectors')
    )
      return {};

    return {
      ArrowFunctionExpression(node) {
        if (
          node.body &&
          node.body.type === 'MemberExpression' &&
          node.body.optional &&
          node.parent &&
          node.parent.type === 'VariableDeclarator' &&
          node.parent.id &&
          node.parent.id.name.startsWith('select')
        ) {
          context.report({
            node,
            messageId: 'suggestSelectorFallback',
            data: { name: node.parent.id.name },
          });
        }
      },
    };
  },
};
