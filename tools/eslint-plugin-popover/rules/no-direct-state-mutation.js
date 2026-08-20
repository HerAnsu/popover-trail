'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct mutating array operations (push, splice, pop) on store state slices in selectors',
      category: 'Memory & Timers',
      recommended: true,
    },
    schema: [],
    messages: {
      mutatingStoreState:
        'Direct array mutation `{{method}}()` is prohibited on state objects. Return immutable copies.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (filename.includes('.test.')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          ['push', 'splice', 'pop', 'shift', 'unshift'].includes(node.callee.property.name)
        ) {
          const obj = node.callee.object;
          if (
            obj &&
            obj.type === 'MemberExpression' &&
            obj.object &&
            (obj.object.name === 'state' || obj.object.name === 'prev')
          ) {
            context.report({
              node,
              messageId: 'mutatingStoreState',
              data: { method: node.callee.property.name },
            });
          }
        }
      },
    };
  },
};
