/**
 * @fileoverview Require passing AbortSignal to async fetch or resolver calls when signal is available.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce forwarding AbortSignal to nested async operations for prompt cancellation.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      passSignal:
        'Pass available AbortSignal to async fetch or nested resolver to avoid wasted bandwidth on card close.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'fetch' &&
          node.arguments.length === 1 &&
          context.getSourceCode &&
          context.getSourceCode().getText().includes('signal')
        ) {
          context.report({
            node,
            messageId: 'passSignal',
          });
        }
      },
    };
  },
};
