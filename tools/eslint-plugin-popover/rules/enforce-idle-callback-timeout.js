/**
 * @fileoverview Recommend passing timeout option to requestIdleCallback to prevent starvation.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend passing { timeout: ... } to requestIdleCallback to ensure callback fires under heavy load.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestIdleTimeout: 'Pass a { timeout: number } options object as second argument to requestIdleCallback.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'requestIdleCallback' ||
            (node.callee.property && node.callee.property.name === 'requestIdleCallback')) &&
          node.arguments.length === 1
        ) {
          context.report({
            node,
            messageId: 'suggestIdleTimeout',
          });
        }
      },
    };
  },
};
