/**
 * @fileoverview Require bounding max history undo stack depth to prevent memory leaks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce maxUndoSteps configuration when instantiating HistoryManager.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      requireHistoryLimit:
        'HistoryManager initialization should configure a maximum stack size limit.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('history')
    )
      return {};

    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'HistoryManager' && node.arguments.length === 0) {
          context.report({
            node,
            messageId: 'requireHistoryLimit',
          });
        }
      },
    };
  },
};
