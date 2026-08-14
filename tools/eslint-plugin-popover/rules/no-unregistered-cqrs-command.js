/**
 * @fileoverview Disallow dispatching empty or invalid CQRS command names.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce non-empty string command name in commandBus.dispatch.',
      category: 'CQRS',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidCommandName: 'CQRS command type must be a valid non-empty string.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('cqrs') && !filename.includes('CQRS')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'dispatch' &&
          node.arguments &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal' &&
          node.arguments[0].value === ''
        ) {
          context.report({
            node: node.arguments[0],
            messageId: 'invalidCommandName',
          });
        }
      },
    };
  },
};
