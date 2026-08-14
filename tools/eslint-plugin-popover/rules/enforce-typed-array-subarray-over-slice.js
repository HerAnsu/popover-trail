/**
 * @fileoverview Recommend subarray over slice on TypedArrays for zero-copy views.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend TypedArray.subarray() instead of slice() to avoid copying underlying buffer memory.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      useSubarray: 'Use .subarray() instead of .slice() on TypedArray for zero-copy windowing.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'slice' &&
          node.callee.object &&
          node.callee.object.name &&
          (node.callee.object.name.endsWith('Array') || node.callee.object.name.includes('typed'))
        ) {
          context.report({
            node,
            messageId: 'useSubarray',
          });
        }
      },
    };
  },
};
