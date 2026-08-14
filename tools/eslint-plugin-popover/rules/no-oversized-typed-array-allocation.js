/**
 * @fileoverview Disallow monolithic TypedArray allocations exceeding 500,000 elements without chunking.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow large single TypedArray allocations in library runtime.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noOversizedAllocation: 'TypedArray allocation size {{ size }} is excessively large; use chunked buffers or ring buffers.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'Float64Array' || node.callee.name === 'Int32Array') &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'number' &&
          node.arguments[0].value > 500000
        ) {
          context.report({
            node,
            messageId: 'noOversizedAllocation',
            data: { size: String(node.arguments[0].value) },
          });
        }
      },
    };
  },
};
