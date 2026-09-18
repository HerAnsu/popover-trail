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
      suggestAsConst:
        'Constant array {{ name }} with string literals should have "as const" assertion.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      VariableDeclarator(node) {
        if (
          node.id?.name &&
          /^[A-Z_]+$/.test(node.id.name) &&
          node.init?.type === 'ArrayExpression' &&
          node.init?.elements?.length > 2 &&
          node.init?.elements?.every(
            (el) => el?.type === 'Literal' && typeof el?.value === 'string',
          ) &&
          node.parent?.kind === 'const'
        ) {
          const src = context.getSourceCode?.()?.getText?.(node) ?? '';
          if (!src.includes('as const') && !node.id?.typeAnnotation) {
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
