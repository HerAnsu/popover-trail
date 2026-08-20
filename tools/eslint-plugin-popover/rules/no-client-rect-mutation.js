'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct assignment or mutation of DOMRect properties',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      mutateDOMRect:
        'DOMRect properties are read-only in browsers. Create a new plain object or Rect value object.',
    },
  },
  create(context) {
    return {
      AssignmentExpression(node) {
        if (
          node.left &&
          node.left.type === 'MemberExpression' &&
          node.left.object &&
          node.left.object.name === 'rect' &&
          node.left.property &&
          ['x', 'y', 'width', 'height', 'top', 'bottom', 'left', 'right'].includes(
            node.left.property.name,
          )
        ) {
          context.report({ node, messageId: 'mutateDOMRect' });
        }
      },
    };
  },
};
