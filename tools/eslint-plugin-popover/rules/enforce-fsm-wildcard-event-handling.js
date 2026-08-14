/**
 * @fileoverview Recommend wildcard event handling or default fallback in FSM machine configs.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend fallback transition handling in FSM state machines.',
      category: 'FSM',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestWildcard: 'FSM machine definition {{ name }} should provide a fallback state transition handler.',
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
          const src = context.getSourceCode ? context.getSourceCode().getText(node.arguments[0]) : '';
          if (!src.includes('*') && !src.includes('default') && !src.includes('fallback')) {
            context.report({
              node,
              messageId: 'suggestWildcard',
              data: { name: 'stateMachine' },
            });
          }
        }
      },
    };
  },
};
