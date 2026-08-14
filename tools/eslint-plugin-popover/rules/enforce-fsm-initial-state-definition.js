/**
 * @fileoverview Enforce that FSM statechart definitions have an explicit initial state property.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce explicit initial property in FSM machine configs.',
      category: 'FSM',
      recommended: true,
    },
    schema: [],
    messages: {
      requireInitialState: 'FSM configuration object must define an "initial" state string property.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || !filename.includes('fsm')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'createStateMachine' &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const hasInitial = node.arguments[0].properties.some(
            (p) => p.key && (p.key.name === 'initial' || p.key.value === 'initial'),
          );
          if (!hasInitial) {
            context.report({
              node: node.arguments[0],
              messageId: 'requireInitialState',
            });
          }
        }
      },
    };
  },
};
