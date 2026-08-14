'use strict';

/**
 * Rule: popover/enforce-typed-event-dispatch
 * Description: Ensure eventBus.emit calls provide a valid string event name
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure eventBus.emit calls provide a valid string event name',
      category: 'Cross-Tab Bus',
      recommended: true,
    },
    schema: [],
    messages: {
      untypedEvent: 'EventBus emit calls must provide non-empty string event identifier.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'eventBus' &&
          node.callee.property &&
          node.callee.property.name === 'emit' &&
          (node.arguments.length === 0 || (node.arguments[0].type === 'Literal' && !node.arguments[0].value))
        ) {
          context.report({ node, messageId: 'untypedEvent' });
        }
      },
    };
  },
};
