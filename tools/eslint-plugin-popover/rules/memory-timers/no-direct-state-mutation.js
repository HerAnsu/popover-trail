'use strict';

/**
 * Rule: popover/no-direct-state-mutation
 * Description: Disallows direct mutation of store state properties (state.trail.push, state.floating = ...)
 * in store selectors or UI hooks.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct mutations on store state collections',
      category: 'Memory & Timers',
      recommended: true,
    },
    schema: [],
    messages: {
      noDirectStateMutation: 'Direct mutation of `state.{{property}}` is prohibited. State must be treated as immutable through reducers and action dispatchers.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    if (rawFilename.includes('.test.') || rawFilename.includes('tests/')) {
      return {};
    }

    const mutableCollections = new Set(['trail', 'floating', 'offsets', 'pinnedStates', 'zIndexOrder']);

    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.name === 'state' &&
          node.left.property &&
          mutableCollections.has(node.left.property.name)
        ) {
          context.report({
            node,
            messageId: 'noDirectStateMutation',
            data: { property: node.left.property.name },
          });
        }
      },
    };
  },
};
