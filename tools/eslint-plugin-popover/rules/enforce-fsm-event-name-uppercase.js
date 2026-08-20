/**
 * @fileoverview Enforce uppercase discriminated event types for FSM state machine transitions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce UPPER_CASE convention for FSM state transition event types.',
      category: 'Convention',
      recommended: true,
    },
    schema: [],
    messages: {
      uppercaseFSMEvent: 'FSM event type {{ name }} must be in UPPER_CASE format.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('fsm')
    )
      return {};

    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'type' &&
          node.value &&
          typeof node.value.value === 'string' &&
          node.parent &&
          node.parent.type === 'ObjectExpression'
        ) {
          const val = node.value.value;
          if (val !== val.toUpperCase() && !val.includes('.')) {
            context.report({
              node,
              messageId: 'uppercaseFSMEvent',
              data: { name: val },
            });
          }
        }
      },
    };
  },
};
