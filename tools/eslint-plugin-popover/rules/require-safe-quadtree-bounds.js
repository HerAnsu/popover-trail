'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure spatial QuadTree boundary rects have positive non-zero dimensions',
      category: 'Physics & Spatial',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidBounds: 'Spatial index boundary box must have positive width and height (width > 0, height > 0).',
    },
  },
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee && node.callee.name === 'QuadTree' && node.arguments.length > 0) {
          const arg = node.arguments[0];
          if (arg && arg.type === 'ObjectExpression') {
            for (const prop of arg.properties) {
              if (
                prop.key &&
                (prop.key.name === 'width' || prop.key.name === 'height') &&
                prop.value &&
                prop.value.type === 'Literal' &&
                prop.value.value <= 0
              ) {
                context.report({ node, messageId: 'invalidBounds' });
              }
            }
          }
        }
      },
    };
  },
};
