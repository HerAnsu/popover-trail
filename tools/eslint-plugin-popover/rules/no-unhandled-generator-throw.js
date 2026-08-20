/**
 * @fileoverview Recommend try-catch inside generator loops to catch .throw() invocations gracefully.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend try-catch around yield statements in generator step iterators.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestGeneratorTryCatch:
        'Generator function {{ name }} contains yield without enclosing try...catch block.',
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
      FunctionDeclaration(node) {
        if (node.generator && node.body) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node.body) : '';
          if (body.includes('yield ') && !body.includes('try {')) {
            context.report({
              node,
              messageId: 'suggestGeneratorTryCatch',
              data: { name: node.id?.name || 'anonymous' },
            });
          }
        }
      },
    };
  },
};
