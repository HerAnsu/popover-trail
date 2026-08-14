/**
 * @fileoverview Require timeout safeguards on async data hydration resolvers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend timeout guards or AbortSignal.timeout() for long-running card hydration resolvers.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestTimeout: 'Async resolver configuration for {{ name }} should specify a timeoutMs parameter.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'createAsyncResolver' || node.callee.name === 'defineResolver') &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const hasTimeout = node.arguments[0].properties.some(
            (p) => p.key && (p.key.name === 'timeout' || p.key.name === 'timeoutMs'),
          );
          if (!hasTimeout) {
            context.report({
              node,
              messageId: 'suggestTimeout',
              data: { name: node.callee.name },
            });
          }
        }
      },
    };
  },
};
