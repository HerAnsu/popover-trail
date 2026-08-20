/**
 * @fileoverview Recommend timeout option when requesting Web Locks across browser tabs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend timeout or signal option when acquiring navigator.locks.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestLockTimeout:
        'Web Locks request for "{{ lockName }}" should provide a timeout signal or options object.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'request' &&
          node.callee.object &&
          node.callee.object.property &&
          node.callee.object.property.name === 'locks' &&
          node.arguments.length === 2 &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal'
        ) {
          context.report({
            node,
            messageId: 'suggestLockTimeout',
            data: { lockName: String(node.arguments[0].value) },
          });
        }
      },
    };
  },
};
