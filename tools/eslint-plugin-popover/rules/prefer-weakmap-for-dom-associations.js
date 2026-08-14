'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer WeakMap for associating metadata with DOM nodes to allow garbage collection',
      category: 'Memory & GC',
      recommended: true,
    },
    schema: [],
    messages: {
      useWeakMap: 'Consider using WeakMap instead of standard Map when storing DOM elements as keys to prevent GC leaks.',
    },
  },
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'Map' && node.typeParameters) {
          const firstParam = node.typeParameters.params && node.typeParameters.params[0];
          if (firstParam && firstParam.typeName && firstParam.typeName.name === 'HTMLElement') {
            context.report({ node, messageId: 'useWeakMap' });
          }
        }
      },
    };
  },
};
