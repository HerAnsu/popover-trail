/**
 * @fileoverview Recommend default fallback values when destructuring array elements.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend fallback defaults when destructuring elements from variable-length arrays.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestArrayDefault: 'Destructuring index {{ idx }} from dynamic array without default fallback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.type === 'ArrayPattern' &&
          node.id.elements.length > 2 &&
          node.init &&
          node.init.type === 'CallExpression'
        ) {
          const hasNoDefaults = node.id.elements.every((el) => el && el.type === 'Identifier');
          if (hasNoDefaults) {
            context.report({
              node,
              messageId: 'suggestArrayDefault',
              data: { idx: String(node.id.elements.length - 1) },
            });
          }
        }
      },
    };
  },
};
