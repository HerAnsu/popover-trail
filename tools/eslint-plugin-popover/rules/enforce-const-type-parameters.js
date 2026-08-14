/**
 * @fileoverview Recommend const type parameters or as const for static enum-like tuple configs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage as const assertions on static tuple definitions.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestAsConst: 'Constant array {{ name }} with string literals should have "as const" assertion.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.name &&
          /^[A-Z_]+$/.test(node.id.name) &&
          node.init &&
          node.init.type === 'ArrayExpression' &&
          node.init.elements.length > 2 &&
          node.init.elements.every((el) => el && el.type === 'Literal' && typeof el.value === 'string') &&
          node.parent &&
          node.parent.kind === 'const'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (!src.includes('as const') && !node.id.typeAnnotation) {
            context.report({
              node,
              messageId: 'suggestAsConst',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};
