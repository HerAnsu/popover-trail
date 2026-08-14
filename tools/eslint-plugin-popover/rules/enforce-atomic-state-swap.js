/**
 * @fileoverview Recommend using single functional setState updater instead of multiple consecutive calls.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend batching state changes into a single setState((prev) => ...) updater.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestAtomicSetState: 'Method {{ name }} invokes setState multiple times in sequence; combine into a single updater.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      FunctionDeclaration(node) {
        if (node.body && node.body.body) {
          let count = 0;
          for (const stmt of node.body.body) {
            if (
              stmt.type === 'ExpressionStatement' &&
              stmt.expression &&
              stmt.expression.type === 'CallExpression' &&
              stmt.expression.callee &&
              (stmt.expression.callee.name === 'setState' ||
                (stmt.expression.callee.property && stmt.expression.callee.property.name === 'setState'))
            ) {
              count++;
            }
          }
          if (count > 2) {
            context.report({
              node,
              messageId: 'suggestAtomicSetState',
              data: { name: node.id?.name || 'anonymous' },
            });
          }
        }
      },
    };
  },
};
