/**
 * @fileoverview Recommend timeout safeguards on asynchronous resolver functions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Recommend timeout guards or AbortSignal.timeout() for long-running card hydration resolvers.',
      category: 'Resilience',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestResolverTimeout:
        'Resolver function {{ name }} performs async fetch without a timeout race or signal.',
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
        if (
          node.async &&
          node.id &&
          node.id.name.startsWith('resolve') &&
          node.params.length === 1
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body.includes('fetch(') && !body.includes('signal') && !body.includes('timeout')) {
            context.report({
              node,
              messageId: 'suggestResolverTimeout',
              data: { name: node.id.name },
            });
          }
        }
      },
    };
  },
};
