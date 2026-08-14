'use strict';

/**
 * Rule: popover/enforce-typed-event-dispatch
 * Description: Prevents dispatching arbitrary untyped string objects to eventBus.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure eventBus events use standard typed schemas',
      category: 'Cross-Tab & Events',
      recommended: true,
    },
    schema: [],
    messages: {
      untypedEvent: 'Event dispatch should conform to PopoverEvent union types.',
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
          node.arguments.length === 0
        ) {
          context.report({
            node,
            messageId: 'untypedEvent',
          });
        }
      },
    };
  },
};
