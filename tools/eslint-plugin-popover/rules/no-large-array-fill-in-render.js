/**
 * @fileoverview Disallow large Array(size).fill() allocations directly in component render paths.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow large Array(N).fill() allocations in render functions; precompute or use generators.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noLargeArrayInRender: 'Avoid large array allocation (size {{ size }}) in render body; preallocate or memoize.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      NewExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'Array' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'number' &&
          node.arguments[0].value > 500
        ) {
          context.report({
            node,
            messageId: 'noLargeArrayInRender',
            data: { size: node.arguments[0].value },
          });
        }
      },
    };
  },
};
