/**
 * @fileoverview Disallow negative offset numbers in Floating UI options.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow negative values in Floating UI offset middleware configuration.',
      category: 'Correctness',
      recommended: true,
    },
    schema: [],
    messages: {
      noNegativeOffset: 'Floating UI offset cannot be negative (received {{ val }}).',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'offset' &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'UnaryExpression' &&
          node.arguments[0].operator === '-'
        ) {
          context.report({
            node,
            messageId: 'noNegativeOffset',
            data: { val: `-${node.arguments[0].argument?.value}` },
          });
        }
      },
    };
  },
};
