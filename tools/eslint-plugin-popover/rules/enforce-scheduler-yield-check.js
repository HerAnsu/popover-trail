/**
 * @fileoverview Recommend yielding via scheduler.yield or setTimeout in heavy spatial loops.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend checking navigator.scheduling?.isInputPending in long CPU loops.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestSchedulerYield: 'Heavy loop on {{ name }} could block main thread; consider scheduler.yield() or chunking.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      ForStatement(node) {
        if (
          node.test &&
          node.test.type === 'BinaryExpression' &&
          node.test.right &&
          node.test.right.type === 'Literal' &&
          typeof node.test.right.value === 'number' &&
          node.test.right.value > 50000
        ) {
          context.report({
            node,
            messageId: 'suggestSchedulerYield',
            data: { name: 'large iteration loop' },
          });
        }
      },
    };
  },
};
