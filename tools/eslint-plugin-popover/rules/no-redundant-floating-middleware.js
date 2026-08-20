'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow duplicate middleware calls within the same Floating UI array',
      category: 'Floating UI',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateMiddleware:
        'Middleware `{{name}}` is duplicated in the floating middleware pipeline.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'middleware' &&
          node.value &&
          node.value.type === 'ArrayExpression'
        ) {
          const names = new Set();
          for (const el of node.value.elements) {
            if (el && el.type === 'CallExpression' && el.callee && el.callee.name) {
              if (names.has(el.callee.name)) {
                context.report({
                  node: el,
                  messageId: 'duplicateMiddleware',
                  data: { name: el.callee.name },
                });
              }
              names.add(el.callee.name);
            }
          }
        }
      },
    };
  },
};
