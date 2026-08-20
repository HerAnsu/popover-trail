/**
 * @fileoverview Disallow duplicate identical transition targets in FSM state configuration.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow duplicate event handlers leading to identical target states in FSM config.',
      category: 'FSM',
      recommended: true,
    },
    schema: [],
    messages: {
      noDuplicateTransition:
        'Duplicate event transition "{{ event }}" defined in state "{{ state }}".',
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
          node.key.name === 'on' &&
          node.value &&
          node.value.type === 'ObjectExpression'
        ) {
          const seen = new Set();
          for (const prop of node.value.properties) {
            const name = prop.key ? prop.key.name || prop.key.value : null;
            if (name) {
              if (seen.has(name)) {
                context.report({
                  node: prop,
                  messageId: 'noDuplicateTransition',
                  data: {
                    event: name,
                    state: node.parent?.parent?.key?.name || 'state',
                  },
                });
              } else {
                seen.add(name);
              }
            }
          }
        }
      },
    };
  },
};
