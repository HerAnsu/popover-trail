'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce shallowEqual or equality comparator when usePopoverStore selector returns object/array literal',
      category: 'Context & Store Scoping',
      recommended: true,
    },
    schema: [],
    messages: {
      missingShallowEqual:
        'Selector returning a new object literal should pass `shallowEqual` to `usePopoverStore` to avoid unnecessary re-renders.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee && node.callee.name === 'usePopoverStore' && node.arguments.length === 1) {
          const selector = node.arguments[0];
          if (
            selector &&
            (selector.type === 'ArrowFunctionExpression' || selector.type === 'FunctionExpression')
          ) {
            const body = selector.body;
            if (body && (body.type === 'ObjectExpression' || body.type === 'ArrayExpression')) {
              context.report({
                node,
                messageId: 'missingShallowEqual',
              });
            }
          }
        }
      },
    };
  },
};
