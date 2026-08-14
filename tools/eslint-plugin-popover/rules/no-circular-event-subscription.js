/**
 * @fileoverview Disallow synchronously emitting the exact same event type inside its own subscriber.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow synchronously re-emitting the same event inside its listener to prevent infinite event loops.',
      category: 'EventBus',
      recommended: true,
    },
    schema: [],
    messages: {
      noCircularEmit: 'Do not re-emit the same event "{{ event }}" synchronously inside its subscriber callback.',
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
          (node.callee.property.name === 'on' || node.callee.property.name === 'subscribe') &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          node.arguments[1] &&
          (node.arguments[1].type === 'ArrowFunctionExpression' || node.arguments[1].type === 'FunctionExpression')
        ) {
          const eventName = String(node.arguments[0].value);
          const body = context.getSourceCode ? context.getSourceCode().getText(node.arguments[1]) : '';
          if (body.includes(`emit('${eventName}'`) || body.includes(`emit("${eventName}"`)) {
            context.report({
              node,
              messageId: 'noCircularEmit',
              data: { event: eventName },
            });
          }
        }
      },
    };
  },
};
