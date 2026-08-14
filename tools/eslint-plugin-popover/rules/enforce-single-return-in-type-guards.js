/**
 * @fileoverview Recommend concise single-expression returns in custom type guards.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage clean single return expressions in type guard functions without redundant mutation.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      simplifyTypeGuard: 'Type guard {{ name }} has multiple return branches; consider combining with boolean operators.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.id &&
          node.id.name.startsWith('is') &&
          node.returnType &&
          node.body &&
          node.body.body
        ) {
          const returns = node.body.body.filter((s) => s.type === 'ReturnStatement');
          if (returns.length > 3) {
            context.report({
              node,
              messageId: 'simplifyTypeGuard',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};
